from google.cloud.firestore import Client

from app.core.firebase import get_firestore_client
from app.schemas.profissionais import ProfissionalResponse


class ProfissionalRepository:
    def __init__(self, client: Client):
        self.client = client

    def create(self, nome: str, crm: str, especialidadeId: str, clinicaId: str, valorConsulta: float, fotoUrl: str | None, ativo: bool) -> ProfissionalResponse:
        document = self.client.collection("profissionais").document()
        data = {"nome": nome, "crm": crm, "especialidadeId": especialidadeId, "clinicaId": clinicaId, "valorConsulta": valorConsulta, "fotoUrl": fotoUrl, "ativo": ativo}
        document.set(data)
        return ProfissionalResponse(id=document.id, **data)

    def list(self) -> list[ProfissionalResponse]:
        documents = self.client.collection("profissionais").stream()
        return [
            ProfissionalResponse(**{**document.to_dict(), "id": document.id})
            for document in documents
        ]


    def get_by_id(self, document_id: str) -> ProfissionalResponse | None:
        document = self.client.collection("profissionais").document(document_id).get()
        if not document.exists:
            return None
        return ProfissionalResponse(**{**document.to_dict(), "id": document.id})


def get_profissional_repository() -> ProfissionalRepository:
    return ProfissionalRepository(get_firestore_client())
