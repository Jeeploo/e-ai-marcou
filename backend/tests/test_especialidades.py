from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.repositories import especialidades as repository_module
from app.repositories.especialidades import (
    EspecialidadeRepository,
    get_especialidade_repository,
)
from app.schemas.especialidades import EspecialidadeCreate, EspecialidadeResponse
from app.services.especialidades import EspecialidadeService


@pytest.fixture(autouse=True)
def block_real_firestore(monkeypatch):
    monkeypatch.setattr(
        repository_module,
        "get_firestore_client",
        Mock(side_effect=AssertionError("Os testes não podem acessar Firestore real")),
    )


@pytest.fixture
def especialidade():
    return EspecialidadeResponse(
        id="generated-id", nome="Cardiologia", descricao="Atendimento especializado",
        ativo=True,
    )


@pytest.fixture
def repository(especialidade):
    mock = Mock(spec=EspecialidadeRepository)
    mock.create.return_value = especialidade
    mock.list.return_value = [especialidade]
    return mock


@pytest.fixture
def client(repository):
    previous_overrides = app.dependency_overrides.copy()
    app.dependency_overrides[get_especialidade_repository] = lambda: repository
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(previous_overrides)


def test_create_endpoint_returns_201_and_trims_strings(client, repository, especialidade):
    response = client.post("/api/especialidades", json={
        "nome": "  Cardiologia  ", "descricao": "  Atendimento especializado  ",
    })
    assert response.status_code == 201
    assert response.json() == especialidade.model_dump()
    repository.create.assert_called_once_with(
        nome="Cardiologia", descricao="Atendimento especializado", ativo=True,
    )


@pytest.mark.parametrize("payload", [{}, {"nome": ""}, {"nome": " \t\n "}, {"nome": None}])
def test_create_endpoint_rejects_invalid_name(client, repository, payload):
    response = client.post("/api/especialidades", json=payload)
    assert response.status_code == 422
    assert any(error["loc"] == ["body", "nome"] for error in response.json()["detail"])
    repository.create.assert_not_called()


@pytest.mark.parametrize("description", [None, "omitted"])
def test_create_endpoint_allows_optional_description(client, repository, description):
    payload = {"nome": "Cardiologia"}
    if description is None:
        payload["descricao"] = None
    repository.create.return_value = EspecialidadeResponse(
        id="generated-id", nome="Cardiologia", descricao=None, ativo=True,
    )
    response = client.post("/api/especialidades", json=payload)
    assert response.status_code == 201
    assert response.json() == {
        "id": "generated-id", "nome": "Cardiologia", "descricao": None, "ativo": True,
    }
    repository.create.assert_called_once_with(nome="Cardiologia", descricao=None, ativo=True)


def test_client_cannot_create_inactive_especialidade(client, repository):
    response = client.post("/api/especialidades", json={"nome": "Cardiologia", "ativo": False})
    assert response.status_code == 201
    assert response.json()["ativo"] is True
    repository.create.assert_called_once_with(nome="Cardiologia", descricao=None, ativo=True)


def test_list_endpoint(client, repository, especialidade):
    response = client.get("/api/especialidades")
    assert response.status_code == 200
    assert response.json() == [especialidade.model_dump()]
    repository.list.assert_called_once_with()


def test_list_endpoint_empty_collection(client, repository):
    repository.list.return_value = []
    response = client.get("/api/especialidades")
    assert response.status_code == 200
    assert response.json() == []


def test_service_create_sets_active(repository, especialidade):
    service = EspecialidadeService(repository)
    assert service.create(EspecialidadeCreate(nome=" Cardiologia ", descricao=" Atendimento especializado ")) == especialidade
    repository.create.assert_called_once_with(
        nome="Cardiologia", descricao="Atendimento especializado", ativo=True,
    )


def test_service_list(repository, especialidade):
    assert EspecialidadeService(repository).list() == [especialidade]
    repository.list.assert_called_once_with()


def test_repository_create_uses_firestore_generated_id(especialidade):
    firestore = Mock()
    document = firestore.collection.return_value.document.return_value
    document.id = "generated-id"
    result = EspecialidadeRepository(firestore).create(
        nome="Cardiologia", descricao="Atendimento especializado", ativo=True,
    )
    assert result == especialidade
    firestore.collection.assert_called_once_with("especialidades")
    firestore.collection.return_value.document.assert_called_once_with()
    document.set.assert_called_once_with({
        "nome": "Cardiologia", "descricao": "Atendimento especializado", "ativo": True,
    })


def test_repository_list_reads_document_ids_and_fields(especialidade):
    firestore = Mock()
    document = Mock()
    document.id = especialidade.id
    document.to_dict.return_value = especialidade.model_dump(exclude={"id"})
    firestore.collection.return_value.stream.return_value = iter([document])
    assert EspecialidadeRepository(firestore).list() == [especialidade]
    firestore.collection.assert_called_once_with("especialidades")
    firestore.collection.return_value.stream.assert_called_once_with()
    document.to_dict.assert_called_once_with()


def test_repository_dependency_uses_configured_client(monkeypatch):
    firestore = Mock()
    get_client = Mock(return_value=firestore)
    monkeypatch.setattr(repository_module, "get_firestore_client", get_client)
    assert get_especialidade_repository().client is firestore
    get_client.assert_called_once_with()
