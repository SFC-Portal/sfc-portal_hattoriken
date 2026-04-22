// Bus schedule types

export type BusRoute =
  | "shonandai_to_sfc"
  | "sfc_to_shonandai"
  | "tsujido_to_sfc"
  | "sfc_to_tsujido";

export type DayType = "weekday" | "saturday" | "holiday" | "exam";

export interface BusSchedule {
  id: string;
  route: BusRoute;
  dayType: DayType;
  departureTime: string;
  arrivalTime: string;
  busNumber?: string;
  notes?: string;
}

export interface BusStop {
  id: string;
  name: string;
  nameEn: string;
  routes: BusRoute[];
}

export interface NextBus {
  schedule: BusSchedule;
  minutesUntilDeparture: number;
  status: "on_time" | "delayed" | "cancelled";
}

export interface BusFilters {
  route?: BusRoute;
  dayType?: DayType;
  fromTime?: string;
  toTime?: string;
}
