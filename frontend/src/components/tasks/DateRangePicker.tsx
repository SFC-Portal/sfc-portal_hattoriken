"use client";

import { useState, useRef, useEffect } from "react";

interface DateRangePickerProps {
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string;   // "YYYY-MM-DD"
  onChange: (start: string | undefined, end: string | undefined) => void;
}

function fmtDisplay(d?: string) {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${parseInt(m)}/${parseInt(day)}`;
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hoverDate, setHoverDate] = useState<string>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  // 外クリックで閉じる
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !popupRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleOpen() {
    if (open) { setOpen(false); return; }
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPopupPos({ top: r.bottom + 6, left: r.left });
    }
    setOpen(true);
  }

  function handleDayClick(dateStr: string) {
    if (!startDate && !endDate) {
      onChange(dateStr, undefined);
    } else if (startDate && !endDate) {
      if (dateStr === startDate) {
        onChange(undefined, undefined); // 同じ日をクリック → 解除
      } else if (dateStr < startDate) {
        onChange(dateStr, startDate);
        setOpen(false);
      } else {
        onChange(startDate, dateStr);
        setOpen(false);
      }
    } else {
      // 両方選択済み → 再選択
      onChange(dateStr, undefined);
    }
  }

  // 表示用の有効範囲（hover含む）
  function getEffectiveRange(): [string, string] | null {
    const s = startDate;
    const e = endDate ?? (startDate && !endDate ? hoverDate : undefined);
    if (!s || !e || s === e) return null;
    return s <= e ? [s, e] : [e, s];
  }

  function getCellState(dateStr: string) {
    const range = getEffectiveRange();
    const isStart = dateStr === startDate;
    const isEnd = dateStr === endDate;
    const isSelected = isStart || isEnd;
    const inRange = range ? dateStr > range[0] && dateStr < range[1] : false;

    // 帯の位置（range開始は右半分、range終了は左半分、中間は全幅）
    const rangeStart = range ? dateStr === range[0] : false;
    const rangeEnd = range ? dateStr === range[1] : false;
    let stripClass = "";
    if (rangeStart && !rangeEnd) stripClass = "left-1/2 right-0";
    else if (rangeEnd && !rangeStart) stripClass = "left-0 right-1/2";
    else if (inRange) stripClass = "left-0 right-0";

    return { isSelected, inRange, stripClass, showStrip: !!(stripClass) };
  }

  // カレンダー日付生成
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toDateStr(viewYear, viewMonth, d));

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  const displayText = startDate
    ? endDate
      ? `${fmtDisplay(startDate)} → ${fmtDisplay(endDate)}`
      : `${fmtDisplay(startDate)} →`
    : undefined;

  return (
    <div className="relative">
      {/* トリガーボタン */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="input-base w-full flex items-center gap-2 text-left"
      >
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <span className={`text-sm flex-1 ${displayText ? "text-gray-800" : "text-gray-400"}`}>
          {displayText ?? "期間を選択"}
        </span>
        {(startDate || endDate) && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onChange(undefined, undefined); }}
            className="text-gray-300 hover:text-gray-500 flex-shrink-0 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        )}
      </button>

      {/* カレンダーポップアップ（fixed位置で overflow clipping を回避） */}
      {open && (
        <div
          ref={popupRef}
          style={{ position: "fixed", top: popupPos.top, left: popupPos.left }}
          className="z-[9999] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 w-72"
        >
          {/* 月ナビゲーション */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button type="button" onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-800">
              {viewYear}年 {viewMonth + 1}月
            </span>
            <button type="button" onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 mb-1">
            {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
              <div key={d} className={`text-center text-xs font-medium py-1
                ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>
                {d}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7">
            {cells.map((dateStr, i) => {
              if (!dateStr) return <div key={`e${i}`} className="h-9" />;

              const day = parseInt(dateStr.split("-")[2]);
              const dow = new Date(dateStr + "T00:00:00").getDay();
              const { isSelected, showStrip, stripClass } = getCellState(dateStr);

              return (
                <div
                  key={dateStr}
                  className="relative h-9 flex items-center justify-center cursor-pointer"
                  onClick={() => handleDayClick(dateStr)}
                  onMouseEnter={() => startDate && !endDate && setHoverDate(dateStr)}
                  onMouseLeave={() => setHoverDate(undefined)}
                >
                  {/* 範囲ハイライト帯 */}
                  {showStrip && (
                    <div className={`absolute top-1 bottom-1 bg-blue-100 ${stripClass}`} />
                  )}
                  {/* 日付サークル */}
                  <span className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors
                    ${isSelected
                      ? "bg-sfc-blue text-white"
                      : "hover:bg-gray-100 " + (dow === 0 ? "text-red-500" : dow === 6 ? "text-blue-500" : "text-gray-700")
                    }`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ガイドテキスト */}
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-center text-gray-400">
            {!startDate
              ? "開始日をクリック"
              : !endDate
              ? "終了日をクリック（同じ日で解除）"
              : `${fmtDisplay(startDate)} → ${fmtDisplay(endDate)}`}
          </div>
        </div>
      )}
    </div>
  );
}
