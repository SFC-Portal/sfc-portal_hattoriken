from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)

    course = relationship("Course")
