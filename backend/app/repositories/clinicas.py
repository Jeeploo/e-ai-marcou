from google.cloud.firestore import Client

from app.core.firebase import get_firestore_client
from app.schemas.clinicas import ClinicaResponse


class ClinicaRepository:
    def __init__(self, client: Client):
        self.client = client

    def create(self, nome: str, endereco: str, cidade: str, uf: str, telefone: str | None, ativo: bool) -> ClinicaResponse:
        document = self.client.collection("clinicas").document()
        data = {"nome": nome, "endereco": endereco, "cidade": cidade, "uf": uf, "telefone": telefone, "ativo": ativo}
        document.set(data)
        return ClinicaResponse(id=document.id, **data)

    def list(self) -> list[ClinicaResponse]:
        documents = self.client.collection("clinicas").stream()
        return [
            ClinicaResponse(**{**document.to_dict(), "id": document.id})
            for document in documents
        ]

    def get_by_id(self, document_id: str) -> ClinicaResponse | None:
        document = self.client.collection("clinicas").document(document_id).get()
        if not document.exists:
            return None
        return ClinicaResponse(**{**document.to_dict(), "id": document.id})


def get_clinica_repository() -> ClinicaRepository:
    return ClinicaRepository(get_firestore_client())
