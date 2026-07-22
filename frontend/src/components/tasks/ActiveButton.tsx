"use client";

import { useUpdateTask } from "@/lib/hooks/useTasks";
import type { Task } from "@/types/task";

export function ActiveButton({ task }: { task: Task }) {
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
