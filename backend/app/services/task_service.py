from typing import Optional, List
from sqlalchemy.orm import Session


class TaskService:
    """Service class for task-related operations"""

    def __init__(self, db: Session):
        self.db = db

    async def get_tasks(
        self,
        user_id: str,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        course_id: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ):
        """Get paginated list of tasks"""
        raise NotImplementedError

    async def get_task(self, task_id: str, user_id: str):
        """Get a single task by ID"""
        raise NotImplementedError

    async def create_task(self, user_id: str, data: dict):
        """Create a new task"""
        raise NotImplementedError

    async def update_task(self, task_id: str, user_id: str, data: dict):
        """Update an existing task"""
        raise NotImplementedError

    async def delete_task(self, task_id: str, user_id: str):
        """Delete a task"""
        raise NotImplementedError

    async def get_tasks_by_course(self, course_id: str, user_id: str) -> List:
        """Get all tasks for a specific course"""
        raise NotImplementedError
