"use client";

import type { NextBus } from "@/types/bus";

interface NextBusListProps {
  buses: NextBus[];
}

// List of upcoming buses
export function NextBusList({ buses }: NextBusListProps) {
  if (buses.length === 0) {
    return <p className="text-gray-500">次のバスはありません</p>;
  }

  return (
    <ul className="space-y-2">
      {buses.map((bus, index) => (
        <li
          key={`${bus.schedule.id}-${index}`}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div>
            <span className="font-medium">{bus.schedule.departureTime}</span>
            {bus.schedule.notes && (
              <span className="ml-2 text-sm text-gray-500">
                {bus.schedule.notes}
              </span>
            )}
          </div>
          <span className="text-sfc-blue font-semibold">
            あと {bus.minutesUntilDeparture} 分
          </span>
        </li>
      ))}
    </ul>
  );
}
