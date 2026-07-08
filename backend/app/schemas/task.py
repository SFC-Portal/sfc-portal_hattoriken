from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    ARCHIVED = "archived"


class TaskCategory(str, Enum):
    ASSIGNMENT = "assignment"
    EXAM = "exam"
    PROJECT = "project"
    READING = "reading"
    OTHER = "other"


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    course_id: Optional[str] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    category: TaskCategory = TaskCategory.OTHER
    tags: Optional[List[str]] = None


class TaskCreate(TaskBase):
    parent_id: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    category: Optional[TaskCategory] = None
    tags: Optional[List[str]] = None


class TaskResponse(TaskBase):
    id: str
    user_id: str
    parent_id: Optional[str] = None
    course_name: Optional[str] = None
    status: TaskStatus
    sub_tasks: List["TaskResponse"] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


TaskResponse.model_rebuild()


class TaskListResponse(BaseModel):
    data: List[TaskResponse]
    total: int
    page: int
    limit: int
    has_more: bool
