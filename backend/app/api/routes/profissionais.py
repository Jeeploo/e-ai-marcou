from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.schemas.profissionais import ProfissionalCreate, ProfissionalResponse
from app.services.profissionais import ProfissionalService, get_profissional_service

router = APIRouter(prefix="/profissionais", tags=["Profissionais"])
ServiceDependency = Annotated[ProfissionalService, Depends(get_profissional_service)]


@router.post("", response_model=ProfissionalResponse, status_code=status.HTTP_201_CREATED)
def create_profissional(
    profissional: ProfissionalCreate, service: ServiceDependency
) -> ProfissionalResponse:
    return service.create(profissional)


@router.get("", response_model=list[ProfissionalResponse])
def list_profissionais(service: ServiceDependency) -> list[ProfissionalResponse]:
    return service.list()
