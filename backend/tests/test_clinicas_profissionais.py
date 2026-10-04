from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.repositories import clinicas, especialidades, profissionais
from app.schemas.clinicas import ClinicaResponse
from app.schemas.especialidades import EspecialidadeResponse
from app.schemas.profissionais import ProfissionalResponse


CLINICA = {
    "nome": "Clínica Central", "endereco": "Rua Central, 10", "cidade": "Recife",
    "uf": "PE", "telefone": None,
}
PROFISSIONAL = {
    "nome": "Maria Silva", "crm": "12345", "especialidadeId": "especialidade-id",
    "clinicaId": "clinica-id", "valorConsulta": 150.0, "fotoUrl": None,
}
MODULES = [
    (clinicas, clinicas.ClinicaRepository, clinicas.get_clinica_repository,
     ClinicaResponse, "clinicas", CLINICA),
    (profissionais, profissionais.ProfissionalRepository, profissionais.get_profissional_repository,
     ProfissionalResponse, "profissionais", PROFISSIONAL),
]


@pytest.fixture(autouse=True)
def block_real_firestore(monkeypatch):
    for module in (clinicas, especialidades, profissionais):
        monkeypatch.setattr(module, "get_firestore_client", Mock(
            side_effect=AssertionError("Os testes não podem acessar Firestore real")
        ))


@pytest.fixture
def repositories():
    clinic = Mock(spec=clinicas.ClinicaRepository)
    specialty = Mock(spec=especialidades.EspecialidadeRepository)
    professional = Mock(spec=profissionais.ProfissionalRepository)
    clinic.create.side_effect = lambda **data: ClinicaResponse(id="clinica-id", **data)
    professional.create.side_effect = lambda **data: ProfissionalResponse(id="profissional-id", **data)
    clinic.get_by_id.return_value = ClinicaResponse(id="clinica-id", **CLINICA, ativo=True)
    specialty.get_by_id.return_value = EspecialidadeResponse(
        id="especialidade-id", nome="Cardiologia", descricao=None, ativo=True,
    )
    clinic.list.return_value = [clinic.get_by_id.return_value]
    professional.list.return_value = [ProfissionalResponse(id="profissional-id", **PROFISSIONAL, ativo=True)]
    return clinic, specialty, professional


@pytest.fixture
def client(repositories):
    clinic, specialty, professional = repositories
    previous = app.dependency_overrides.copy()
    app.dependency_overrides.update({
        clinicas.get_clinica_repository: lambda: clinic,
        especialidades.get_especialidade_repository: lambda: specialty,
        profissionais.get_profissional_repository: lambda: professional,
    })
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(previous)


@pytest.mark.parametrize("path,payload,index,document_id", [
    ("clinicas", CLINICA, 0, "clinica-id"),
    ("profissionais", PROFISSIONAL, 2, "profissional-id"),
])
def test_create_trims_strings_returns_201_and_sets_active(client, repositories, path, payload, index, document_id):
    data = {key: f"  {value}  " if isinstance(value, str) else value for key, value in payload.items()}
    data["ativo"] = False
    response = client.post(f"/api/{path}", json=data)
    assert response.status_code == 201
    assert response.json() == {"id": document_id, **payload, "ativo": True}
    repositories[index].create.assert_called_once_with(**payload, ativo=True)
    if path == "profissionais":
        repositories[1].get_by_id.assert_called_once_with("especialidade-id")
        repositories[0].get_by_id.assert_called_once_with("clinica-id")


@pytest.mark.parametrize("path,index", [("clinicas", 0), ("profissionais", 2)])
@pytest.mark.parametrize("empty", [False, True])
def test_list(client, repositories, path, index, empty):
    repository = repositories[index]
    if empty:
        repository.list.return_value = []
    response = client.get(f"/api/{path}")
    assert response.status_code == 200
    assert response.json() == [item.model_dump() for item in repository.list.return_value]
    repository.list.assert_called_once_with()
    for related in repositories[:2]:
        related.get_by_id.assert_not_called()


@pytest.mark.parametrize("path,payload,index,fields", [
    ("clinicas", CLINICA, 0, ("nome", "endereco", "cidade", "uf")),
    ("profissionais", PROFISSIONAL, 2, ("nome", "crm", "especialidadeId", "clinicaId", "valorConsulta")),
])
@pytest.mark.parametrize("invalid", [None, "", " \t\n ", "missing"])
def test_required_fields(client, repositories, path, payload, index, fields, invalid):
    for field in fields:
        data = dict(payload)
        if invalid == "missing":
            del data[field]
        else:
            data[field] = invalid
        response = client.post(f"/api/{path}", json=data)
        assert response.status_code == 422
        assert any(error["loc"] == ["body", field] for error in response.json()["detail"])
    repositories[index].create.assert_not_called()
    repositories[0].get_by_id.assert_not_called()
    repositories[1].get_by_id.assert_not_called()


@pytest.mark.parametrize("uf", ["pe", " Pe ", "PE"])
def test_uf_normalized(client, repositories, uf):
    response = client.post("/api/clinicas", json={**CLINICA, "uf": uf})
    assert response.status_code == 201
    assert response.json()["uf"] == "PE"
    repositories[0].create.assert_called_once_with(**CLINICA, ativo=True)


