from typing import Annotated

from fastapi import APIRouter, Depends

from app.schemas.horarios import Data, HorarioCreate, HorarioResponse
from app.services.horarios import HorarioService, get_horario_service

router = APIRouter(prefix="/horarios", tags=["Horários"])
ServiceDependency = Annotated[HorarioService, Depends(get_horario_service)]


@router.post("", response_model=HorarioResponse, status_code=201)
def create_horario(horario: HorarioCreate, service: ServiceDependency) -> HorarioResponse:
    return service.create(horario)


@router.get("", response_model=list[HorarioResponse])
def list_horarios(service: ServiceDependency, profissionalId: str | None = None,
                  data: Data | None = None, disponivel: bool | None = None) -> list[HorarioResponse]:
    return service.list(profissionalId=profissionalId, data=data, disponivel=disponivel)
