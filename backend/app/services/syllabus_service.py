from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.course import Course


def search_courses(db: Session, **filters) -> dict:
    query = db.query(Course)

    keyword = filters.get("keyword")
    if keyword:
        query = query.filter(
            or_(
                Course.name.ilike(f"%{keyword}%"),
                Course.name_en.ilike(f"%{keyword}%"),
                Course.instructor.ilike(f"%{keyword}%"),
            )
        )

    instructor = filters.get("instructor")
    if instructor:
        query = query.filter(Course.instructor.ilike(f"%{instructor}%"))

    day = filters.get("day")
    if day:
        query = query.filter(Course.day == day)

    period = filters.get("period")
    if period:
        query = query.filter(Course.period == period)

    semester = filters.get("semester")
    if semester:
        query = query.filter(Course.semester == semester)

    total = query.count()

    page = filters.get("page", 1)
    limit = filters.get("limit", 20)
    courses = query.offset((page - 1) * limit).limit(limit).all()

    return {"courses": courses, "total": total, "page": page, "limit": limit}


def get_course_by_id(db: Session, course_id: str) -> Course | None:
    return db.get(Course, course_id)
