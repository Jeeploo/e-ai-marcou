from typing import Annotated

from fastapi import Depends

from app.repositories.especialidades import (
    EspecialidadeRepository,
    get_especialidade_repository,
)
from app.schemas.especialidades import EspecialidadeCreate, EspecialidadeResponse


class EspecialidadeService:
    def __init__(self, repository: EspecialidadeRepository):
        self.repository = repository

    def create(self, especialidade: EspecialidadeCreate) -> EspecialidadeResponse:
        return self.repository.create(
            nome=especialidade.nome, descricao=especialidade.descricao, ativo=True
        )

    def list(self) -> list[EspecialidadeResponse]:
        return self.repository.list()


def get_especialidade_service(
    repository: Annotated[
        EspecialidadeRepository, Depends(get_especialidade_repository)
    ],
) -> EspecialidadeService:
    return EspecialidadeService(repository)
