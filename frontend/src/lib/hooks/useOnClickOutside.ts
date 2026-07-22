"use client";

import { useEffect, useRef, type RefObject } from "react";

type ClickOutsideRef = RefObject<HTMLElement | null>;

// トリガー要素・ポップアップ要素など複数の要素を跨いで「外側クリックで閉じる」を判定する共通フック
export function useOnClickOutside(
  refs: ClickOutsideRef | ClickOutsideRef[],
  onOutside: () => void,
  enabled = true
) {
  const callbackRef = useRef(onOutside);
  callbackRef.current = onOutside;

  useEffect(() => {
    if (!enabled) return;
    const refList = Array.isArray(refs) ? refs : [refs];

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const isInside = refList.some((ref) => ref.current?.contains(target));
      if (!isInside) callbackRef.current();
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // refsはuseRefで生成される安定参照のため依存配列に含めなくてよい
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
