from sqlalchemy import Column, String, Integer, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    name_en = Column(String)
    instructor = Column(String, nullable=False)
    day = Column(String(2))      # 月火水木金土
    period = Column(String(1))   # 1–6
    room = Column(String)
    credits = Column(Integer)
    semester = Column(String)    # 前期 後期 通年
    category = Column(String)
    language = Column(String)
    description = Column(Text)
    syllabus_url = Column(String)
    year = Column(Integer)

    tasks = relationship("Task", back_populates="course")
