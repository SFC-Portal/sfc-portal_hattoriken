from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class Faculty(str, Enum):
    SFC = "SFC"
    PM = "PM"
    ENV = "ENV"


class UserBase(BaseModel):
    email: str
    display_name: str
    avatar_url: Optional[str] = None
    grade: Optional[int] = None
    faculty: Optional[Faculty] = None


class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserProfileResponse(UserResponse):
    bio: Optional[str] = None
    interests: Optional[List[str]] = None
    graduation_year: Optional[int] = None


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[List[str]] = None
    graduation_year: Optional[int] = None
