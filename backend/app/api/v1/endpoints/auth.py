from fastapi import APIRouter, Depends, HTTPException
from app.schemas.user import UserResponse, UserProfileResponse, UserProfileUpdate

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=UserResponse)
async def get_current_user():
    """Get current authenticated user"""
    raise NotImplementedError


@router.get("/users/{user_id}/profile", response_model=UserProfileResponse)
async def get_user_profile(user_id: str):
    """Get user profile by ID"""
    raise NotImplementedError


@router.patch("/users/me/profile", response_model=UserProfileResponse)
async def update_profile(updates: UserProfileUpdate):
    """Update current user's profile"""
    raise NotImplementedError
