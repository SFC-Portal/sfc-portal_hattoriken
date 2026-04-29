"use client";

import type { TaskCreateInput } from "@/types/task";

interface TaskFormProps {
  initialData?: Partial<TaskCreateInput>;
  onSubmit: (data: TaskCreateInput) => void;
  onCancel?: () => void;
}

// Task create/edit form component
export function TaskForm({ initialData, onSubmit, onCancel }: TaskFormProps) {
  return (
    <form className="space-y-4">
      {/* Title input */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          タイトル
        </label>
        {/* Input field */}
      </div>

      {/* Description textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          説明
        </label>
        {/* Textarea */}
      </div>

      {/* Due date picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          期限
        </label>
        {/* Date picker */}
      </div>

      {/* Priority select */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          優先度
        </label>
        {/* Select */}
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            キャンセル
          </button>
        )}
        <button type="submit" className="btn-primary">
          保存
        </button>
      </div>
    </form>
  );
}
