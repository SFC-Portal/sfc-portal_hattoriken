"use client";

import { useEffect, useState } from "react";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useAiSubdivideStore } from "@/lib/stores/aiSubdivideStore";

// === AI細分化の説明アイコン ===
function AiFeatureInfo() {
  return (
    <div className="group relative flex items-center gap-1 cursor-default">
      <span className="text-sm text-gray-500 group-hover:text-sfc-blue transition-colors">
        AI細分化とは
      </span>
      <button
        type="button"
        aria-label="AI細分化機能について"
        className="flex text-gray-400 group-hover:text-sfc-blue transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      </button>
      <div
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-600 shadow-lg opacity-0 scale-95 origin-top-right transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 z-10"
      >
        <p className="mb-1 text-sm font-semibold text-gray-900">AI細分化</p>
        <p>
          タイトル・説明・期間をAIが読み取り、ちょうどよい粒度のサブタスクへ自動で分割します。
          各タスクのカードにある「AI細分化」ボタンから利用でき、期間が未設定の場合は今日を基準に分割します。
        </p>
        <p className="mt-2 text-gray-500">
          利用回数には上限があり、1時間あたり10回までご利用いただけます。
        </p>
      </div>
    </div>
  );
}

// === AI細分化の利用制限中メッセージ（レート制限に達している間、上のAiFeatureInfoの代わりに表示）===
// user: このユーザー自身が1時間10回の上限に達した / api: Gemini API自体がアプリ全体で上限に達した（他ユーザー分も含む）
function AiFeatureRateLimited({ until, reason }: { until: number; reason: "user" | "api" }) {
  const remainingMinutes = Math.max(1, Math.ceil((until - Date.now()) / 60_000));
  const message =
    reason === "user"
      ? `AI細分化のご利用回数が上限に達しました（約${remainingMinutes}分後に再度利用できます）`
      : `Gemini APIの利用上限に達しています。アプリ全体の制限のため今しばらくお待ちください（約${remainingMinutes}分後に再度利用できます）`;

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      {message}
    </div>
  );
}

function AiFeatureStatus() {
  const userRateLimitedUntil = useAiSubdivideStore((s) => s.userRateLimitedUntil);
  const apiRateLimitedUntil = useAiSubdivideStore((s) => s.apiRateLimitedUntil);
  const [, forceTick] = useState(0);

  // 制限が設定されている間は定期的に再評価し、期限が切れたら自動でAiFeatureInfoに戻す
  useEffect(() => {
    if (!userRateLimitedUntil && !apiRateLimitedUntil) return;
    const id = setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, [userRateLimitedUntil, apiRateLimitedUntil]);

  const now = Date.now();
  const isUserLimited = !!userRateLimitedUntil && userRateLimitedUntil > now;
  const isApiLimited = !!apiRateLimitedUntil && apiRateLimitedUntil > now;

  if (!isUserLimited && !isApiLimited) {
    return <AiFeatureInfo />;
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {isUserLimited && <AiFeatureRateLimited until={userRateLimitedUntil} reason="user" />}
      {isApiLimited && <AiFeatureRateLimited until={apiRateLimitedUntil} reason="api" />}
    </div>
  );
}

export default function TasksPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">タスク管理</h1>
        <div className="flex items-center gap-3">
          <AiFeatureStatus />
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            タスクを追加
          </button>
        </div>
      </div>

      <TaskList />

      {/* === タスク追加モーダル === */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="card w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">新しいタスク</h2>
            <TaskForm
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
