from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
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
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}
