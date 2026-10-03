from typing import Annotated

from fastapi import Depends, HTTPException

from app.repositories.agendamentos import (
    AgendamentoRepository, HorarioNaoEncontradoError, HorarioIndisponivelError,
    ProfissionalNaoEncontradoError, get_agendamento_repository,
)
from app.schemas.agendamentos import AgendamentoCreate, AgendamentoResponse


class AgendamentoService:
    def __init__(self, repository: AgendamentoRepository):
        self.repository = repository

    def create(self, agendamento: AgendamentoCreate) -> AgendamentoResponse:
        try:
            return self.repository.create(**agendamento.model_dump())
        except HorarioNaoEncontradoError as error:
            raise HTTPException(404, "Horário não encontrado") from error
        except HorarioIndisponivelError as error:
            raise HTTPException(409, "Horário indisponível") from error
        except ProfissionalNaoEncontradoError as error:
            raise HTTPException(400, "Profissional não encontrado") from error

    def list(self, pacienteId: str | None = None) -> list[AgendamentoResponse]:
        return self.repository.list(pacienteId=pacienteId)


def get_agendamento_service(
    repository: Annotated[AgendamentoRepository, Depends(get_agendamento_repository)],
) -> AgendamentoService:
    return AgendamentoService(repository)
