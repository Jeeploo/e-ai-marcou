from typing import Annotated

from fastapi import Depends, HTTPException

from app.repositories.horarios import HorarioRepository, HorarioDuplicadoError, get_horario_repository
from app.repositories.profissionais import ProfissionalRepository, get_profissional_repository
from app.schemas.horarios import HorarioCreate, HorarioResponse


class HorarioService:
    def __init__(self, repository: HorarioRepository, profissional_repository: ProfissionalRepository):
        self.repository = repository
        self.profissional_repository = profissional_repository

    def create(self, horario: HorarioCreate) -> HorarioResponse:
        profissional = self.profissional_repository.get_by_id(horario.profissionalId)
        if profissional is None or not profissional.ativo:
            raise HTTPException(400, "Profissional não existe ou está inativo")
        try:
            return self.repository.create(**horario.model_dump(),
                                          clinicaId=profissional.clinicaId, disponivel=True)
        except HorarioDuplicadoError as error:
            raise HTTPException(409, "Horário já existe") from error

    def list(self, profissionalId: str | None = None, data: str | None = None,
             disponivel: bool | None = None) -> list[HorarioResponse]:
        return self.repository.list(profissionalId=profissionalId, data=data, disponivel=disponivel)


def get_horario_service(
    repository: Annotated[HorarioRepository, Depends(get_horario_repository)],
    profissional_repository: Annotated[ProfissionalRepository, Depends(get_profissional_repository)],
) -> HorarioService:
    return HorarioService(repository, profissional_repository)
