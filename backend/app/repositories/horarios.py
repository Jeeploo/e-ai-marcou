import hashlib
import json

from google.api_core.exceptions import AlreadyExists
from google.cloud.firestore import Client
from google.cloud.firestore_v1.base_query import FieldFilter

from app.core.firebase import get_firestore_client
from app.schemas.horarios import HorarioResponse


class HorarioDuplicadoError(Exception):
    pass


class HorarioRepository:
    def __init__(self, client: Client):
        self.client = client

    def create(self, profissionalId: str, clinicaId: str, data: str, hora: str,
               disponivel: bool) -> HorarioResponse:
        # ID estável + create (precondição de inexistência) impede duplicidade concorrente.
        key = json.dumps([profissionalId, data, hora], ensure_ascii=False)
        document_id = hashlib.sha256(key.encode()).hexdigest()
        document = self.client.collection("horarios").document(document_id)
        payload = dict(profissionalId=profissionalId, clinicaId=clinicaId,
                       data=data, hora=hora, disponivel=disponivel)
        try:
            document.create(payload)
        except AlreadyExists as error:
            raise HorarioDuplicadoError from error
        return HorarioResponse(id=document.id, **payload)

    def list(self, profissionalId: str | None = None, data: str | None = None,
             disponivel: bool | None = None) -> list[HorarioResponse]:
        query = self.client.collection("horarios")
        filters = {"profissionalId": profissionalId, "data": data, "disponivel": disponivel}
        # Apenas um filtro no Firestore; os restantes não exigem índice composto.
        for field, value in filters.items():
            if value is not None:
                query = query.where(filter=FieldFilter(field, "==", value))
                break
        items = [HorarioResponse(**{**doc.to_dict(), "id": doc.id}) for doc in query.stream()]
        return [item for item in items if all(
            value is None or getattr(item, field) == value for field, value in filters.items()
        )]


def get_horario_repository() -> HorarioRepository:
    return HorarioRepository(get_firestore_client())
