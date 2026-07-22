import type { Task, TaskPriority, TaskStatus } from "@/types/task";

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "低", medium: "中", high: "高", urgent: "緊急",
};

export function formatTaskDate(d?: string) {
  if (!d) return null;
  // タイムゾーン問題を避けるため日付文字列を直接パース
  const [, m, day] = d.split("T")[0].split("-");
  return `${parseInt(m)}/${parseInt(day)}`;
}

export function isOverdue(d?: string, status?: TaskStatus) {
  if (!d || status === "done") return false;
  // 当日EODまでは期限切れとしない
  const [y, m, day] = d.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, day, 23, 59, 59) < new Date();
}

export function periodText(task: Task) {
  const sDay = task.startDate?.split("T")[0];
  const eDay = task.dueDate?.split("T")[0];
  const s = formatTaskDate(task.startDate);
  const e = formatTaskDate(task.dueDate);
  // 同じ日 or 片方のみ → arrowなし
  if (s && e && sDay !== eDay) return `${s} → ${e}`;
  if (s) return s;
  if (e) return e;
  return null;
}

// 4行以上 or 180文字以上の場合だけ展開ボタンを表示
export function needsExpand(desc?: string) {
  if (!desc?.trim()) return false;
  return (desc.split("\n").length > 3) || (desc.length > 180);
}
