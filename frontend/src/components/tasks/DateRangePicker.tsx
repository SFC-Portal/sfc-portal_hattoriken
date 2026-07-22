"use client";

import { useState, useRef } from "react";
import { useOnClickOutside } from "@/lib/hooks/useOnClickOutside";
import { clampPopupLeft } from "@/lib/utils/popupPosition";

const POPUP_WIDTH = 288; // w-72

export interface DateRangePickerProps {
  startDate?: string; // "YYYY-MM-DD" or ISO
  endDate?: string;
  onChange: (start: string | undefined, end: string | undefined) => void;
}

// Date-only part for comparison
function toDay(s?: string) {
  return s?.split("T")[0];
}

function fmt(day?: string) {
  if (!day) return "";
  const [, m, d] = day.split("-");
  return `${parseInt(m)}/${parseInt(d)}`;
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  // Internal selection state: ordered by click time, always "YYYY-MM-DD"
  const [picks, setPicks] = useState<[string | undefined, string | undefined]>([undefined, undefined]);
  const [hoverDate, setHoverDate] = useState<string>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  // Close on outside click
  useOnClickOutside([triggerRef, popupRef], () => setOpen(false), open);

  function handleOpen() {
    if (open) { setOpen(false); return; }
    // Init picks from current props (date-only for comparison)
    const s = toDay(startDate);
    const e = toDay(endDate);
    if (!s) setPicks([undefined, undefined]);
    else if (!e || s === e) setPicks([s, undefined]);
    else setPicks([s, e]);
    setHoverDate(undefined);
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPopupPos({ top: r.bottom + 6, left: clampPopupLeft(r.left, POPUP_WIDTH) });
    }
    setOpen(true);
  }

  function handleDayClick(dateStr: string) {
    const [p1, p2] = picks;

    if (p1 === dateStr && !p2) {
      // Only pick1 selected → deselect all
      setPicks([undefined, undefined]);
      onChange(undefined, undefined);
    } else if (p1 === dateStr && p2) {
      // Both selected, click pick1 → pick2 becomes single selection
      setPicks([p2, undefined]);
      onChange(p2, p2);
    } else if (p2 === dateStr) {
      // Both selected, click pick2 → pick1 becomes single selection
      setPicks([p1, undefined]);
      onChange(p1, p1);
    } else if (!p1) {
      // No selection → single day
      setPicks([dateStr, undefined]);
      onChange(dateStr, dateStr);
    } else if (!p2) {
      // Have pick1, add pick2 — NO auto-close
      setHoverDate(undefined);
      const [lo, hi] = p1 <= dateStr ? [p1, dateStr] : [dateStr, p1];
      setPicks([p1, dateStr]);
      onChange(lo, hi);
    }
    // If both already set and different date clicked → do nothing
  }

  function handleConfirm() {
    setOpen(false);
  }

  // Effective range for highlight: picks or pick1+hover
  function getRange(): [string, string] | null {
    const [p1, p2] = picks;
    const eff = p2 ?? hoverDate;
    if (!p1 || !eff || p1 === eff) return null;
    return p1 <= eff ? [p1, eff] : [eff, p1];
  }

  function getCellState(dateStr: string) {
    const [p1, p2] = picks;
    const isSelected = dateStr === p1 || dateStr === p2;
    const range = getRange();
    const inRange = range ? dateStr > range[0] && dateStr < range[1] : false;
    const isRangeStart = range ? dateStr === range[0] : false;
    const isRangeEnd = range ? dateStr === range[1] : false;

    let stripClass = "";
    if (isRangeStart && !isRangeEnd) stripClass = "left-1/2 right-0";
    else if (isRangeEnd && !isRangeStart) stripClass = "left-0 right-1/2";
    else if (inRange) stripClass = "left-0 right-0";

    return { isSelected, inRange, stripClass, showStrip: !!stripClass };
  }

  // Calendar grid
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

  // Trigger display text (from committed props, not picks)
  const sDay = toDay(startDate);
  const eDay = toDay(endDate);
  const isSingleDay = !endDate || sDay === eDay;
  const displayText = !startDate
    ? undefined
    : isSingleDay
    ? fmt(sDay)
    : `${fmt(sDay)} → ${fmt(eDay)}`;

  // Guide text in popup
  const [p1, p2] = picks;
  const guideText = !p1
    ? "日付をクリックして選択"
    : !p2
    ? "もう一度クリックで解除、別の日付で終了日を選択"
    : `${fmt(p1 <= p2 ? p1 : p2)} → ${fmt(p1 <= p2 ? p2 : p1)}`;

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="input-base w-full flex items-center gap-2 text-left"
      >
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
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

      {/* Calendar popup */}
      {open && (
        <div
          ref={popupRef}
          style={{ position: "fixed", top: popupPos.top, left: popupPos.left }}
          className="z-[9999] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 w-72"
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button type="button" onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-800">{viewYear}年 {viewMonth + 1}月</span>
            <button type="button" onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
              <div key={d} className={`text-center text-xs font-medium py-1
                ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {cells.map((dateStr, i) => {
              if (!dateStr) return <div key={`e${i}`} className="h-9" />;
              const day = parseInt(dateStr.split("-")[2]);
              const dow = new Date(dateStr + "T00:00:00").getDay();
              const { isSelected, showStrip, stripClass } = getCellState(dateStr);
              const hasOnePick = !!p1 && !p2;

              return (
                <div
                  key={dateStr}
                  className="relative h-9 flex items-center justify-center cursor-pointer"
                  onClick={() => handleDayClick(dateStr)}
                  onMouseEnter={() => hasOnePick && setHoverDate(dateStr)}
                  onMouseLeave={() => setHoverDate(undefined)}
                >
                  {/* Range strip */}
                  {showStrip && (
                    <div className={`absolute top-1 bottom-1 bg-blue-100 ${stripClass}`} />
                  )}
                  {/* Day circle */}
                  <span className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors
                    ${isSelected
                      ? "bg-sfc-blue text-white"
                      : `hover:bg-gray-100 ${dow === 0 ? "text-red-500" : dow === 6 ? "text-blue-500" : "text-gray-700"}`
                    }`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer: guide + confirm */}
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
            <p className="text-xs text-gray-400 leading-snug flex-1">{guideText}</p>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-shrink-0 text-sm font-medium text-white bg-sfc-blue hover:bg-sfc-blue/90 px-3 py-1 rounded-lg transition-colors"
            >
              確定
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
