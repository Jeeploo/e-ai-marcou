from fastapi import APIRouter

from app.api.routes.especialidades import router as especialidades_router
from app.api.routes.health import router as health_router

router = APIRouter(prefix="/api")
router.include_router(health_router)
router.include_router(especialidades_router)
