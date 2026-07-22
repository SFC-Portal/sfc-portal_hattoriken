from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id, get_current_user_payload, require_registered_user_id
from app.db.session import get_db
from app.models.task import Task
from app.models.user import User
from app.services.user_service import get_or_create_user
from app.schemas.user import UserResponse, UserProfileResponse, UserProfileUpdate

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get current authenticated user（未登録なら404。フロントはこれを「要アカウント作成確認」の合図として使う）"""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db),
):
    """Googleログイン後、ユーザーが確認画面で明示的に同意した後にのみusers行を作成する"""
    return get_or_create_user(db, payload)


@router.delete("/me", status_code=204)
async def delete_account(
    user_id: str = Depends(require_registered_user_id),
    db: Session = Depends(get_db),
):
    """アカウントを削除する。保有する全タスク（サブタスク含む）も削除される"""
    top_level_tasks = (
        db.query(Task).filter(Task.user_id == user_id, Task.parent_id.is_(None)).all()
    )
    for task in top_level_tasks:
        db.delete(task)  # sub_tasksはcascade="all, delete-orphan"で連鎖削除される

    user = db.get(User, user_id)
    if user:
        db.delete(user)

    db.commit()


@router.get("/users/{user_id}/profile", response_model=UserProfileResponse)
async def get_user_profile(
    user_id: str,
    _: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get user profile by ID"""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/users/me/profile", response_model=UserProfileResponse)
async def update_profile(
    updates: UserProfileUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Update current user's profile"""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user
