from app.repositories.contracts import CatalogRepository

from google.cloud.firestore import Client

from app.core.firebase import get_firestore_client
from app.schemas.clinicas import ClinicaResponse


class ClinicaRepository:
    def __init__(self, client: Client):
        self.client = client

    def create(self, **data) -> ClinicaResponse:
        document = self.client.collection("clinicas").document()
        result = ClinicaResponse(id=document.id, **data)
        document.set(result.model_dump(exclude={"id"}))
        return result

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


def get_clinica_repository() -> CatalogRepository[ClinicaResponse]:
    from app.repositories.provider import select_repository

    return select_repository("clinicas", lambda: ClinicaRepository(get_firestore_client()))
