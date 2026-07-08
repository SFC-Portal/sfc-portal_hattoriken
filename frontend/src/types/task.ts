// Task management types

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done" | "archived";
export type TaskCategory = "assignment" | "exam" | "project" | "reading" | "other";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  courseId?: string;
  courseName?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  courseId?: string;
  dueDate?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  tags?: string[];
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: TaskCategory;
  tags?: string[];
}

export type TaskSortBy = "due_date" | "priority" | "created_at";
export type TaskSortOrder = "asc" | "desc";

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  courseId?: string;
  dueBefore?: string;
  dueAfter?: string;
  sortBy?: TaskSortBy;
  sortOrder?: TaskSortOrder;
}
