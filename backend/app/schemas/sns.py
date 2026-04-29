from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PostAuthor(BaseModel):
    id: str
    display_name: str
    avatar_url: Optional[str] = None
    faculty: Optional[str] = None


class PostBase(BaseModel):
    content: str
    images: Optional[List[str]] = None
    tags: Optional[List[str]] = None


class PostCreate(PostBase):
    pass


class PostResponse(PostBase):
    id: str
    author_id: str
    author: PostAuthor
    likes_count: int
    comments_count: int
    is_liked: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PostListResponse(BaseModel):
    data: List[PostResponse]
    total: int
    page: int
    limit: int
    has_more: bool


class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    pass


class CommentResponse(CommentBase):
    id: str
    post_id: str
    author_id: str
    author: PostAuthor
    likes_count: int
    is_liked: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CommentListResponse(BaseModel):
    data: List[CommentResponse]
    total: int
    page: int
    limit: int
    has_more: bool


class FollowResponse(BaseModel):
    id: str
    follower_id: str
    following_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class FollowListResponse(BaseModel):
    data: List[FollowResponse]
    total: int
    page: int
    limit: int
    has_more: bool
