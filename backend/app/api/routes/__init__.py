from fastapi import APIRouter

from app.api.routes.clinicas import router as clinicas_router
from app.api.routes.profissionais import router as profissionais_router
from app.api.routes.especialidades import router as especialidades_router
from app.api.routes.health import router as health_router
from app.api.routes.horarios import router as horarios_router
from app.api.routes.agendamentos import router as agendamentos_router

router = APIRouter(prefix="/api")
router.include_router(health_router)
router.include_router(especialidades_router)
router.include_router(clinicas_router)
router.include_router(profissionais_router)

router.include_router(horarios_router)
router.include_router(agendamentos_router)
