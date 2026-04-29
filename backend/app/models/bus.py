from sqlalchemy import Column, String, Enum, ARRAY
from app.db.session import Base
import enum


class BusRoute(str, enum.Enum):
    SHONANDAI_TO_SFC = "shonandai_to_sfc"
    SFC_TO_SHONANDAI = "sfc_to_shonandai"
    TSUJIDO_TO_SFC = "tsujido_to_sfc"
    SFC_TO_TSUJIDO = "sfc_to_tsujido"


class DayType(str, enum.Enum):
    WEEKDAY = "weekday"
    SATURDAY = "saturday"
    HOLIDAY = "holiday"
    EXAM = "exam"


class BusSchedule(Base):
    __tablename__ = "bus_schedules"

    id = Column(String, primary_key=True)
    route = Column(Enum(BusRoute), nullable=False, index=True)
    day_type = Column(Enum(DayType), nullable=False, index=True)
    departure_time = Column(String, nullable=False)
    arrival_time = Column(String, nullable=False)
    bus_number = Column(String, nullable=True)
    notes = Column(String, nullable=True)


class BusStop(Base):
    __tablename__ = "bus_stops"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    name_en = Column(String, nullable=False)
    routes = Column(ARRAY(String), nullable=False)
