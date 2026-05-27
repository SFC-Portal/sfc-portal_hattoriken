"use client";

import { useState } from "react";
import { useCreateTask } from "@/lib/hooks/useTasks";
import type { TaskCreateInput, TaskPriority, TaskCategory } from "@/types/task";

const PRIORITY_OPTIONS: { label: string; value: TaskPriority }[] = [
  { label: "低", value: "low" },
  { label: "中", value: "medium" },
  { label: "高", value: "high" },
  { label: "緊急", value: "urgent" },
];

const CATEGORY_OPTIONS: { label: string; value: TaskCategory }[] = [
  { label: "課題", value: "assignment" },
  { label: "試験", value: "exam" },
  { label: "プロジェクト", value: "project" },
  { label: "読書", value: "reading" },
  { label: "その他", value: "other" },
];

interface TaskFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TaskForm({ onSuccess, onCancel }: TaskFormProps) {
  const createTask = useCreateTask();

  const [form, setForm] = useState<TaskCreateInput>({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    category: "other",
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
      dueDate: form.dueDate || undefined,
      description: form.description || undefined,
    };

    createTask.mutate(input, {
      onSuccess: () => onSuccess?.(),
    });
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          説明
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="詳細を入力（任意）"
          rows={3}
          className="input-base resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* === 期限 === */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            期限
          </label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="input-base"
          />
        </div>

        {/* === 優先度 === */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            優先度
          </label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="input-base"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* === カテゴリ === */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          カテゴリ
        </label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="input-base"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
        <button
          type="submit"
          disabled={createTask.isPending || !form.title.trim()}
          className="btn-primary"
        >
          {createTask.isPending ? "保存中..." : "タスクを追加"}
        </button>
      </div>

      {createTask.isError && (
        <p className="text-sm text-red-500 text-center">
          保存に失敗しました。もう一度お試しください。
        </p>
      )}
    </form>
  );
}
