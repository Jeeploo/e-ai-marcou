from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.schemas.especialidades import EspecialidadeCreate, EspecialidadeResponse
from app.services.especialidades import EspecialidadeService, get_especialidade_service

router = APIRouter(prefix="/especialidades", tags=["Especialidades"])
ServiceDependency = Annotated[EspecialidadeService, Depends(get_especialidade_service)]


@router.post("", response_model=EspecialidadeResponse, status_code=status.HTTP_201_CREATED)
def create_especialidade(
    especialidade: EspecialidadeCreate, service: ServiceDependency
) -> EspecialidadeResponse:
    return service.create(especialidade)


@router.get("", response_model=list[EspecialidadeResponse])
def list_especialidades(service: ServiceDependency) -> list[EspecialidadeResponse]:
    return service.list()
