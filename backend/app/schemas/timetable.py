from pydantic import BaseModel
from app.schemas.syllabus import CourseOut


class TimetableEntryOut(BaseModel):
    id: str
    user_id: str
    course_id: str
    course: CourseOut

    model_config = {"from_attributes": True}


class TimetableAddRequest(BaseModel):
    course_id: str
