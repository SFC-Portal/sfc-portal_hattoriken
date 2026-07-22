"use client";

import { Fragment, useState, useRef, useEffect, KeyboardEvent } from "react";
import axios from "axios";
import { useUpdateTask, useDeleteTask, useCreateSubtask, useSubdivideTask } from "@/lib/hooks/useTasks";
import { useAiSubdivideStore } from "@/lib/stores/aiSubdivideStore";
import { TaskForm } from "./TaskForm";
import { DateRangePicker } from "./DateRangePicker";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

// === 定数 ===
const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};
const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "低", medium: "中", high: "高", urgent: "緊急",
};

function formatDate(d?: string) {
  if (!d) return null;
  // タイムゾーン問題を避けるため日付文字列を直接パース
  const [, m, day] = d.split("T")[0].split("-");
  return `${parseInt(m)}/${parseInt(day)}`;
}
function isOverdue(d?: string, status?: TaskStatus) {
  if (!d || status === "done") return false;
  // 当日EODまでは期限切れとしない
  const [y, m, day] = d.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, day, 23, 59, 59) < new Date();
}
function periodText(task: Task) {
  const sDay = task.startDate?.split("T")[0];
  const eDay = task.dueDate?.split("T")[0];
  const s = formatDate(task.startDate);
  const e = formatDate(task.dueDate);
  // 同じ日 or 片方のみ → arrowなし
  if (s && e && sDay !== eDay) return `${s} → ${e}`;
  if (s) return s;
  if (e) return e;
  return null;
}
// 4行以上 or 180文字以上の場合だけ展開ボタンを表示
function needsExpand(desc?: string) {
  if (!desc?.trim()) return false;
  return (desc.split("\n").length > 3) || (desc.length > 180);
}

// === サブタスク追加フォーム ===
function SubTaskAddForm({ parentId, onDone }: { parentId: string; onDone: () => void }) {
  const createSubtask = useCreateSubtask();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState<string | undefined>();
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  function submit() {
    const t = title.trim();
    if (!t) return;
    createSubtask.mutate(
      { parentId, input: { title: t, description: description || undefined, startDate, dueDate } },
      { onSuccess: onDone },
    );
  }

  return (
    <div className="card p-4 space-y-3">
      <p className="text-sm font-medium text-gray-600">サブタスクを追加</p>
      <input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") { e.preventDefault(); submit(); }
          if (e.key === "Escape") onDone();
        }}
        placeholder="タスク名 *"
        disabled={createSubtask.isPending}
        className="input-base w-full"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="説明（任意）"
        rows={2}
        disabled={createSubtask.isPending}
        className="input-base w-full resize-none text-sm"
      />
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">期間</label>
        <DateRangePicker
          startDate={startDate}
          endDate={dueDate}
          onChange={(s, e) => { setStartDate(s); setDueDate(e); }}
        />
      </div>
      <p className="text-sm text-gray-500">優先度・タグ・カテゴリは親タスクから自動引き継ぎ</p>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onDone}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5">キャンセル</button>
        <button type="button" onClick={submit}
          disabled={!title.trim() || createSubtask.isPending}
          className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          {createSubtask.isPending ? "追加中…" : "追加"}
        </button>
      </div>
    </div>
  );
}

// === 状態（アクティブ）ボタン ===
function ActiveButton({ task }: { task: Task }) {
  const updateTask = useUpdateTask();
  if (task.status === "done") return null;

  const isActive = task.status === "in_progress";

  function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    updateTask.mutate({ id: task.id, input: { status: isActive ? "todo" : "in_progress" } });
  }

  return (
    <button
      onClick={toggle}
      disabled={updateTask.isPending}
      title={isActive ? "進行中（クリックで停止）" : "開始する"}
      className={`flex-shrink-0 flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full border transition-all ${
        isActive
          ? "bg-sfc-blue text-white border-sfc-blue"
          : "text-gray-500 border-gray-200 hover:border-sfc-blue hover:text-sfc-blue"
      }`}
    >
      <svg
        className="w-3 h-3"
        fill={isActive ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
      {isActive ? "進行中" : "開始"}
    </button>
  );
}

// === 統一タスクカード ===
interface TaskCardProps {
  task: Task;
  depth: number;
  breadcrumb: string[];
}

