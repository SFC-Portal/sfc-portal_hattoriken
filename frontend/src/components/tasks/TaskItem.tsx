"use client";

import { useUpdateTask, useDeleteTask } from "@/lib/hooks/useTasks";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "低",
  medium: "中",
  high: "高",
  urgent: "緊急",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function isOverdue(dateStr?: string, status?: TaskStatus) {
  if (!dateStr || status === "done") return false;
  return new Date(dateStr) < new Date();
}

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const isDone = task.status === "done";

  function toggleDone() {
    updateTask.mutate({
      id: task.id,
      input: { status: isDone ? "todo" : "done" },
    });
  }

  function handleDelete() {
    deleteTask.mutate(task.id);
  }

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className={`card p-4 flex items-center gap-3 transition-opacity ${isDone ? "opacity-60" : ""}`}>
      {/* === チェックボックス === */}
      <button
        onClick={toggleDone}
        disabled={updateTask.isPending}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          isDone
            ? "bg-sfc-blue border-sfc-blue"
            : "border-gray-300 hover:border-sfc-lightBlue"
        }`}
        aria-label={isDone ? "未完了に戻す" : "完了にする"}
      >
        {isDone && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* === メインコンテンツ === */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {task.dueDate && (
            <span className={`text-xs ${overdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
              {overdue ? "期限切れ " : "期限 "}
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.courseName && (
            <span className="text-xs text-gray-400 truncate">{task.courseName}</span>
          )}
        </div>
      </div>

      {/* === 優先度バッジ === */}
      <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
        {PRIORITY_LABELS[task.priority]}
      </span>

      {/* === 削除ボタン === */}
      <button
        onClick={handleDelete}
        disabled={deleteTask.isPending}
        className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
        aria-label="削除"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
