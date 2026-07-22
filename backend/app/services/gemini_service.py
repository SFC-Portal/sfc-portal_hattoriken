import asyncio
import json
import re
from datetime import datetime

import httpx

from app.core.config import settings
from app.models.task import Task

# Gemini自身が429応答のerror.detailsに含めるRetryInfo（例: "retryDelay": "30s"）を拾うためのパターン
_RETRY_DELAY_PATTERN = re.compile(r"([\d.]+)\s*s")

GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

# 恒常的なルールはsystemInstructionに分離し、per-requestプロンプトはタスク固有データのみに絞る
SYSTEM_INSTRUCTION = (
    "あなたはタスク管理アプリのAIアシスタントです。"
    "与えられた親タスクを、指示された条件に従って具体的なサブタスクに分割してください。\n"
    "厳守事項:\n"
    "- 提示された既存サブタスクと重複する内容は生成しない\n"
    "- 日付は親タスクの期間内に収め、YYYY-MM-DD形式で開始日の早い順に並べる\n"
    "- titleは10〜20文字程度で簡潔に、descriptionは1〜2文で具体的な作業内容を書く\n"
    "- 指示された個数の範囲を必ず守る（1個だけの分割や、範囲外の個数は不可）"
)

# responseSchemaで構造を強制すると、この検証環境ではモデルの思考(thought)ステップが省略され
# レイテンシが大幅に改善された（実測: 約30秒 → 6〜8秒）ため、JSON整形もモデル任せにしない。
# 個数は指示分岐（1日/2〜4日/それ以上）のいずれでも常に2〜4件になるよう設計しているため、
# minItems/maxItemsで下限を強制し、指示文だけでは守られない「1個だけ生成」を防ぐ
RESPONSE_SCHEMA = {
    "type": "ARRAY",
    "minItems": 2,
    "maxItems": 4,
    "items": {
        "type": "OBJECT",
        "properties": {
            "title": {"type": "STRING"},
            "description": {"type": "STRING"},
            "start_date": {"type": "STRING"},
            "due_date": {"type": "STRING"},
        },
        "required": ["title", "start_date", "due_date"],
    },
}


class GeminiServiceError(Exception):
    def __init__(self, message: str, retry_after: int | None = None):
        """retry_afterはGemini API自体がレート制限中の場合のみ設定する（何秒後に再試行可能か）"""
        super().__init__(message)
        self.retry_after = retry_after


def _parse_gemini_retry_after(response: httpx.Response) -> int | None:
    header_value = response.headers.get("retry-after")
    if header_value and header_value.isdigit():
        return int(header_value)

    try:
        body = response.json()
        for detail in body.get("error", {}).get("details", []):
            delay = detail.get("retryDelay")
            if not delay:
                continue
            match = _RETRY_DELAY_PATTERN.match(delay)
            if match:
                return max(1, round(float(match.group(1))))
    except (ValueError, json.JSONDecodeError):
        pass
    return None


# responseSchemaでJSON出力を強制しても、まれにスキーマ強制用の内部指示文が
# title/descriptionの中に漏れ込むことがある（配列の最後の要素で発生しやすい）。
# 通常の日本語の作業内容には出てこない語の組み合わせで検出する。
_LEAK_MARKERS = (
    "do not include",
    "extra text",
    "parseable",
    "outside the json",
    "outside of the json",
)


def _is_contaminated(items: list) -> bool:
    for item in items:
        if not isinstance(item, dict):
            continue
        text = f"{item.get('title', '')} {item.get('description', '')}".lower()
        if any(marker in text for marker in _LEAK_MARKERS):
            return True
    return False


def _build_user_content(task: Task, effective_start: datetime, effective_due: datetime) -> str:
    existing = (
        "\n".join(
            f"- {s.title} ({_fmt(s.start_date)} ~ {_fmt(s.due_date)})"
            for s in task.sub_tasks
        )
        or "なし"
    )

    days = (effective_due.date() - effective_start.date()).days + 1

    if days <= 1:
        instr = (
            f"期間は1日です({_fmt(effective_start)})。"
            "必ず2〜4個（1個は不可）のサブタスクに分割してください。"
            f"全ての日付は {_fmt(effective_start)} です。"
        )
    elif days <= 4:
        instr = f"期間は{days}日です。1日につき1つのサブタスクを作成し、必ず合計{days}個にしてください。"
    else:
        instr = f"期間は{days}日です。期間を連続させて必ず2〜4個のフェーズに分割してください。"

    return f"""親タスク: "{task.title}"
内容: "{task.description or ''}"
期間: {_fmt(effective_start)} ~ {_fmt(effective_due)}
既存サブタスク（重複禁止）:
{existing}

指示:
{instr}"""


def _fmt(d: datetime | None) -> str:
    return d.date().isoformat() if d else ""


async def generate_subtask_suggestions(
    task: Task, effective_start: datetime, effective_due: datetime
) -> list[dict]:
    if not settings.gemini_api_key:
        raise GeminiServiceError("GEMINI_API_KEYが設定されていません")

    prompt = _build_user_content(task, effective_start, effective_due)
    url = GEMINI_ENDPOINT.format(model=settings.gemini_model)
    payload = {
        "systemInstruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.4,
            "responseMimeType": "application/json",
            "responseSchema": RESPONSE_SCHEMA,
        },
    }

    # gemma-4-31b-itは高負荷時に5xx（"Internal error encountered"等）やタイムアウトを
    # 一定確率で返すため、一時的とみなせるエラーに限り1回だけ再試行する。
    # また、スキーマ強制用の内部指示文がまれに出力内容に漏れ込むことがあるため、
    # そちらも検出できた場合は同じ枠内で1回だけ再試行する。
    for attempt in range(2):
        is_last_attempt = attempt == 1
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    url,
                    params={"key": settings.gemini_api_key},
                    json=payload,
                )
            res.raise_for_status()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                retry_after = _parse_gemini_retry_after(e.response) or 60
                raise GeminiServiceError(
                    "Gemini APIの利用上限に達しました（アプリ全体の制限）", retry_after=retry_after
                ) from e
            if e.response.status_code < 500 or is_last_attempt:
                raise GeminiServiceError(f"Gemini APIへの接続に失敗しました: {e}") from e
            await asyncio.sleep(1.5)
            continue
        except httpx.TimeoutException as e:
            if is_last_attempt:
                raise GeminiServiceError(
                    f"Gemini APIへの接続がタイムアウトしました: {str(e) or type(e).__name__}"
                ) from e
            continue
        except httpx.HTTPError as e:
            raise GeminiServiceError(
                f"Gemini APIへの接続に失敗しました: {str(e) or type(e).__name__}"
            ) from e

        body = res.json()
        try:
            parts = body["candidates"][0]["content"]["parts"]
            # 推論系モデル（gemma-4等）はthought=trueの思考過程パートを先に返すため除外する
            text = next(p["text"] for p in reversed(parts) if not p.get("thought") and "text" in p)
        except (KeyError, IndexError, StopIteration) as e:
            raise GeminiServiceError("Gemini APIの応答が不正です") from e

        cleaned = re.sub(r"```json|```", "", text).strip()
        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError as e:
            raise GeminiServiceError("Gemini APIの応答をJSONとして解析できませんでした") from e

        if not isinstance(parsed, list):
            raise GeminiServiceError("Gemini APIの応答形式が不正です")

        if _is_contaminated(parsed):
            if is_last_attempt:
                raise GeminiServiceError("Gemini APIの応答に不要な文章が混入しました")
            continue

        return parsed
