import { apiClient } from "./client";
import type {
  SyllabusSearchParams,
  SyllabusSearchResult,
  Course,
} from "@/types/syllabus";

export async function searchSyllabus(
  params: SyllabusSearchParams
): Promise<SyllabusSearchResult> {
  const { data } = await apiClient.get<SyllabusSearchResult>(
    "/syllabus/search",
    { params }
  );
  return data;
}

export async function getCourseById(id: string): Promise<Course> {
  const { data } = await apiClient.get<Course>(`/syllabus/${id}`);
  return data;
}
