from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.timetable import TimetableEntryOut, TimetableAddRequest
from app.services import timetable_service

router = APIRouter(prefix="/timetable", tags=["timetable"])


@router.get("/", response_model=List[TimetableEntryOut])
def get_timetable(db: Session = Depends(get_db)):
    # TODO: implement via timetable_service
    raise NotImplementedError


@router.post("/", response_model=TimetableEntryOut)
def add_course(body: TimetableAddRequest, db: Session = Depends(get_db)):
    # TODO: implement via timetable_service
    raise NotImplementedError


@router.delete("/{entry_id}")
def remove_course(entry_id: str, db: Session = Depends(get_db)):
    # TODO: implement via timetable_service
    raise NotImplementedError
