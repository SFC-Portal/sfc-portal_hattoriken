"use client";

// Task list component - implement task display logic here
export function TaskList() {
  return (
    <div className="space-y-4">
      {/* Task filters */}
      <div className="flex gap-2">
        {/* Filter buttons will go here */}
      </div>

      {/* Task items */}
      <div className="space-y-2">
        {/* TaskItem components will be mapped here */}
        <p className="text-gray-500 text-center py-8">
          タスクを追加してください
        </p>
      </div>
    </div>
  );
}
