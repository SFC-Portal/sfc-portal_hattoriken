import { apiClient } from "./syllabus";
import type { TimetableEntry } from "@/types/syllabus";

export async function getMyTimetable(): Promise<TimetableEntry[]> {
  const { data } = await apiClient.get<TimetableEntry[]>("/api/v1/timetable/");
  return data;
}

export async function addToTimetable(courseId: string): Promise<TimetableEntry> {
  const { data } = await apiClient.post<TimetableEntry>("/api/v1/timetable/", {
    course_id: courseId,
  });
  return data;
}

export async function removeFromTimetable(entryId: string): Promise<void> {
  await apiClient.delete(`/api/v1/timetable/${entryId}`);
}
