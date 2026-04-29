"use client";

// Bus schedule view component
export function BusScheduleView() {
  return (
    <div className="space-y-6">
      {/* Route selector */}
      <div className="flex gap-2 flex-wrap">
        <button className="btn-primary">湘南台 → SFC</button>
        <button className="btn-secondary">SFC → 湘南台</button>
        <button className="btn-secondary">辻堂 → SFC</button>
        <button className="btn-secondary">SFC → 辻堂</button>
      </div>

      {/* Next buses */}
      <div className="card p-4">
        <h2 className="font-semibold mb-3">次のバス</h2>
        {/* NextBusList component */}
        <p className="text-gray-500">時刻表を読み込み中...</p>
      </div>

      {/* Full schedule */}
      <div className="card p-4">
        <h2 className="font-semibold mb-3">時刻表</h2>
        {/* BusScheduleTable component */}
      </div>
    </div>
  );
}
