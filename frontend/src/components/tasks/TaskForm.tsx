"use client";

import { useState } from "react";
import { useCreateTask, useUpdateTask } from "@/lib/hooks/useTasks";
import { DateRangePicker } from "./DateRangePicker";
import { TagSelector } from "./TagSelector";
import type { Task, TaskCreateInput, TaskPriority } from "@/types/task";

const PRIORITY_OPTIONS: { label: string; value: TaskPriority }[] = [
  { label: "低", value: "low" },
  { label: "中", value: "medium" },
  { label: "高", value: "high" },
  { label: "緊急", value: "urgent" },
];

function toDateOnly(isoStr?: string) {
  if (!isoStr) return undefined;
  return isoStr.split("T")[0];
}

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const isEdit = !!task;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isPending = isEdit ? updateTask.isPending : createTask.isPending;
  const isError = isEdit ? updateTask.isError : createTask.isError;

  const [form, setForm] = useState<TaskCreateInput>({
    title: task?.title ?? "",
    description: task?.description ?? "",
    startDate: toDateOnly(task?.startDate),
    dueDate: toDateOnly(task?.dueDate),
    priority: task?.priority ?? "medium",
    tags: task?.tags ?? [],
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    const input: TaskCreateInput = {
      ...form,
      startDate: form.startDate || undefined,
      dueDate: form.dueDate || undefined,
      description: form.description || undefined,
      tags: form.tags?.length ? form.tags : undefined,
    };

    if (isEdit) {
      updateTask.mutate({ id: task.id, input }, { onSuccess: () => onSuccess?.() });
    } else {
      createTask.mutate(input, { onSuccess: () => onSuccess?.() });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* === タイトル === */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="タスクのタイトルを入力"
          required
          className="input-base"
        />
      </div>

      {/* === 説明 === */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="詳細を入力（任意）"
          rows={3}
          className="input-base resize-none"
        />
      </div>

      {/* === 期間 === */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">期間</label>
        <DateRangePicker
          startDate={form.startDate}
          endDate={form.dueDate}
          onChange={(s, e) => setForm((prev) => ({ ...prev, startDate: s, dueDate: e }))}
        />
      </div>

      {/* === 優先度 === */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
        <select name="priority" value={form.priority} onChange={handleChange} className="input-base">
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* === タグ === */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
        <TagSelector
          selected={form.tags ?? []}
          onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
        />
        <p className="text-xs text-gray-400 mt-1">既存タグを選択、または新しいタグを入力して作成</p>
      </div>

      {/* === ボタン === */}
      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            キャンセル
          </button>
        )}
        <button type="submit" disabled={isPending || !form.title.trim()} className="btn-primary">
          {isPending ? "保存中..." : isEdit ? "変更を保存" : "タスクを追加"}
        </button>
      </div>

      {isError && (
        <p className="text-sm text-red-500 text-center">保存に失敗しました。もう一度お試しください。</p>
      )}
    </form>
  );
}
