from google.cloud.firestore import Client

from app.core.firebase import get_firestore_client
from app.schemas.especialidades import EspecialidadeResponse


class EspecialidadeRepository:
    def __init__(self, client: Client):
        self.client = client

    def create(
        self, nome: str, descricao: str | None, ativo: bool
    ) -> EspecialidadeResponse:
        document = self.client.collection("especialidades").document()
        data = {"nome": nome, "descricao": descricao, "ativo": ativo}
        document.set(data)
        return EspecialidadeResponse(id=document.id, **data)

    def list(self) -> list[EspecialidadeResponse]:
        documents = self.client.collection("especialidades").stream()
        return [
            EspecialidadeResponse(**{**document.to_dict(), "id": document.id})
            for document in documents
        ]

    def get_by_id(self, document_id: str) -> EspecialidadeResponse | None:
        document = self.client.collection("especialidades").document(document_id).get()
        if not document.exists:
            return None
        return EspecialidadeResponse(**{**document.to_dict(), "id": document.id})


def get_especialidade_repository() -> EspecialidadeRepository:
    return EspecialidadeRepository(get_firestore_client())
