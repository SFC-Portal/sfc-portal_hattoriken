// Common types used across features

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface SelectOption {
  value: string;
  label: string;
}
