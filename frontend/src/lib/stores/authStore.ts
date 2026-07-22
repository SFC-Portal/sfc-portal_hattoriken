import { create } from "zustand";
import type { AuthState, User } from "@/types/user";

// アクセストークンはSupabase-jsが自前で永続化・更新するため、ここでは持たない
// （client.tsのAPIリクエスト時にgetSupabaseClient().auth.getSession()から都度取得する）
// isAuthenticatedはSupabaseセッションの有無のみで更新する（userはバックエンドの/auth/me取得結果）
interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated, isLoading: false }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
}));

// 旧実装（zustand persistミドルウェア）が書き込んでいたaccess_token入りの生のlocalStorageキー。
// 既存ユーザーのブラウザに残り続けないよう、読み込み時に一度だけ削除する
if (typeof window !== "undefined") {
  localStorage.removeItem("auth-storage");
}
