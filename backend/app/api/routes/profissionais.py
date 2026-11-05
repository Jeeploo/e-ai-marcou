from app.schemas.busca import BuscaResponse
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, status, Query, HTTPException

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


@router.get("/busca", response_model=list[BuscaResponse])
def buscar(
    service: ServiceDependency,
    latitude: float | None = Query(None, ge=-90, le=90, allow_inf_nan=False),
    longitude: float | None = Query(None, ge=-180, le=180, allow_inf_nan=False),
    ordem: Literal["recomendados", "distancia", "preco"] = "recomendados",
    especialidadeId: str | None = None, q: str = "",
    valorMaximo: float | None = Query(None, ge=0, allow_inf_nan=False),
):
    if (latitude is None) != (longitude is None):
        raise HTTPException(422, "Informe latitude e longitude juntas")
    return service.search(latitude, longitude, ordem, especialidadeId, q, valorMaximo)
