from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from datetime import datetime
import uuid

from app.models.task import Task

_SORT_COLUMNS = {
    "due_date": Task.due_date,
    "priority": Task.priority,
    "created_at": Task.created_at,
}


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
        sort_by: Optional[str] = None,
        sort_order: Optional[str] = "asc",
        page: int = 1,
        limit: int = 20,
    ) -> dict:
        query = self.db.query(Task).filter(
            Task.user_id == user_id,
            Task.parent_id == None,  # noqa: E711
        )

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
        col = _SORT_COLUMNS[sort_by or "due_date"]
        order_fn = desc if sort_order == "desc" else asc
        tasks = (
            query.order_by(order_fn(col).nullslast())
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

        new_status = data.get("status")
        for key, value in data.items():
            if value is not None:
                setattr(task, key, value)

        if new_status in ("done", "todo"):
            self._cascade_down(task, new_status)

        # 完了時: 上方向に再帰的に親を確認して自動完了
        if new_status == "done":
            self._propagate_done_up(task)

        task.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(task)
        return task

    def _cascade_down(self, task: Task, status: str) -> None:
        """子・孫タスクすべてにステータスを伝播"""
        for sub in task.sub_tasks:
            sub.status = status
            self._cascade_down(sub, status)

    def _propagate_done_up(self, task: Task) -> None:
        """全兄弟タスクが完了なら親も完了にし、さらに上へ再帰"""
        if not task.parent_id:
            return
        parent = self.db.query(Task).filter(Task.id == task.parent_id).first()
        if parent and all(s.status == "done" for s in parent.sub_tasks):
            parent.status = "done"
            self._propagate_done_up(parent)

    def delete_task(self, task_id: str, user_id: str) -> bool:
        task = self.get_task(task_id, user_id)
        if not task:
            return False
        self.db.delete(task)
        self.db.commit()
        return True

    def get_tags(self, user_id: str) -> list:
        from sqlalchemy import text
        result = self.db.execute(
            text(
                "SELECT DISTINCT unnest(tags) AS tag FROM tasks "
                "WHERE user_id = :uid AND tags IS NOT NULL ORDER BY 1"
            ),
            {"uid": user_id},
        ).fetchall()
        return [r[0] for r in result if r[0]]

    def get_tasks_by_course(self, course_id: str, user_id: str) -> List[Task]:
        return (
            self.db.query(Task)
            .filter(Task.course_id == course_id, Task.user_id == user_id)
            .order_by(Task.due_date.asc().nullslast())
            .all()
        )
