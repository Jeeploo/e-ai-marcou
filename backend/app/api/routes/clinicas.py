from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.schemas.clinicas import ClinicaCreate, ClinicaResponse
from app.services.clinicas import ClinicaService, get_clinica_service

router = APIRouter(prefix="/clinicas", tags=["Clínicas"])
ServiceDependency = Annotated[ClinicaService, Depends(get_clinica_service)]


@router.post("", response_model=ClinicaResponse, status_code=status.HTTP_201_CREATED)
def create_clinica(
    clinica: ClinicaCreate, service: ServiceDependency
) -> ClinicaResponse:
    return service.create(clinica)


@router.get("", response_model=list[ClinicaResponse])
def list_clinicas(service: ServiceDependency) -> list[ClinicaResponse]:
    return service.list()
