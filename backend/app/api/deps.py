from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import InvalidTokenError, decode_supabase_jwt
from app.db.session import get_db
from app.models.user import User

# ローカル開発（DEBUG=true）でAuthorizationヘッダが無い場合のみ使うフォールバックユーザー
DEV_USER_ID = "00000000-0000-0000-0000-000000000001"
_DEV_PAYLOAD = {
    "sub": DEV_USER_ID,
    "email": "dev@sfc-portal.local",
    "user_metadata": {"full_name": "Dev User"},
}


def _extract_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    return authorization.split(" ", 1)[1]


def get_current_user_payload(authorization: Optional[str] = Header(None)) -> dict:
    """JWTを検証し、生のペイロードを返す。DB上にusers行があるかは問わない（=未登録でも通る）"""
    token = _extract_bearer_token(authorization)

    if token is None:
        if settings.debug:
            return _DEV_PAYLOAD
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Authorization header missing")

    try:
        return decode_supabase_jwt(token)
    except InvalidTokenError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")


def get_current_user_id(payload: dict = Depends(get_current_user_payload)) -> str:
    return payload["sub"]


def require_registered_user_id(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> str:
    """usersテーブルに登録済みであることを要求する。未登録ならアカウント作成確認画面へ誘導させるため403を返す"""
    if not db.get(User, user_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "account_not_registered")
    return user_id
