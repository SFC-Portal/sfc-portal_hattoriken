"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchSyllabus } from "@/lib/api/syllabus";
import { SyllabusCard } from "./SyllabusCard";
import type { SyllabusSearchParams } from "@/types/syllabus";

const DAYS = ["月", "火", "水", "木", "金", "土"];
const PERIODS = ["1", "2", "3", "4", "5", "6"];

const DEFAULT: SyllabusSearchParams = { keyword: "", instructor: "", day: "", period: "", page: 1, limit: 20 };

export function SyllabusSearch() {
  const [params, setParams] = useState(DEFAULT);
  const [query, setQuery] = useState<SyllabusSearchParams | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["syllabus", query],
    queryFn: () => searchSyllabus(query!),
    enabled: query !== null,
  });

  const set = (key: keyof SyllabusSearchParams) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setParams((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={(e) => { e.preventDefault(); setQuery({ ...params, page: 1 }); }} className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">科目名・キーワード</label>
            <input type="text" value={params.keyword} onChange={set("keyword")} placeholder="例: プログラミング" className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">担当教員名</label>
            <input type="text" value={params.instructor} onChange={set("instructor")} placeholder="例: 村井純" className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">曜日</label>
            <select value={params.day} onChange={set("day")} className="input-base">
              <option value="">指定なし</option>
              {DAYS.map((d) => <option key={d} value={d}>{d}曜</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">時限</label>
            <select value={params.period} onChange={set("period")} className="input-base">
              <option value="">指定なし</option>
              {PERIODS.map((p) => <option key={p} value={p}>{p}限</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? "検索中..." : "検索"}
        </button>
      </form>

      {/* Error */}
      {isError && <p className="text-sm text-red-500">エラーが発生しました。</p>}

      {/* Results */}
      {data && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{data.total} 件</p>
          {data.courses.map((c) => <SyllabusCard key={c.id} course={c} />)}
        </div>
      )}
    </div>
  );
}
