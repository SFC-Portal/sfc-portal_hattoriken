"use client";

import { useQuery } from "@tanstack/react-query";
import { getBusSchedules, getNextBuses, getBusStops, getCurrentDayType } from "@/lib/api/bus";
import type { BusFilters, BusRoute } from "@/types/bus";

export function useBusSchedules(filters?: BusFilters) {
  return useQuery({
    queryKey: ["busSchedules", filters],
    queryFn: () => getBusSchedules(filters),
  });
}

export function useNextBuses(route: BusRoute, limit = 5) {
  return useQuery({
    queryKey: ["nextBuses", route, limit],
    queryFn: () => getNextBuses(route, limit),
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
}

export function useBusStops() {
  return useQuery({
    queryKey: ["busStops"],
    queryFn: getBusStops,
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });
}

export function useCurrentDayType() {
  return useQuery({
    queryKey: ["dayType"],
    queryFn: getCurrentDayType,
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
}
