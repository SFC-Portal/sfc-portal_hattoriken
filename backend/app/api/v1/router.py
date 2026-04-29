from fastapi import APIRouter
from app.api.v1.endpoints import syllabus, timetable, tasks, sns, bus, auth

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(syllabus.router)
api_router.include_router(timetable.router)
api_router.include_router(tasks.router)
api_router.include_router(sns.router)
api_router.include_router(bus.router)
