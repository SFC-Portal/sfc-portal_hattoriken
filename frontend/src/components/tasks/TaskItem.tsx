"use client";

import type { Task } from "@/types/task";

interface TaskItemProps {
  task: Task;
  onUpdate?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

// Individual task item component
export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  return (
    <div className="card p-4 flex items-center gap-4">
      {/* Checkbox */}
      <div className="flex-shrink-0">
        {/* Completion checkbox */}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
        {task.dueDate && (
          <p className="text-sm text-gray-500">
            期限: {task.dueDate}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0">
        {/* Edit/Delete buttons */}
      </div>
    </div>
  );
}
