import { apiClient } from "./client";
import type { TimetableEntry } from "@/types/syllabus";

export async function getMyTimetable(): Promise<TimetableEntry[]> {
  const { data } = await apiClient.get<TimetableEntry[]>("/timetable/");
  return data;
}

export async function addToTimetable(courseId: string): Promise<TimetableEntry> {
  const { data } = await apiClient.post<TimetableEntry>("/timetable/", {
    course_id: courseId,
  });
  return data;
}

export async function removeFromTimetable(entryId: string): Promise<void> {
  await apiClient.delete(`/timetable/${entryId}`);
}
