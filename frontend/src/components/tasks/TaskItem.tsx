"use client";

import { useState } from "react";
import { useUpdateTask, useDeleteTask } from "@/lib/hooks/useTasks";
import { TaskForm } from "./TaskForm";
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
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const isDone = task.status === "done";
  const overdue = isOverdue(task.dueDate, task.status);
  const hasDescription = !!task.description?.trim();

  function toggleDone() {
    updateTask.mutate({ id: task.id, input: { status: isDone ? "todo" : "done" } });
  }

  function handleDelete() {
    if (!window.confirm(`「${task.title}」を削除しますか？`)) return;
    deleteTask.mutate(task.id);
  }

  return (
    <>
      <div className={`card transition-opacity ${isDone ? "opacity-60" : ""}`}>
        {/* === 上段: チェック・タイトル・バッジ・ボタン === */}
        <div className="p-4 flex items-start gap-3">
          {/* チェックボックス */}
          <button
            onClick={toggleDone}
            disabled={updateTask.isPending}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              isDone ? "bg-sfc-blue border-sfc-blue" : "border-gray-300 hover:border-sfc-lightBlue"
            }`}
            aria-label={isDone ? "未完了に戻す" : "完了にする"}
          >
            {isDone && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* クリックで展開するコンテンツ領域 */}
          <button
            type="button"
            onClick={() => hasDescription && setExpanded((v) => !v)}
            aria-disabled={!hasDescription}
            tabIndex={hasDescription ? 0 : -1}
            className={`flex-1 min-w-0 text-left ${hasDescription ? "cursor-pointer" : "cursor-default"}`}
          >
            <p className={`font-medium leading-snug ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {task.dueDate && (
                <span className={`text-xs ${overdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                  {overdue ? "期限切れ " : "期限 "}{formatDate(task.dueDate)}
                </span>
              )}
              {task.courseName && (
                <span className="text-xs text-gray-400">{task.courseName}</span>
              )}
              {task.tags?.map((tag) => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>

            {/* 説明プレビュー（折りたたみ時: 3行） */}
            {hasDescription && !expanded && (
              <p className="mt-2 text-sm text-gray-500 line-clamp-3 whitespace-pre-wrap">
                {task.description}
              </p>
            )}
          </button>

          {/* 優先度バッジ */}
          <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>

          {/* 編集ボタン */}
          <button
            onClick={() => setShowEdit(true)}
            className="flex-shrink-0 text-gray-300 hover:text-sfc-blue transition-colors"
            aria-label="編集"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* 削除ボタン */}
          <button
            onClick={handleDelete}
            disabled={deleteTask.isPending}
            className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
            aria-label="削除"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* === 展開時: 全文表示 === */}
        {expanded && hasDescription && (
          <div className="px-4 pb-4 pl-12">
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
            <button
              onClick={() => setExpanded(false)}
              className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              折りたたむ ↑
            </button>
          </div>
        )}
      </div>

      {/* === 編集モーダル === */}
      {showEdit && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}
        >
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">タスクを編集</h2>
            <TaskForm
              task={task}
              onSuccess={() => setShowEdit(false)}
              onCancel={() => setShowEdit(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
