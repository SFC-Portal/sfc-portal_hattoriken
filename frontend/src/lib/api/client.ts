import axios, { AxiosInstance, AxiosError } from "axios";
import type { ApiError } from "@/types/common";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// === snake_case ↔ camelCase 変換 ===
function toCamel(s: string) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
function toSnake(s: string) {
  return s.replace(/([A-Z])/g, (c) => `_${c.toLowerCase()}`);
}
function mapKeys(obj: unknown, fn: (k: string) => string): unknown {
  if (Array.isArray(obj)) return obj.map((v) => mapKeys(v, fn));
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        fn(k),
        mapKeys(v, fn),
      ])
    );
  }
  return obj;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

// リクエスト: camelCase → snake_case + 認証トークン付与
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data && typeof config.data === "object") {
    config.data = mapKeys(config.data, toSnake);
  }
  return config;
});

// レスポンス: snake_case → camelCase
apiClient.interceptors.response.use(
  (response) => {
    response.data = mapKeys(response.data, toCamel);
    return response;
  },
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") localStorage.removeItem("access_token");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
