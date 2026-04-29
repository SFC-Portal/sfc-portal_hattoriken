from typing import Optional, List
from sqlalchemy.orm import Session


class SnsService:
    """Service class for SNS-related operations"""

    def __init__(self, db: Session):
        self.db = db

    # Posts
    async def get_posts(
        self,
        user_id: str,
        author_id: Optional[str] = None,
        tag: Optional[str] = None,
        following: bool = False,
        page: int = 1,
        limit: int = 20,
    ):
        """Get paginated list of posts"""
        raise NotImplementedError

    async def get_post(self, post_id: str, user_id: str):
        """Get a single post by ID"""
        raise NotImplementedError

    async def create_post(self, user_id: str, data: dict):
        """Create a new post"""
        raise NotImplementedError

    async def delete_post(self, post_id: str, user_id: str):
        """Delete a post"""
        raise NotImplementedError

    async def like_post(self, post_id: str, user_id: str):
        """Like a post"""
        raise NotImplementedError

    async def unlike_post(self, post_id: str, user_id: str):
        """Unlike a post"""
        raise NotImplementedError

    # Comments
    async def get_comments(self, post_id: str, user_id: str, page: int = 1, limit: int = 20):
        """Get comments for a post"""
        raise NotImplementedError

    async def create_comment(self, post_id: str, user_id: str, data: dict):
        """Create a comment on a post"""
        raise NotImplementedError

    async def delete_comment(self, comment_id: str, user_id: str):
        """Delete a comment"""
        raise NotImplementedError

    # Follows
    async def follow_user(self, follower_id: str, following_id: str):
        """Follow a user"""
        raise NotImplementedError

    async def unfollow_user(self, follower_id: str, following_id: str):
        """Unfollow a user"""
        raise NotImplementedError

    async def get_followers(self, user_id: str, page: int = 1, limit: int = 20):
        """Get followers of a user"""
        raise NotImplementedError

    async def get_following(self, user_id: str, page: int = 1, limit: int = 20):
        """Get users that a user is following"""
        raise NotImplementedError
