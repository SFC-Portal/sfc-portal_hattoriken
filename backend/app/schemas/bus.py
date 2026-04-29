from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class BusRoute(str, Enum):
    SHONANDAI_TO_SFC = "shonandai_to_sfc"
    SFC_TO_SHONANDAI = "sfc_to_shonandai"
    TSUJIDO_TO_SFC = "tsujido_to_sfc"
    SFC_TO_TSUJIDO = "sfc_to_tsujido"


class DayType(str, Enum):
    WEEKDAY = "weekday"
    SATURDAY = "saturday"
    HOLIDAY = "holiday"
    EXAM = "exam"


class BusStatus(str, Enum):
    ON_TIME = "on_time"
    DELAYED = "delayed"
    CANCELLED = "cancelled"


class BusScheduleResponse(BaseModel):
    id: str
    route: BusRoute
    day_type: DayType
    departure_time: str
    arrival_time: str
    bus_number: Optional[str] = None
    notes: Optional[str] = None

    model_config = {"from_attributes": True}


class BusStopResponse(BaseModel):
    id: str
    name: str
    name_en: str
    routes: List[BusRoute]

    model_config = {"from_attributes": True}


class NextBusResponse(BaseModel):
    schedule: BusScheduleResponse
    minutes_until_departure: int
    status: BusStatus
