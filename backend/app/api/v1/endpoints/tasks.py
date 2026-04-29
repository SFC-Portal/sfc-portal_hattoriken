from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.schemas.task import (
    TaskResponse,
    TaskCreate,
    TaskUpdate,
    TaskListResponse,
    TaskStatus,
    TaskPriority,
    TaskCategory,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=TaskListResponse)
async def get_tasks(
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    category: Optional[TaskCategory] = None,
    course_id: Optional[str] = None,
    due_before: Optional[str] = None,
    due_after: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Get list of tasks with optional filters"""
    raise NotImplementedError


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str):
    """Get a specific task by ID"""
    raise NotImplementedError


@router.post("", response_model=TaskResponse)
async def create_task(task: TaskCreate):
    """Create a new task"""
    raise NotImplementedError


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, updates: TaskUpdate):
    """Update an existing task"""
    raise NotImplementedError


@router.delete("/{task_id}")
async def delete_task(task_id: str):
    """Delete a task"""
    raise NotImplementedError


@router.get("/course/{course_id}", response_model=list[TaskResponse])
async def get_tasks_by_course(course_id: str):
    """Get all tasks for a specific course"""
    raise NotImplementedError
