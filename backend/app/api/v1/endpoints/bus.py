from fastapi import APIRouter, Query
from typing import Optional
from app.schemas.bus import (
    BusScheduleResponse,
    BusStopResponse,
    NextBusResponse,
    BusRoute,
    DayType,
)

router = APIRouter(prefix="/bus", tags=["bus"])


@router.get("/schedules", response_model=list[BusScheduleResponse])
async def get_bus_schedules(
    route: Optional[BusRoute] = None,
    day_type: Optional[DayType] = None,
    from_time: Optional[str] = None,
    to_time: Optional[str] = None,
):
    """Get bus schedules with optional filters"""
    raise NotImplementedError


@router.get("/next", response_model=list[NextBusResponse])
async def get_next_buses(
    route: BusRoute,
    limit: int = Query(5, ge=1, le=10),
):
    """Get next upcoming buses for a route"""
    raise NotImplementedError


@router.get("/stops", response_model=list[BusStopResponse])
async def get_bus_stops():
    """Get all bus stops"""
    raise NotImplementedError


@router.get("/day-type")
async def get_current_day_type():
    """Get the current day type (weekday, saturday, holiday, exam)"""
    raise NotImplementedError