function TaskCard({ task, depth, breadcrumb }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const subdivideTask = useSubdivideTask();
  const userRateLimitedUntil = useAiSubdivideStore((s) => s.userRateLimitedUntil);
  const apiRateLimitedUntil = useAiSubdivideStore((s) => s.apiRateLimitedUntil);
  const setUserRateLimited = useAiSubdivideStore((s) => s.setUserRateLimited);
  const setApiRateLimited = useAiSubdivideStore((s) => s.setApiRateLimited);
  const now = Date.now();
  const isSubdivideRateLimited =
    (!!userRateLimitedUntil && userRateLimitedUntil > now) ||
    (!!apiRateLimitedUntil && apiRateLimitedUntil > now);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [subtasksOpen, setSubtasksOpen] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  // サブタスクはデフォルトでミニマルビュー
  const [cardExpanded, setCardExpanded] = useState(depth === 0);

  const isDone = task.status === "done";
  const overdue = isOverdue(task.dueDate, task.status);
  const period = periodText(task);
  const hasDesc = !!task.description?.trim();
  const showExpandToggle = needsExpand(task.description);
  const subTasks = task.subTasks ?? [];
  const subTaskCount = subTasks.length;
  const doneCount = subTasks.filter((s) => s.status === "done").length;

  function toggleDone(e: React.MouseEvent) {
    e.stopPropagation();
    updateTask.mutate({ id: task.id, input: { status: isDone ? "todo" : "done" } });
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    const extra = subTaskCount > 0 ? `\nサブタスク${subTaskCount}件も削除されます。` : "";
    if (!window.confirm(`「${task.title}」を削除しますか？${extra}`)) return;
    deleteTask.mutate(task.id);
  }

  function handleAddSubtaskClick(e: React.MouseEvent) {
    e.stopPropagation();
    setSubtasksOpen(true);
    setShowAddSubtask(true);
  }

  function handleSubdivideClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (isSubdivideRateLimited) return;
    setSubtasksOpen(true);
    subdivideTask.mutate(task.id, {
      onError: (err) => {
        const detail = axios.isAxiosError(err)
          ? (err.response?.data as { detail?: string } | undefined)?.detail
          : undefined;
        if (axios.isAxiosError(err) && err.response?.status === 429) {
          const retryAfter = Number(err.response.headers["retry-after"]) || 3600;
          const scope = err.response.headers["x-ratelimit-scope"];
          if (scope === "api") {
            setApiRateLimited(retryAfter);
          } else {
            setUserRateLimited(retryAfter);
          }
          return;
        }
        window.alert(detail || "AI細分化に失敗しました");
      },
    });
  }

  const childBreadcrumb = [...breadcrumb, task.title];
  const isMinimal = depth > 0 && !cardExpanded;

  return (
    <>
      <div
        className={`card transition-opacity ${isDone ? "opacity-60" : ""} ${isMinimal ? "cursor-pointer" : ""}`}
        onClick={isMinimal ? () => setCardExpanded(true) : undefined}
      >
        {/* === パンくず (サブタスクのみ) === */}
        {depth > 0 && (
          <div className="px-4 pt-2.5 flex items-center justify-between min-w-0">
            <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0 overflow-hidden">
              {breadcrumb.map((t, i) => (
                <Fragment key={i}>
                  {i > 0 && <span className="flex-shrink-0 text-gray-400">›</span>}
                  <span className="truncate max-w-[7rem]">{t}</span>
                </Fragment>
              ))}
            </div>
            {/* 展開時に折りたたみボタン */}
            {cardExpanded && (
              <button
                onClick={(e) => { e.stopPropagation(); setCardExpanded(false); }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-2"
                title="折りたたむ"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* === ミニマルビュー === */}
        {isMinimal ? (
          <div className="px-4 py-2.5 flex items-center gap-3">
            {/* 完了チェック */}
            <button
              onClick={toggleDone}
              disabled={updateTask.isPending}
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isDone ? "bg-sfc-blue border-sfc-blue" : "border-gray-300 hover:border-sfc-lightBlue"
              }`}
            >
              {isDone && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            {/* タイトル + 期間 */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-snug truncate ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
                {task.title}
              </p>
              {period && (
                <span className={`text-sm ${overdue ? "text-red-500 font-medium" : "text-gray-500"}`}>
                  {overdue ? "期限切れ " : ""}{period}
                </span>
              )}
            </div>
            {/* 展開インジケーター */}
            <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        ) : (
          /* === フル展開ビュー === */
          <div className="p-4 flex items-start gap-3">
            {/* 完了チェック */}
            <button
              onClick={toggleDone}
              disabled={updateTask.isPending}
              className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isDone ? "bg-sfc-blue border-sfc-blue" : "border-gray-300 hover:border-sfc-lightBlue"
              }`}
            >
              {isDone && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* タイトル・メタ */}
            <div className="flex-1 min-w-0">
              <p className={`font-medium leading-snug ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {period && (
                  <span className={`text-sm ${overdue ? "text-red-600 font-medium" : "text-gray-600"}`}>
                    {overdue ? "期限切れ " : ""}{period}
                  </span>
                )}
                {task.courseName && (
                  <span className="text-sm text-gray-500">{task.courseName}</span>
                )}
                {task.tags?.map((tag) => (
                  <span key={tag} className="text-sm bg-sfc-blue/10 text-sfc-blue px-1.5 py-0.5 rounded-full font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
              {/* 説明 */}
              {hasDesc && (
                <div className="mt-2">
                  <p className={`text-sm text-gray-500 whitespace-pre-wrap leading-relaxed ${
                    showExpandToggle && !descExpanded ? "line-clamp-3" : ""
                  }`}>
                    {task.description}
                  </p>
                  {showExpandToggle && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDescExpanded((v) => !v); }}
                      className="mt-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {descExpanded ? "折りたたむ ↑" : "すべて表示 ↓"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 右側: 状態ボタン・優先度・編集・削除 */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <ActiveButton task={task} />
              <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
                className="text-gray-400 hover:text-sfc-blue transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteTask.isPending}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* === サブタスクセクション === */}
        <div
          className="border-t border-gray-100 px-4 pb-3 pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pl-8">
            {subTaskCount > 0 ? (
              <button
                onClick={() => setSubtasksOpen((v) => !v)}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg
                  className={`w-3 h-3 transition-transform ${subtasksOpen ? "rotate-90" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span>
                  サブタスク {doneCount}/{subTaskCount}
                  <span className="ml-1.5 inline-block w-16 h-1 rounded-full bg-gray-200 align-middle overflow-hidden">
                    <span
                      className="block h-full rounded-full bg-sfc-blue transition-all"
                      style={{ width: `${(doneCount / subTaskCount) * 100}%` }}
                    />
                  </span>
                </span>
              </button>
            ) : (
              <span className="text-sm text-gray-500">サブタスクなし</span>
            )}
            {!isDone && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubdivideClick}
                  disabled={subdivideTask.isPending || isSubdivideRateLimited}
                  title={isSubdivideRateLimited ? "AI細分化は現在ご利用いただけません" : "AIでサブタスクに分割"}
                  className="text-sm font-medium text-gray-600 hover:text-sfc-blue transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                  {subdivideTask.isPending ? "生成中…" : isSubdivideRateLimited ? "利用制限中" : "AI細分化"}
                </button>
                <button
                  onClick={handleAddSubtaskClick}
                  className="text-sm font-medium text-gray-600 hover:text-sfc-blue transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  追加
                </button>
              </div>
            )}
          </div>

          {subtasksOpen && subTaskCount > 0 && (
            <div className="mt-3 pl-8 space-y-2">
              {subTasks.map((sub) => (
                <TaskCard key={sub.id} task={sub} depth={depth + 1} breadcrumb={childBreadcrumb} />
              ))}
            </div>
          )}

          {showAddSubtask && (
            <div className="mt-2 pl-8">
              <SubTaskAddForm parentId={task.id} onDone={() => setShowAddSubtask(false)} />
            </div>
          )}
        </div>
      </div>

      {/* === 編集モーダル === */}
      {showEdit && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}
        >
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {depth === 0 ? "タスクを編集" : "サブタスクを編集"}
            </h2>
            <TaskForm task={task} onSuccess={() => setShowEdit(false)} onCancel={() => setShowEdit(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export function TaskItem({ task }: { task: Task }) {
  return <TaskCard task={task} depth={0} breadcrumb={[]} />;
}
