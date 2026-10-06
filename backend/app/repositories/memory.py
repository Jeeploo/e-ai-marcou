"""Persistência local usando os schemas públicos e um lock comum às operações."""
import hashlib
import json
from datetime import date, datetime, timedelta, timezone
from threading import RLock
from uuid import uuid4

from app.repositories.agendamentos import (
    AgendamentoInativoError, AgendamentoNaoEncontradoError, HorarioIndisponivelError,
    HorarioNaoEncontradoError, MesmoHorarioError, ProfissionalNaoEncontradoError,
)
from app.repositories.horarios import HorarioDuplicadoError
from app.schemas.agendamentos import AgendamentoResponse
from app.schemas.clinicas import ClinicaResponse
from app.schemas.especialidades import EspecialidadeResponse
from app.schemas.horarios import HorarioResponse
from app.schemas.profissionais import ProfissionalResponse

MODELS = {
    "especialidades": EspecialidadeResponse, "clinicas": ClinicaResponse,
    "profissionais": ProfissionalResponse, "horarios": HorarioResponse,
    "agendamentos": AgendamentoResponse,
}


class MemoryStore:
    def __init__(self):
        self.lock = RLock()
        self.collections = {name: {} for name in MODELS}
        self._seed()

    def _seed(self):
        for index, specialty in enumerate(["Cardiologia", "Dermatologia", "Ortopedia", "Clínica Geral"]):
            MemoryRepository(self, "especialidades").create(
                id=f"demo-especialidade-{index}", nome=specialty,
                descricao=f"Atendimento em {specialty.lower()}", ativo=True,
            )
        for index, name in enumerate(["Clínica Boa Saúde", "Centro Médico Recife"]):
            MemoryRepository(self, "clinicas").create(
                id=f"demo-clinica-{index}", nome=name, endereco=f"Av. Boa Saúde, {100 + index}",
                cidade="Recife", uf="PE", telefone="(81) 3333-1000", ativo=True,
            )
        for index, name in enumerate(["Dra. Ana Souza", "Dr. Lucas Martins", "Dra. Juliana Lima", "Dr. Rafael Costa", "Dra. Mariana Alves", "Dr. Pedro Henrique", "Dra. Camila Rocha", "Dr. Bruno Silva"]):
            professional = MemoryRepository(self, "profissionais").create(
                id=f"demo-profissional-{index}", nome=name, crm=f"CRM-PE {21000 + index}",
                especialidadeId=f"demo-especialidade-{index // 2}", clinicaId=f"demo-clinica-{index % 2}",
                valorConsulta=140 + index * 20, fotoUrl=None, ativo=True,
            )
            for offset in range(15):
                for time in ["08:30", "09:30", "10:30", "14:00", "15:30", "17:00"]:
                    MemoryHorarioRepository(self).create(
                        profissionalId=professional.id, clinicaId=professional.clinicaId,
                        data=(date.today() + timedelta(days=offset)).isoformat(), hora=time, disponivel=True,
                    )
        repository = MemoryAgendamentoRepository(self)
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        slots = MemoryHorarioRepository(self).list(profissionalId="demo-profissional-0", data=tomorrow)
        repository.create("paciente-demo", slots[0].id)
        history = repository.create("paciente-demo", slots[1].id)
        repository.cancel(history.id)


class MemoryRepository:
    def __init__(self, store: MemoryStore, collection: str):
        self.store = store
        self.collection = collection
        self.model = MODELS[collection]

    def create(self, **payload):
        with self.store.lock:
            result = self.model(**{"id": uuid4().hex, **payload})
            self.store.collections[self.collection][result.id] = result
            return result.model_copy(deep=True)

    def get_by_id(self, document_id):
        with self.store.lock:
            result = self.store.collections[self.collection].get(document_id)
            return result.model_copy(deep=True) if result is not None else None

    def list(self, **filters):
        with self.store.lock:
            return [item.model_copy(deep=True) for item in self.store.collections[self.collection].values()
                    if all(value is None or getattr(item, field) == value for field, value in filters.items())]


class MemoryHorarioRepository(MemoryRepository):
    def __init__(self, store):
        super().__init__(store, "horarios")

    def create(self, profissionalId, clinicaId, data, hora, disponivel):
        key = json.dumps([profissionalId, data, hora], ensure_ascii=False)
        document_id = hashlib.sha256(key.encode()).hexdigest()
        with self.store.lock:
            if document_id in self.store.collections[self.collection]:
                raise HorarioDuplicadoError
            return super().create(id=document_id, profissionalId=profissionalId,
                                  clinicaId=clinicaId, data=data, hora=hora, disponivel=disponivel)

    def list(self, profissionalId=None, data=None, disponivel=None):
        return super().list(profissionalId=profissionalId, data=data, disponivel=disponivel)


class MemoryAgendamentoRepository(MemoryRepository):
    def __init__(self, store):
        super().__init__(store, "agendamentos")

    def _reservation(self, horarioId):
        horario = self.store.collections["horarios"].get(horarioId)
        if horario is None:
            raise HorarioNaoEncontradoError
        if not horario.disponivel:
            raise HorarioIndisponivelError
        professional = self.store.collections["profissionais"].get(horario.profissionalId)
        if professional is None:
            raise ProfissionalNaoEncontradoError
        return dict(horarioId=horario.id, profissionalId=horario.profissionalId,
                    clinicaId=horario.clinicaId, data=horario.data, hora=horario.hora,
                    valor=professional.valorConsulta)

    def create(self, pacienteId, horarioId):
        with self.store.lock:
            payload = self._reservation(horarioId)
            result = super().create(pacienteId=pacienteId, **payload, status="agendado",
                                    criadoEm=datetime.now(timezone.utc))
            self.store.collections["horarios"][horarioId].disponivel = False
            return result

    def list(self, pacienteId=None):
        return super().list(pacienteId=pacienteId)

    def cancel(self, agendamento_id):
        return self._change(agendamento_id)

    def reschedule(self, agendamento_id, novoHorarioId):
        return self._change(agendamento_id, novoHorarioId)

    def _change(self, agendamento_id, novoHorarioId=None):
        with self.store.lock:
            current = self.store.collections[self.collection].get(agendamento_id)
            if current is None:
                raise AgendamentoNaoEncontradoError
            if current.status != "agendado":
                raise AgendamentoInativoError
            if novoHorarioId == current.horarioId:
                raise MesmoHorarioError
            old = self.store.collections["horarios"].get(current.horarioId)
            if old is None:
                raise HorarioNaoEncontradoError
            updates = {"status": "cancelado"} if novoHorarioId is None else self._reservation(novoHorarioId)
            result = AgendamentoResponse(**{**current.model_dump(), **updates})
            # Validar tudo antes de modificar o estado; leituras e gravações usam o mesmo lock.
            if novoHorarioId is not None:
                self.store.collections["horarios"][novoHorarioId].disponivel = False
            old.disponivel = True
            self.store.collections[self.collection][agendamento_id] = result
            return result.model_copy(deep=True)
