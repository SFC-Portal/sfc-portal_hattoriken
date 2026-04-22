// ---- Syllabus / Course ----

export interface Course {
  id: string;
  name: string;
  name_en?: string;
  instructor: string;
  day: string;        // 月 火 水 木 金 土
  period: string;     // "1" – "6"
  room?: string;
  credits?: number;
  semester?: string;  // 前期 | 後期 | 通年
  category?: string;
  description?: string;
  syllabus_url?: string;
  year?: number;
  language?: string;  // 日本語 | English
}

export interface SyllabusSearchParams {
  keyword?: string;
  instructor?: string;
  day?: string;
  period?: string;
  semester?: string;
  category?: string;
  language?: string;
  page?: number;
  limit?: number;
}

export interface SyllabusSearchResult {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
}

// ---- Timetable ----

export interface TimetableEntry {
  id: string;
  course_id: string;
  course: Course;
  user_id: string;
  color?: string;
}

export interface TimetableCell {
  day: string;
  period: string;
  entry?: TimetableEntry;
}
