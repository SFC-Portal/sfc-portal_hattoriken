from fastapi import APIRouter
from app.api.v1.endpoints import syllabus, timetable

api_router = APIRouter()
api_router.include_router(syllabus.router)
api_router.include_router(timetable.router)
