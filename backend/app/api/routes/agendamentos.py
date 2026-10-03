from typing import Annotated

from fastapi import APIRouter, Depends

from app.schemas.agendamentos import AgendamentoCreate, AgendamentoResponse
from app.services.agendamentos import AgendamentoService, get_agendamento_service

router = APIRouter(prefix="/agendamentos", tags=["Agendamentos"])
ServiceDependency = Annotated[AgendamentoService, Depends(get_agendamento_service)]


@router.post("", response_model=AgendamentoResponse, status_code=201)
def create_agendamento(agendamento: AgendamentoCreate, service: ServiceDependency) -> AgendamentoResponse:
    return service.create(agendamento)


@router.get("", response_model=list[AgendamentoResponse])
def list_agendamentos(service: ServiceDependency, pacienteId: str | None = None) -> list[AgendamentoResponse]:
    return service.list(pacienteId=pacienteId)
