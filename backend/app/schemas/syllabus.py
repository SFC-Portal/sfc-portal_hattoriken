from pydantic import BaseModel
from typing import Optional, List


class CourseOut(BaseModel):
    id: str
    name: str
    name_en: Optional[str] = None
    instructor: str
    day: str
    period: str
    room: Optional[str] = None
    credits: Optional[int] = None
    semester: Optional[str] = None
    category: Optional[str] = None
    language: Optional[str] = None
    description: Optional[str] = None
    syllabus_url: Optional[str] = None
    year: Optional[int] = None

    model_config = {"from_attributes": True}


class SyllabusSearchResult(BaseModel):
    courses: List[CourseOut]
    total: int
    page: int
    limit: int
