import axios from "axios";
import type {
  SyllabusSearchParams,
  SyllabusSearchResult,
  Course,
} from "@/types/syllabus";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// Intercept errors globally
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[API Error]", err.response?.status, err.message);
    return Promise.reject(err);
  }
);

// ---- Syllabus endpoints ----

export async function searchSyllabus(
  params: SyllabusSearchParams
): Promise<SyllabusSearchResult> {
  const { data } = await apiClient.get<SyllabusSearchResult>(
    "/api/v1/syllabus/search",
    { params }
  );
  return data;
}

export async function getCourseById(id: string): Promise<Course> {
  const { data } = await apiClient.get<Course>(`/api/v1/syllabus/${id}`);
  return data;
}
