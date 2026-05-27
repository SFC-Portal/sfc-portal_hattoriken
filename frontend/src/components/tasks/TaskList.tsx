"use client";

import { useState } from "react";
import { useTasks } from "@/lib/hooks/useTasks";
import { TaskItem } from "./TaskItem";
import type { TaskStatus } from "@/types/task";

const STATUS_TABS: { label: string; value: TaskStatus | "all" }[] = [
  { label: "すべて", value: "all" },
  { label: "未着手", value: "todo" },
  { label: "進行中", value: "in_progress" },
  { label: "完了", value: "done" },
];

export function TaskList() {
  const [activeStatus, setActiveStatus] = useState<TaskStatus | "all">("all");

  const { data, isLoading, isError } = useTasks(
    activeStatus !== "all" ? { status: activeStatus } : undefined
  );

  return (
    <div className="space-y-4">
      {/* === ステータスフィルター === */}
      <div className="flex gap-1 border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeStatus === tab.value
                ? "border-sfc-blue text-sfc-blue"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* === タスク一覧 === */}
      <div className="space-y-2">
        {isLoading && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-4 h-16 animate-pulse bg-gray-100" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-center py-8 text-red-500 text-sm">
            タスクの取得に失敗しました。再読み込みしてください。
          </p>
        )}

        {!isLoading && !isError && data?.data?.length === 0 && (
          <p className="text-center py-8 text-gray-400 text-sm">
            タスクがありません
          </p>
        )}

        {!isLoading &&
          !isError &&
          data?.data?.map((task) => <TaskItem key={task.id} task={task} />)}
      </div>
    </div>
  );
}
