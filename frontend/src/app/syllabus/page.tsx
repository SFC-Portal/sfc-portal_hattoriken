import type { Metadata } from "next";
import { SyllabusSearch } from "@/components/syllabus/SyllabusSearch";

export const metadata: Metadata = { title: "シラバス検索" };

export default function SyllabusPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sfc-blue">シラバス検索</h1>
        <p className="text-sm text-gray-500 mt-1">
          SFC PORTALのシラバス情報を検索できます
        </p>
      </div>
      <SyllabusSearch />
    </div>
  );
}
