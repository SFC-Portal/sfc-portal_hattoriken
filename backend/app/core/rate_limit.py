import time
from collections import defaultdict

from fastapi import HTTPException, status


class RateLimiter:
    """プロセス内メモリのみで完結するシンプルなスライディングウィンドウ制限。
    単一プロセスの小規模運用を前提としており、複数ワーカー/インスタンスに
    スケールする場合はRedis等の共有ストアに置き換える必要がある。
    """

    def __init__(self, max_calls: int, period_seconds: float, scope: str | None = None):
        self.max_calls = max_calls
        self.period_seconds = period_seconds
        self.scope = scope
        self._hits: dict[str, list[float]] = defaultdict(list)

    def check(self, key: str) -> None:
        now = time.monotonic()
        window_start = now - self.period_seconds
        hits = self._hits[key]
        while hits and hits[0] < window_start:
            hits.pop(0)

        if len(hits) >= self.max_calls:
            retry_after = max(1, int(hits[0] + self.period_seconds - now) + 1)
            headers = {"Retry-After": str(retry_after)}
            if self.scope:
                headers["X-RateLimit-Scope"] = self.scope
            raise HTTPException(
                status.HTTP_429_TOO_MANY_REQUESTS,
                "リクエストが多すぎます。しばらく待ってから再度お試しください。",
                headers=headers,
            )
        hits.append(now)


# Gemini APIを呼ぶ細分化エンドポイント専用。無料枠のコスト/レート上限を守るため1ユーザーあたり厳しめに絞る。
# scope="user"はフロントが「あなた自身が制限中」と「Gemini API全体が制限中」を区別するためのタグ
subdivide_limiter = RateLimiter(max_calls=10, period_seconds=3600, scope="user")

# API全体に対する簡易フラッド対策（IP単位）。通常のブラウジングでは到達しない緩めの閾値にしてある
global_limiter = RateLimiter(max_calls=300, period_seconds=60, scope="ip")
