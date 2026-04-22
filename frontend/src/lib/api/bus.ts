import { apiClient } from "./client";
import type { BusSchedule, BusStop, NextBus, BusFilters, BusRoute } from "@/types/bus";

export async function getBusSchedules(filters?: BusFilters): Promise<BusSchedule[]> {
  const { data } = await apiClient.get("/bus/schedules", {
    params: filters,
  });
  return data;
}

export async function getNextBuses(route: BusRoute, limit = 5): Promise<NextBus[]> {
  const { data } = await apiClient.get("/bus/next", {
    params: { route, limit },
  });
  return data;
}

export async function getBusStops(): Promise<BusStop[]> {
  const { data } = await apiClient.get("/bus/stops");
  return data;
}

export async function getCurrentDayType(): Promise<string> {
  const { data } = await apiClient.get("/bus/day-type");
  return data.dayType;
}
