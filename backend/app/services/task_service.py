from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.models.task import Task


class TaskService:
    def __init__(self, db: Session):
        self.db = db

    def get_tasks(
        self,
        user_id: str,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        course_id: Optional[str] = None,
        due_before: Optional[str] = None,
        due_after: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> dict:
        query = self.db.query(Task).filter(Task.user_id == user_id)

        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        if category:
            query = query.filter(Task.category == category)
        if course_id:
            query = query.filter(Task.course_id == course_id)
        if due_before:
            query = query.filter(Task.due_date <= datetime.fromisoformat(due_before))
        if due_after:
            query = query.filter(Task.due_date >= datetime.fromisoformat(due_after))

        total = query.count()
        tasks = (
            query.order_by(Task.due_date.asc().nullslast())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )

        return {
            "data": tasks,
            "total": total,
            "page": page,
            "limit": limit,
            "has_more": (page * limit) < total,
        }

    def get_task(self, task_id: str, user_id: str) -> Optional[Task]:
        return (
            self.db.query(Task)
            .filter(Task.id == task_id, Task.user_id == user_id)
            .first()
        )

    def create_task(self, user_id: str, data: dict) -> Task:
        task = Task(
            id=str(uuid.uuid4()),
            user_id=user_id,
            **{k: v for k, v in data.items() if v is not None},
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update_task(self, task_id: str, user_id: str, data: dict) -> Optional[Task]:
        task = self.get_task(task_id, user_id)
        if not task:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(task, key, value)
        task.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete_task(self, task_id: str, user_id: str) -> bool:
        task = self.get_task(task_id, user_id)
        if not task:
            return False
        self.db.delete(task)
        self.db.commit()
        return True

    def get_tasks_by_course(self, course_id: str, user_id: str) -> List[Task]:
        return (
            self.db.query(Task)
            .filter(Task.course_id == course_id, Task.user_id == user_id)
            .order_by(Task.due_date.asc().nullslast())
            .all()
        )
