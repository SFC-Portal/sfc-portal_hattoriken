from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.schemas.sns import (
    PostResponse,
    PostCreate,
    PostListResponse,
    CommentResponse,
    CommentCreate,
    CommentListResponse,
    FollowResponse,
    FollowListResponse,
)

router = APIRouter(prefix="/sns", tags=["sns"])


# Posts
@router.get("/posts", response_model=PostListResponse)
async def get_posts(
    author_id: Optional[str] = None,
    tag: Optional[str] = None,
    following: bool = False,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Get list of posts with optional filters"""
    raise NotImplementedError


@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(post_id: str):
    """Get a specific post"""
    raise NotImplementedError


@router.post("/posts", response_model=PostResponse)
async def create_post(post: PostCreate):
    """Create a new post"""
    raise NotImplementedError


@router.delete("/posts/{post_id}")
async def delete_post(post_id: str):
    """Delete a post"""
    raise NotImplementedError


@router.post("/posts/{post_id}/like")
async def like_post(post_id: str):
    """Like a post"""
    raise NotImplementedError


@router.delete("/posts/{post_id}/like")
async def unlike_post(post_id: str):
    """Unlike a post"""
    raise NotImplementedError


# Comments
@router.get("/posts/{post_id}/comments", response_model=CommentListResponse)
async def get_comments(
    post_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Get comments for a post"""
    raise NotImplementedError


@router.post("/posts/{post_id}/comments", response_model=CommentResponse)
async def create_comment(post_id: str, comment: CommentCreate):
    """Add a comment to a post"""
    raise NotImplementedError


@router.delete("/posts/{post_id}/comments/{comment_id}")
async def delete_comment(post_id: str, comment_id: str):
    """Delete a comment"""
    raise NotImplementedError


# Follows
@router.post("/users/{user_id}/follow", response_model=FollowResponse)
async def follow_user(user_id: str):
    """Follow a user"""
    raise NotImplementedError


@router.delete("/users/{user_id}/follow")
async def unfollow_user(user_id: str):
    """Unfollow a user"""
    raise NotImplementedError


@router.get("/users/{user_id}/followers", response_model=FollowListResponse)
async def get_followers(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Get followers of a user"""
    raise NotImplementedError


@router.get("/users/{user_id}/following", response_model=FollowListResponse)
async def get_following(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Get users that a user is following"""
    raise NotImplementedError
