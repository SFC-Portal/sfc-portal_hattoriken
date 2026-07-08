from fastapi import APIRouter, Depends, HTTPException, Query, Header
from typing import Optional
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.task_service import TaskService
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

# TODO: replace with real auth dependency once Supabase Auth is wired up
DEV_USER_ID = "00000000-0000-0000-0000-000000000001"


def get_user_id(x_user_id: Optional[str] = Header(None)) -> str:
    return x_user_id or DEV_USER_ID


@router.get("", response_model=TaskListResponse)
async def get_tasks(
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    category: Optional[TaskCategory] = None,
    course_id: Optional[str] = None,
    due_before: Optional[str] = None,
    due_after: Optional[str] = None,
    sort_by: Optional[str] = Query(None, pattern="^(due_date|priority|created_at)$"),
    sort_order: Optional[str] = Query("asc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db),
):
    """Get list of tasks with optional filters"""
    service = TaskService(db)
    return service.get_tasks(
        user_id=user_id,
        status=status,
        priority=priority,
        category=category,
        course_id=course_id,
        due_before=due_before,
        due_after=due_after,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit,
    )


@router.post("", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db),
):
    """Create a new task"""
    service = TaskService(db)
    return service.create_task(user_id=user_id, data=task.model_dump())


@router.get("/course/{course_id}", response_model=list[TaskResponse])
async def get_tasks_by_course(
    course_id: str,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db),
):
    """Get all tasks for a specific course"""
    service = TaskService(db)
    return service.get_tasks_by_course(course_id=course_id, user_id=user_id)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db),
):
    """Get a specific task by ID"""
    service = TaskService(db)
    task = service.get_task(task_id=task_id, user_id=user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    updates: TaskUpdate,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db),
):
    """Update an existing task"""
    service = TaskService(db)
    task = service.update_task(
        task_id=task_id, user_id=user_id, data=updates.model_dump(exclude_none=True)
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: str,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db),
):
    """Delete a task"""
    service = TaskService(db)
    deleted = service.delete_task(task_id=task_id, user_id=user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
