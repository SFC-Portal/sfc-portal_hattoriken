from sqlalchemy.orm import Session
from app.models.timetable import TimetableEntry


def get_timetable(db: Session, user_id: str) -> list[TimetableEntry]:
    # TODO: return entries for user
    raise NotImplementedError


def add_entry(db: Session, user_id: str, course_id: str) -> TimetableEntry:
    # TODO: create and return new entry
    raise NotImplementedError


def remove_entry(db: Session, entry_id: str) -> None:
    # TODO: delete entry
    raise NotImplementedError
