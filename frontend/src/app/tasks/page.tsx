import { Metadata } from "next";
import { TaskList } from "@/components/tasks/TaskList";

export const metadata: Metadata = {
  title: "タスク管理",
  description: "課題やタスクを管理する",
};

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">タスク管理</h1>
        {/* TaskCreateButton will go here */}
      </div>
      <TaskList />
    </div>
  );
}
