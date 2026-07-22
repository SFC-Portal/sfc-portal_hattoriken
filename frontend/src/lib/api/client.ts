import axios, { AxiosInstance, AxiosError } from "axios";
import type { ApiError } from "@/types/common";
import { getSupabaseClient } from "@/lib/supabase/client";

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
// トークンはSupabase-jsが管理するセッションから都度取得する（自前でlocalStorageに保持しない）
apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const {
      data: { session },
    } = await getSupabaseClient().auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
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
    // ログイン済みだがアカウント作成確認が未完了のセッション（別タブ等）を確認画面へ誘導する
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
    if (
      typeof window !== "undefined" &&
      error.response?.status === 403 &&
      detail === "account_not_registered"
    ) {
      const registerUrl = new URL("/register", window.location.origin);
      registerUrl.searchParams.set("next", window.location.pathname);
      window.location.href = registerUrl.toString();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
