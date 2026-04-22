import { apiClient } from "./client";
import type { Task, TaskCreateInput, TaskUpdateInput, TaskFilters } from "@/types/task";
import type { PaginatedResponse } from "@/types/common";

export async function getTasks(
  filters?: TaskFilters,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Task>> {
  const { data } = await apiClient.get("/tasks", {
    params: { ...filters, page, limit },
  });
  return data;
}

export async function getTask(id: string): Promise<Task> {
  const { data } = await apiClient.get(`/tasks/${id}`);
  return data;
}

export async function createTask(input: TaskCreateInput): Promise<Task> {
  const { data } = await apiClient.post("/tasks", input);
  return data;
}

export async function updateTask(id: string, input: TaskUpdateInput): Promise<Task> {
  const { data } = await apiClient.patch(`/tasks/${id}`, input);
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}

export async function getTasksByCourse(courseId: string): Promise<Task[]> {
  const { data } = await apiClient.get(`/tasks/course/${courseId}`);
  return data;
}
