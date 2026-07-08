"use client";

import { useState, KeyboardEvent } from "react";
import { useCreateTask, useUpdateTask } from "@/lib/hooks/useTasks";
import type { Task, TaskCreateInput, TaskPriority, TaskCategory } from "@/types/task";

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
    dueDate: task?.dueDate ? task.dueDate.split("T")[0] : "",
    priority: task?.priority ?? "medium",
    category: task?.category ?? "other",
    tags: task?.tags ?? [],
  });

  const [tagInput, setTagInput] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function addTag() {
    const t = tagInput.trim().replace(/^#/, "");
    if (!t || form.tags?.includes(t)) return;
    setForm((prev) => ({ ...prev, tags: [...(prev.tags ?? []), t] }));
    setTagInput("");
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: prev.tags?.filter((t) => t !== tag) }));
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !tagInput && form.tags?.length) {
      removeTag(form.tags[form.tags.length - 1]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    const input: TaskCreateInput = {
      ...form,
      dueDate: form.dueDate || undefined,
      description: form.description || undefined,
      tags: form.tags?.length ? form.tags : undefined,
    };

    if (isEdit) {
      updateTask.mutate(
        { id: task.id, input },
        { onSuccess: () => onSuccess?.() }
      );
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

      <div className="grid grid-cols-2 gap-4">
        {/* === 期限 === */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">期限</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
          <select name="priority" value={form.priority} onChange={handleChange} className="input-base">
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* === カテゴリ === */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
        <select name="category" value={form.category} onChange={handleChange} className="input-base">
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* === タグ === */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
        <div className="input-base flex flex-wrap gap-1 cursor-text min-h-[42px]"
          onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}>
          {form.tags?.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 leading-none">×</button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={form.tags?.length ? "" : "タグを入力してEnter"}
            className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Enterまたはカンマで追加</p>
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
