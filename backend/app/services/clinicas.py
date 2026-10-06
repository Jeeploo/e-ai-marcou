from typing import Annotated

from fastapi import Depends

from app.repositories.contracts import CatalogRepository
from app.repositories.clinicas import get_clinica_repository
from app.schemas.clinicas import ClinicaCreate, ClinicaResponse


class ClinicaService:
    def __init__(self, repository: CatalogRepository[ClinicaResponse]):
        self.repository = repository

    def create(self, clinica: ClinicaCreate) -> ClinicaResponse:
        return self.repository.create(**clinica.model_dump(), ativo=True)

    def list(self) -> list[ClinicaResponse]:
        return self.repository.list()


def get_clinica_service(
    repository: Annotated[CatalogRepository[ClinicaResponse], Depends(get_clinica_repository)],
) -> ClinicaService:
    return ClinicaService(repository)
