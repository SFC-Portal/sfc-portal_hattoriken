// getBoundingClientRect()由来のleft座標を、ポップアップが画面右端からはみ出さないようクランプする
export function clampPopupLeft(left: number, popupWidth: number, margin = 8): number {
  if (typeof window === "undefined") return left;
  const maxLeft = window.innerWidth - popupWidth - margin;
  return Math.max(margin, Math.min(left, maxLeft));
}
