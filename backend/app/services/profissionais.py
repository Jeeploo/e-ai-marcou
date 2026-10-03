from typing import Annotated

from fastapi import Depends, HTTPException, status

from app.repositories.clinicas import ClinicaRepository, get_clinica_repository
from app.repositories.especialidades import EspecialidadeRepository, get_especialidade_repository
from app.repositories.profissionais import ProfissionalRepository, get_profissional_repository
from app.schemas.profissionais import ProfissionalCreate, ProfissionalResponse


class ProfissionalService:
    def __init__(
        self,
        repository: ProfissionalRepository,
        especialidade_repository: EspecialidadeRepository,
        clinica_repository: ClinicaRepository,
    ):
        self.repository = repository
        self.especialidade_repository = especialidade_repository
        self.clinica_repository = clinica_repository

    def create(self, profissional: ProfissionalCreate) -> ProfissionalResponse:
        especialidade = self.especialidade_repository.get_by_id(profissional.especialidadeId)
        if especialidade is None or not especialidade.ativo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Especialidade não existe ou está inativa",
            )
        clinica = self.clinica_repository.get_by_id(profissional.clinicaId)
        if clinica is None or not clinica.ativo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Clínica não existe ou está inativa",
            )
        return self.repository.create(**profissional.model_dump(), ativo=True)

    def list(self) -> list[ProfissionalResponse]:
        return self.repository.list()


def get_profissional_service(
    repository: Annotated[ProfissionalRepository, Depends(get_profissional_repository)],
    especialidade_repository: Annotated[EspecialidadeRepository, Depends(get_especialidade_repository)],
    clinica_repository: Annotated[ClinicaRepository, Depends(get_clinica_repository)],
) -> ProfissionalService:
    return ProfissionalService(repository, especialidade_repository, clinica_repository)
