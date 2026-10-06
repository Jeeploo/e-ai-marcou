from typing import Annotated

from fastapi import Depends, HTTPException

from app.repositories.contracts import AgendamentoDataRepository
from app.repositories.agendamentos import (
    AgendamentoNaoEncontradoError, AgendamentoInativoError, MesmoHorarioError,
    HorarioNaoEncontradoError, HorarioIndisponivelError,
    ProfissionalNaoEncontradoError, get_agendamento_repository,
)
from app.schemas.agendamentos import AgendamentoCreate, AgendamentoResponse


class AgendamentoService:
    def __init__(self, repository: AgendamentoDataRepository):
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

    def get_by_id(self, agendamento_id: str) -> AgendamentoResponse:
        result = self.repository.get_by_id(agendamento_id)
        if result is None:
            raise HTTPException(404, "Agendamento não encontrado")
        return result

    def cancel(self, agendamento_id: str) -> AgendamentoResponse:
        return self._change(agendamento_id)

    def reschedule(self, agendamento_id: str, novoHorarioId: str) -> AgendamentoResponse:
        return self._change(agendamento_id, novoHorarioId)

    def _change(self, agendamento_id: str,
                novoHorarioId: str | None = None) -> AgendamentoResponse:
        try:
            if novoHorarioId is None:
                return self.repository.cancel(agendamento_id)
            return self.repository.reschedule(agendamento_id, novoHorarioId)
        except AgendamentoNaoEncontradoError as error:
            raise HTTPException(404, "Agendamento não encontrado") from error
        except AgendamentoInativoError as error:
            raise HTTPException(409, "Agendamento não está agendado") from error
        except MesmoHorarioError as error:
            raise HTTPException(409, "Novo horário deve ser diferente do atual") from error
        except HorarioNaoEncontradoError as error:
            raise HTTPException(404, "Horário não encontrado") from error
        except HorarioIndisponivelError as error:
            raise HTTPException(409, "Horário indisponível") from error
        except ProfissionalNaoEncontradoError as error:
            raise HTTPException(400, "Profissional não encontrado") from error

    def list(self, pacienteId: str | None = None) -> list[AgendamentoResponse]:
        return self.repository.list(pacienteId=pacienteId)


def get_agendamento_service(
    repository: Annotated[AgendamentoDataRepository, Depends(get_agendamento_repository)],
) -> AgendamentoService:
    return AgendamentoService(repository)
