import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.rate_limit import global_limiter
from app.api.v1.router import api_router

logger = logging.getLogger(__name__)

_RATE_LIMIT_EXEMPT_PATHS = {"/health", "/docs", "/openapi.json", "/redoc"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # rate_limit.pyのRateLimiterはプロセス内メモリのみで完結する。
    # 複数ワーカー/複数インスタンスで動かすと各プロセスが別々にカウントし、
    # Gemini APIの無料枠保護が実質的に無効化される（ワーカー数倍まで緩んでしまう）ため、
    # スケールさせる前に必ずRedis等の共有ストアへ置き換えること
    if not settings.debug:
        logger.warning(
            "rate_limit.RateLimiterはプロセス内メモリのみで動作します。"
            "複数ワーカー/複数インスタンスで実行する場合はRedis等の共有ストアに置き換えてください。"
        )
    if settings.debug:
        _ensure_dev_user()
    yield


def _ensure_dev_user():
    from app.db.session import SessionLocal
    from app.models.user import User
    DEV_USER_ID = "00000000-0000-0000-0000-000000000001"
    db = SessionLocal()
    try:
        if not db.get(User, DEV_USER_ID):
            db.add(User(
                id=DEV_USER_ID,
                email="dev@sfc-portal.local",
                display_name="Dev User",
            ))
            db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


app = FastAPI(title="SFC Portal API", version="0.1.0", docs_url="/docs", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # ブラウザの既定露出ヘッダーに含まれないため明示する（AI細分化の再試行時間・制限種別の表示に必要）
    expose_headers=["Retry-After", "X-RateLimit-Scope"],
)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # ローカル開発（DEBUG=true）では自分自身の開発作業を妨げないよう素通しする
    if not settings.debug and request.url.path not in _RATE_LIMIT_EXEMPT_PATHS:
        client_host = request.client.host if request.client else "unknown"
        try:
            global_limiter.check(client_host)
        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code, content={"detail": e.detail}, headers=e.headers
            )
    return await call_next(request)


app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}
