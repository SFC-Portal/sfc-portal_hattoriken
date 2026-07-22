"use client";

import { useState } from "react";
import { useTasks } from "@/lib/hooks/useTasks";
import { TaskItem } from "./TaskItem";
import type { TaskStatus, TaskSortBy, TaskSortOrder } from "@/types/task";

const STATUS_TABS: { label: string; value: TaskStatus | "all" }[] = [
  { label: "すべて", value: "all" },
  { label: "未着手", value: "todo" },
  { label: "進行中", value: "in_progress" },
  { label: "完了", value: "done" },
];

const SORT_OPTIONS: { label: string; value: TaskSortBy }[] = [
  { label: "期限", value: "due_date" },
  { label: "優先度", value: "priority" },
  { label: "作成日", value: "created_at" },
];

export function TaskList() {
  const [activeStatus, setActiveStatus] = useState<TaskStatus | "all">("all");
  const [sortBy, setSortBy] = useState<TaskSortBy>("due_date");
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>("asc");

  function toggleOrder() {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }

  const { data, isPending, isError, refetch } = useTasks({
    ...(activeStatus !== "all" && { status: activeStatus }),
    sortBy,
    sortOrder,
  });

  return (
    <div className="space-y-4">
      {/* === ステータスフィルター＋ソート === */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={`flex-shrink-0 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeStatus === tab.value
                  ? "border-sfc-blue text-sfc-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* === ソートコントロール === */}
        <div className="flex items-center gap-2 pb-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as TaskSortBy)}
            className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-sfc-accent"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}順</option>
            ))}
          </select>
          <button
            onClick={toggleOrder}
            className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 hover:bg-gray-50 transition-colors w-8 text-center"
            aria-label={sortOrder === "asc" ? "昇順" : "降順"}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* === タスク一覧 === */}
      <div className="space-y-2">
        {isPending && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-4 h-16 animate-pulse bg-gray-100" />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-8 space-y-2">
            <p className="text-red-500 text-sm">タスクの取得に失敗しました。</p>
            <button
              onClick={() => refetch()}
              className="text-sm text-sfc-blue underline hover:no-underline"
            >
              再試行
            </button>
          </div>
        )}

        {!isPending && !isError && data?.data?.length === 0 && (
          <p className="text-center py-8 text-gray-400 text-sm">タスクがありません</p>
        )}

        {!isPending &&
          !isError &&
          data?.data?.map((task) => <TaskItem key={task.id} task={task} />)}
      </div>
    </div>
  );
}
