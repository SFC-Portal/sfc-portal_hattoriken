from sqlalchemy import Column, String, Integer, DateTime, Text, ARRAY
from sqlalchemy.sql import func
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    display_name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    grade = Column(Integer, nullable=True)
    faculty = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    interests = Column(ARRAY(String), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
