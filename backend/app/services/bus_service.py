from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session


class BusService:
    """Service class for bus schedule operations"""

    def __init__(self, db: Session):
        self.db = db

    async def get_schedules(
        self,
        route: Optional[str] = None,
        day_type: Optional[str] = None,
        from_time: Optional[str] = None,
        to_time: Optional[str] = None,
    ) -> List:
        """Get bus schedules with optional filters"""
        raise NotImplementedError

    async def get_next_buses(self, route: str, limit: int = 5) -> List:
        """Get next upcoming buses for a route"""
        raise NotImplementedError

    async def get_bus_stops(self) -> List:
        """Get all bus stops"""
        raise NotImplementedError

    def get_current_day_type(self) -> str:
        """Determine current day type based on date"""
        today = datetime.now()
        weekday = today.weekday()

        if weekday == 5:  # Saturday
            return "saturday"
        elif weekday == 6:  # Sunday
            return "holiday"
        else:
            return "weekday"
