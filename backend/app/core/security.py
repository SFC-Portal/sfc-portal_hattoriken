import jwt
from jwt import PyJWKClient

from app.core.config import settings


class InvalidTokenError(Exception):
    pass


_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    """SupabaseのJWKSエンドポイントから署名検証用の公開鍵を取得・キャッシュするクライアント。
    このプロジェクトは新方式のJWT Signing Keys（非対称鍵、ES256）を使っているため、
    共有シークレットによるHS256検証ではなく公開鍵によるJWKS検証を行う。
    """
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True)
    return _jwks_client


def decode_supabase_jwt(token: str) -> dict:
    """Supabase Authが発行したaccess_tokenを検証する（JWKS経由の非対称鍵検証）"""
    try:
        signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience=settings.supabase_jwt_audience,
        )
    except jwt.PyJWTError as e:
        raise InvalidTokenError(str(e)) from e
