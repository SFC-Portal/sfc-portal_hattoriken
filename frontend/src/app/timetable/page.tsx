import type { Metadata } from "next";
import { TimetableGrid } from "@/components/timetable/TimetableGrid";

export const metadata: Metadata = { title: "時間割" };

export default function TimetablePage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sfc-blue">時間割</h1>
        <p className="text-sm text-gray-500 mt-1">履修中の授業を確認できます</p>
      </div>
      <TimetableGrid />
    </div>
  );
}
