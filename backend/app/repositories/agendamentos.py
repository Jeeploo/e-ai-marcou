from datetime import datetime, timezone

from google.cloud.firestore import Client, transactional
from google.cloud.firestore_v1.base_query import FieldFilter

from app.core.firebase import get_firestore_client
from app.schemas.agendamentos import AgendamentoResponse
from app.schemas.horarios import HorarioResponse
from app.schemas.profissionais import ProfissionalResponse


class HorarioNaoEncontradoError(Exception):
    pass


class HorarioIndisponivelError(Exception):
    pass


class ProfissionalNaoEncontradoError(Exception):
    pass


class AgendamentoRepository:
    def __init__(self, client: Client):
        self.client = client

    def create(self, pacienteId: str, horarioId: str) -> AgendamentoResponse:
        horario_ref = self.client.collection("horarios").document(horarioId)
        agendamento_ref = self.client.collection("agendamentos").document()

        @transactional
        def reserve(transaction):
            snapshot = horario_ref.get(transaction=transaction)
            if not snapshot.exists:
                raise HorarioNaoEncontradoError
            horario = HorarioResponse(**{**snapshot.to_dict(), "id": snapshot.id})
            if not horario.disponivel:
                raise HorarioIndisponivelError
            profissional_ref = self.client.collection("profissionais").document(horario.profissionalId)
            profissional_snapshot = profissional_ref.get(transaction=transaction)
            if not profissional_snapshot.exists:
                raise ProfissionalNaoEncontradoError
            profissional = ProfissionalResponse(
                **{**profissional_snapshot.to_dict(), "id": profissional_snapshot.id}
            )
            payload = dict(
                pacienteId=pacienteId, horarioId=horarioId,
                profissionalId=horario.profissionalId, clinicaId=horario.clinicaId,
                data=horario.data, hora=horario.hora, valor=profissional.valorConsulta,
                status="agendado", criadoEm=datetime.now(timezone.utc),
            )
            result = AgendamentoResponse(id=agendamento_ref.id, **payload)
            # Todas as leituras precedem as duas gravações, confirmadas juntas pelo SDK.
            transaction.create(agendamento_ref, payload)
            transaction.update(horario_ref, {"disponivel": False})
            return result

        return reserve(self.client.transaction())

    def list(self, pacienteId: str | None = None) -> list[AgendamentoResponse]:
        query = self.client.collection("agendamentos")
        if pacienteId is not None:
            query = query.where(filter=FieldFilter("pacienteId", "==", pacienteId))
        return [AgendamentoResponse(**{**doc.to_dict(), "id": doc.id}) for doc in query.stream()]


def get_agendamento_repository() -> AgendamentoRepository:
    return AgendamentoRepository(get_firestore_client())