@pytest.mark.parametrize("uf", ["P", "Pernambuco", "   ", "ßa"])
def test_invalid_uf(client, repositories, uf):
    assert client.post("/api/clinicas", json={**CLINICA, "uf": uf}).status_code == 422
    repositories[0].create.assert_not_called()


@pytest.mark.parametrize("path,payload,index,field", [
    ("clinicas", CLINICA, 0, "telefone"),
    ("profissionais", PROFISSIONAL, 2, "fotoUrl"),
])
@pytest.mark.parametrize("value", [None, "omitted", "  texto opcional  "])
def test_optional_text(client, repositories, path, payload, index, field, value):
    data = dict(payload)
    if value == "omitted":
        del data[field]
    else:
        data[field] = value
    expected = value.strip() if isinstance(value, str) and value != "omitted" else None
    response = client.post(f"/api/{path}", json=data)
    assert response.status_code == 201
    assert response.json()[field] == expected
    assert repositories[index].create.call_args.kwargs[field] == expected


@pytest.mark.parametrize("value", [0, 0.01, 150, 150.75])
def test_valid_consultation_price(client, repositories, value):
    response = client.post("/api/profissionais", json={**PROFISSIONAL, "valorConsulta": value})
    assert response.status_code == 201
    assert response.json()["valorConsulta"] == value
    assert repositories[2].create.call_args.kwargs["valorConsulta"] == value


@pytest.mark.parametrize("value", [-1, -0.01, "NaN", "Infinity"])
def test_invalid_consultation_price(client, repositories, value):
    assert client.post("/api/profissionais", json={**PROFISSIONAL, "valorConsulta": value}).status_code == 422
    repositories[2].create.assert_not_called()
    repositories[0].get_by_id.assert_not_called()
    repositories[1].get_by_id.assert_not_called()


@pytest.mark.parametrize("index,message", [(1, "Especialidade"), (0, "Clínica")])
@pytest.mark.parametrize("missing", [True, False])
def test_missing_or_inactive_relationship(client, repositories, index, message, missing):
    related = repositories[index]
    related.get_by_id.return_value = (
        None if missing else related.get_by_id.return_value.model_copy(update={"ativo": False})
    )
    response = client.post("/api/profissionais", json=PROFISSIONAL)
    assert response.status_code == 400
    assert response.json() == {"detail": f"{message} não existe ou está inativa"}
    repositories[2].create.assert_not_called()
    if index == 1:
        repositories[0].get_by_id.assert_not_called()


@pytest.mark.parametrize("module,repository_type,dependency,response_type,collection,payload", MODULES)
def test_repository_create(module, repository_type, dependency, response_type, collection, payload):
    firestore = Mock()
    document = firestore.collection.return_value.document.return_value
    document.id = "generated-id"
    result = repository_type(firestore).create(**payload, ativo=True)
    assert result == response_type(id="generated-id", **payload, ativo=True)
    firestore.collection.assert_called_once_with(collection)
    firestore.collection.return_value.document.assert_called_once_with()
    document.set.assert_called_once_with({**payload, "ativo": True})


@pytest.mark.parametrize("module,repository_type,dependency,response_type,collection,payload", MODULES)
def test_repository_list(module, repository_type, dependency, response_type, collection, payload):
    firestore = Mock()
    document = Mock(id="generated-id")
    document.to_dict.return_value = {**payload, "ativo": True}
    firestore.collection.return_value.stream.return_value = iter([document])
    assert repository_type(firestore).list() == [response_type(id="generated-id", **payload, ativo=True)]
    firestore.collection.assert_called_once_with(collection)
    firestore.collection.return_value.stream.assert_called_once_with()


@pytest.mark.parametrize("module,repository_type,dependency,response_type,collection,payload", MODULES)
def test_repository_dependency(module, repository_type, dependency, response_type, collection, payload, monkeypatch):
    firestore = Mock()
    get_client = Mock(return_value=firestore)
    monkeypatch.setattr(module, "get_firestore_client", get_client)
    assert dependency().client is firestore
    get_client.assert_called_once_with()


@pytest.mark.parametrize("repository_type,response_type,collection,payload", [
    (clinicas.ClinicaRepository, ClinicaResponse, "clinicas", CLINICA),
    (especialidades.EspecialidadeRepository, EspecialidadeResponse, "especialidades",
     {"nome": "Cardiologia", "descricao": None}),
])
@pytest.mark.parametrize("exists", [True, False])
def test_repository_get_by_id(repository_type, response_type, collection, payload, exists):
    firestore = Mock()
    snapshot = firestore.collection.return_value.document.return_value.get.return_value
    snapshot.exists = exists
    snapshot.id = "related-id"
    snapshot.to_dict.return_value = {**payload, "ativo": True}
    result = repository_type(firestore).get_by_id("related-id")
    assert result == (response_type(id="related-id", **payload, ativo=True) if exists else None)
    firestore.collection.assert_called_once_with(collection)
    firestore.collection.return_value.document.assert_called_once_with("related-id")
    firestore.collection.return_value.document.return_value.get.assert_called_once_with()
    if not exists:
        snapshot.to_dict.assert_not_called()
