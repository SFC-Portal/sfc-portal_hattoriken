"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyTimetable } from "@/lib/api/timetable";
import type { TimetableEntry } from "@/types/syllabus";

const DAYS = ["月", "火", "水", "木", "金"];
const PERIODS = ["1", "2", "3", "4", "5", "6"];

export function TimetableGrid() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["timetable"],
    queryFn: getMyTimetable,
  });

  if (isLoading) return <p className="text-sm text-gray-400">読み込み中...</p>;
  if (isError) return <p className="text-sm text-red-500">読み込みに失敗しました。</p>;

  const map = new Map<string, TimetableEntry>();
  data?.forEach((e) => map.set(`${e.course.day}-${e.course.period}`, e));

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-sfc-blue text-white">
            <th className="p-2 border border-sfc-lightBlue w-16">時限</th>
            {DAYS.map((d) => <th key={d} className="p-2 border border-sfc-lightBlue">{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period) => (
            <tr key={period} className="border-b border-gray-100">
              <td className="p-2 text-center bg-gray-50 border border-gray-200 font-medium">{period}限</td>
              {DAYS.map((day) => {
                const entry = map.get(`${day}-${period}`);
                return (
                  <td key={day} className="p-1.5 border border-gray-200 min-w-[100px] align-top">
                    {entry ? (
                      <div className="rounded bg-blue-50 border border-blue-200 p-2 text-xs">
                        <p className="font-semibold line-clamp-2">{entry.course.name}</p>
                        <p className="text-gray-500 mt-0.5">{entry.course.instructor}</p>
                      </div>
                    ) : (
                      <div className="h-14" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
