from sqlalchemy.orm import Session
from app.models.course import Course


def search_courses(db: Session, **filters) -> dict:
    # TODO: build query from filters, return SyllabusSearchResult-shaped dict
    raise NotImplementedError


def get_course_by_id(db: Session, course_id: str) -> Course | None:
    # TODO: return db.get(Course, course_id)
    raise NotImplementedError
