import { create } from "zustand";

// AI細分化が使えなくなる2つの独立したケースを別々に管理する。
// - userRateLimitedUntil: このユーザー自身がバックエンドの制限（1ユーザー10回/時間）に達した
// - apiRateLimitedUntil: Gemini API自体がアプリ全体で利用上限に達している（他ユーザー分も含む共有の制限）
// どちらもタスクカード単位ではなくアプリ全体で共有する。
interface AiSubdivideStore {
  userRateLimitedUntil: number | null; // epoch ms
  apiRateLimitedUntil: number | null; // epoch ms
  setUserRateLimited: (retryAfterSeconds: number) => void;
  setApiRateLimited: (retryAfterSeconds: number) => void;
  clear: () => void;
}

export const useAiSubdivideStore = create<AiSubdivideStore>()((set) => ({
  userRateLimitedUntil: null,
  apiRateLimitedUntil: null,
  setUserRateLimited: (retryAfterSeconds) =>
    set({ userRateLimitedUntil: Date.now() + retryAfterSeconds * 1000 }),
  setApiRateLimited: (retryAfterSeconds) =>
    set({ apiRateLimitedUntil: Date.now() + retryAfterSeconds * 1000 }),
  clear: () => set({ userRateLimitedUntil: null, apiRateLimitedUntil: null }),
}));
