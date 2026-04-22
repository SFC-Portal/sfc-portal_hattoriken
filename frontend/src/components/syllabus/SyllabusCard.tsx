"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Course } from "@/types/syllabus";

export function SyllabusCard({ course }: { course: Course }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card">
      <div className="flex items-start justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => setOpen((v) => !v)}>
        <div>
          <p className="font-semibold text-gray-800">{course.name}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {course.instructor} · {course.day}曜 {course.period}限
            {course.room && ` · ${course.room}`}
          </p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400 mt-1" /> : <ChevronDown className="h-4 w-4 text-gray-400 mt-1" />}
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 text-sm text-gray-600">
          {course.description ?? "詳細情報なし"}
          {course.syllabus_url && (
            <a href={course.syllabus_url} target="_blank" rel="noopener noreferrer" className="block mt-2 text-sfc-accent hover:underline">
              シラバス詳細 →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
