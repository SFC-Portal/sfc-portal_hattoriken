from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.schemas.syllabus import SyllabusSearchResult, CourseOut
from app.services import syllabus_service

router = APIRouter(prefix="/syllabus", tags=["syllabus"])


@router.get("/search", response_model=SyllabusSearchResult)
def search(
    keyword: Optional[str] = Query(None),
    instructor: Optional[str] = Query(None),
    day: Optional[str] = Query(None),
    period: Optional[str] = Query(None),
    semester: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return syllabus_service.search_courses(
        db,
        keyword=keyword,
        instructor=instructor,
        day=day,
        period=period,
        semester=semester,
        page=page,
        limit=limit,
    )


@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: str, db: Session = Depends(get_db)):
    course = syllabus_service.get_course_by_id(db, course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="科目が見つかりません")
    return course
