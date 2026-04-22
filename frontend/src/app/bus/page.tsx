import { Metadata } from "next";
import { BusScheduleView } from "@/components/bus/BusScheduleView";

export const metadata: Metadata = {
  title: "バス時刻表",
  description: "SFCバスの時刻表と次のバス情報",
};

export default function BusPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">バス時刻表</h1>
      <BusScheduleView />
    </div>
  );
}
