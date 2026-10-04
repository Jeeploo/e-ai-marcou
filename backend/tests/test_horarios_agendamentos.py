from datetime import datetime, timezone
from unittest.mock import Mock, call

import pytest
from fastapi.testclient import TestClient
from google.api_core.exceptions import Aborted, AlreadyExists

from app.main import app
from app.repositories import agendamentos as a, horarios as h, profissionais as p
from app.schemas.agendamentos import AgendamentoResponse
from app.schemas.horarios import HorarioResponse
from app.schemas.profissionais import ProfissionalResponse

H = dict(profissionalId="prof-id", clinicaId="clinica-id", data="2026-10-20", hora="09:30", disponivel=True)
P = dict(nome="Maria", crm="123", especialidadeId="esp-id", clinicaId="clinica-atual", valorConsulta=175.5, fotoUrl=None, ativo=True)
A = dict(pacienteId="paciente-demo", horarioId="hor-id", **{k: v for k, v in H.items() if k != "disponivel"}, valor=175.5, status="agendado", criadoEm=datetime.now(timezone.utc))
INPUT_H = {k: H[k] for k in ("profissionalId", "data", "hora")}
INPUT_A = dict(pacienteId="paciente-demo", horarioId="hor-id")


@pytest.fixture(autouse=True)
def block_firestore(monkeypatch):
    for module in (a, h, p):
        monkeypatch.setattr(module, "get_firestore_client", Mock(side_effect=AssertionError("Firestore real proibido")))


@pytest.fixture
def repos():
    slot, booking, professional = Mock(spec=h.HorarioRepository), Mock(spec=a.AgendamentoRepository), Mock(spec=p.ProfissionalRepository)
    slot.create.side_effect = lambda **data: HorarioResponse(id="hor-id", **data)
    slot.list.return_value = [HorarioResponse(id="hor-id", **H)]
    booking.create.return_value = AgendamentoResponse(id="ag-id", **A)
    booking.list.return_value = [booking.create.return_value]
    professional.get_by_id.return_value = ProfissionalResponse(id="prof-id", **P)
    return slot, booking, professional


@pytest.fixture
def client(repos):
    previous = app.dependency_overrides.copy()
    app.dependency_overrides.update({h.get_horario_repository: lambda: repos[0], a.get_agendamento_repository: lambda: repos[1], p.get_profissional_repository: lambda: repos[2]})
    try:
        with TestClient(app) as client:
            yield client
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(previous)


def test_create_slot(client, repos):
    response = client.post("/api/horarios", json=INPUT_H)
    assert response.status_code == 201
    assert response.json() == dict(id="hor-id", **INPUT_H, clinicaId=P["clinicaId"], disponivel=True)
    repos[0].create.assert_called_once_with(**INPUT_H, clinicaId=P["clinicaId"], disponivel=True)
    repos[2].get_by_id.assert_called_once_with("prof-id")


@pytest.mark.parametrize("field,value", [("data", "2026-02-30"), ("data", "2026-2-03"), ("data", "20/10/2026"), ("data", "2026-10-20T00:00:00"), ("hora", "24:00"), ("hora", "09:60"), ("hora", "9:30"), ("hora", "09:30:00")])
def test_invalid_format(client, repos, field, value):
    assert client.post("/api/horarios", json={**INPUT_H, field: value}).status_code == 422
    repos[0].create.assert_not_called()
    repos[2].get_by_id.assert_not_called()


@pytest.mark.parametrize("path,payload,field", [("horarios", INPUT_H, "profissionalId"), ("horarios", INPUT_H, "data"), ("horarios", INPUT_H, "hora"), ("agendamentos", INPUT_A, "pacienteId"), ("agendamentos", INPUT_A, "horarioId")])
@pytest.mark.parametrize("invalid", [None, "", "   ", "missing"])
def test_required(client, repos, path, payload, field, invalid):
    data = {**payload, field: invalid}
    if invalid == "missing":
        del data[field]
    assert client.post(f"/api/{path}", json=data).status_code == 422
    repos[0].create.assert_not_called()
    repos[1].create.assert_not_called()


@pytest.mark.parametrize("missing", [True, False])
def test_invalid_professional(client, repos, missing):
    repos[2].get_by_id.return_value = None if missing else repos[2].get_by_id.return_value.model_copy(update={"ativo": False})
    assert client.post("/api/horarios", json=INPUT_H).status_code == 400
    repos[0].create.assert_not_called()


def test_duplicate(client, repos):
    repos[0].create.side_effect = h.HorarioDuplicadoError
    assert client.post("/api/horarios", json=INPUT_H).status_code == 409


@pytest.mark.parametrize("path,payload,field,value", [("horarios", INPUT_H, "clinicaId", "outro"), ("horarios", INPUT_H, "disponivel", False)] + [("agendamentos", INPUT_A, k, v) for k, v in {"profissionalId": "outro", "clinicaId": "outra", "data": "2026-10-21", "hora": "10:00", "valor": 0, "status": "cancelado", "criadoEm": "2026-01-01T00:00:00Z"}.items()])
def test_forbidden_fields(client, repos, path, payload, field, value):
    assert client.post(f"/api/{path}", json={**payload, field: value}).status_code == 422
    repos[0].create.assert_not_called()
    repos[1].create.assert_not_called()


@pytest.mark.parametrize("params", [{}, {"profissionalId": "prof-id"}, {"data": "2026-10-20"}, {"disponivel": False}, {"profissionalId": "prof-id", "data": "2026-10-20", "disponivel": True}])
def test_slot_listing(client, repos, params):
    response = client.get("/api/horarios", params=params)
    assert response.status_code == 200
    assert response.json() == [repos[0].list.return_value[0].model_dump()]
    repos[0].list.assert_called_once_with(**{k: params.get(k) for k in ("profissionalId", "data", "disponivel")})


def test_invalid_query_date(client, repos):
    assert client.get("/api/horarios", params={"data": "2026-02-30"}).status_code == 422
    repos[0].list.assert_not_called()


def test_create_booking(client, repos):
    response = client.post("/api/agendamentos", json=INPUT_A)
    assert response.status_code == 201
    assert response.json() == repos[1].create.return_value.model_dump(mode="json")
    repos[1].create.assert_called_once_with(**INPUT_A)


@pytest.mark.parametrize("error,status", [(a.HorarioNaoEncontradoError, 404), (a.HorarioIndisponivelError, 409), (a.ProfissionalNaoEncontradoError, 400)])
def test_booking_errors(client, repos, error, status):
    repos[1].create.side_effect = error
    assert client.post("/api/agendamentos", json=INPUT_A).status_code == status


@pytest.mark.parametrize("patient", [None, "paciente-demo"])
def test_booking_listing(client, repos, patient):
    response = client.get("/api/agendamentos", params={} if patient is None else {"pacienteId": patient})
    assert response.status_code == 200
    assert response.json() == [repos[1].list.return_value[0].model_dump(mode="json")]
    repos[1].list.assert_called_once_with(pacienteId=patient)


@pytest.mark.parametrize("path,index", [("horarios", 0), ("agendamentos", 1)])
def test_empty(client, repos, path, index):
    repos[index].list.return_value = []
    assert client.get(f"/api/{path}").json() == []


def snapshot(id, data, exists=True):
    result = Mock(id=id, exists=exists)
    result.to_dict.return_value = data
    return result


def test_slot_repository_duplicate():
    client = Mock()
    ref = client.collection.return_value.document.return_value
    ref.id = "hor-id"
    repo = h.HorarioRepository(client)
    assert repo.create(**H) == HorarioResponse(id="hor-id", **H)
    first = client.collection.return_value.document.call_args.args[0]
    ref.create.assert_called_once_with(H)
    ref.set.assert_not_called()
    ref.create.side_effect = AlreadyExists("duplicate")
    with pytest.raises(h.HorarioDuplicadoError):
        repo.create(**H)
    assert client.collection.return_value.document.call_args.args[0] == first
    ref.create.side_effect = None
    for field, value in [("hora", "10:00"), ("data", "2026-10-21"), ("profissionalId", "outro")]:
        repo.create(**{**H, field: value})
        assert client.collection.return_value.document.call_args.args[0] != first


@pytest.mark.parametrize("filters,expected", [({}, ["a", "b", "c"]), ({"profissionalId": "prof-id"}, ["a", "b"]), ({"data": "2026-10-20"}, ["a", "b", "c"]), ({"disponivel": False}, ["b"]), ({"profissionalId": "prof-id", "data": "2026-10-20", "disponivel": True}, ["a"]), ({"data": "2026-10-21", "disponivel": True}, [])])
def test_slot_repository_filters(filters, expected):
    client = Mock()
    query = client.collection.return_value
    query.where.return_value = query
    query.stream.return_value = iter([snapshot("a", H), snapshot("b", {**H, "disponivel": False}), snapshot("c", {**H, "profissionalId": "outro"})])
    assert [item.id for item in h.HorarioRepository(client).list(**filters)] == expected
    assert query.where.call_count == (1 if filters else 0)
    if filters:
        field, value = next(iter(filters.items()))
        filter = query.where.call_args.kwargs["filter"]
        assert (filter.field_path, filter.op_string, filter.value) == (field, "==", value)


@pytest.fixture
def transaction_setup():
    client = Mock()
    slot, professional, booking = Mock(), Mock(), Mock(id="ag-id")
    collections = {name: Mock() for name in ("horarios", "profissionais", "agendamentos")}
    for name, ref in zip(collections, (slot, professional, booking)):
        collections[name].document.return_value = ref
    client.collection.side_effect = collections.__getitem__
    slot.get.return_value = snapshot("hor-id", H)
    professional.get.return_value = snapshot("prof-id", P)
    transaction = client.transaction.return_value
    transaction._read_only = False
    transaction._max_attempts = 5
    transaction._id = b"mock-transaction"
    return client, transaction, slot, professional, booking, collections


def test_transaction_commit_and_derived_data(transaction_setup):
    client, transaction, slot, professional, booking, collections = transaction_setup
    events = Mock()
    for name, mock in [("slot", slot.get), ("professional", professional.get), ("create", transaction.create), ("update", transaction.update), ("commit", transaction._commit)]:
        events.attach_mock(mock, name)
    result = a.AgendamentoRepository(client).create(**INPUT_A)
    assert result.model_dump(exclude={"id", "criadoEm"}) == {k: v for k, v in A.items() if k != "criadoEm"}
    assert result.criadoEm.tzinfo is not None
    assert result.valor == P["valorConsulta"]
    assert result.clinicaId == H["clinicaId"] != P["clinicaId"]
    assert events.mock_calls == [call.slot(transaction=transaction), call.slot().to_dict(), call.professional(transaction=transaction), call.professional().to_dict(), call.create(booking, result.model_dump(exclude={"id"})), call.update(slot, {"disponivel": False}), call.commit()]
    collections["horarios"].document.assert_called_once_with("hor-id")
    collections["profissionais"].document.assert_called_once_with("prof-id")
    transaction._rollback.assert_not_called()


@pytest.mark.parametrize("scenario,error", [("missing", a.HorarioNaoEncontradoError), ("unavailable", a.HorarioIndisponivelError), ("professional", a.ProfissionalNaoEncontradoError)])
def test_transaction_no_writes_on_invalid_state(transaction_setup, scenario, error):
    client, transaction, slot, professional, *_ = transaction_setup
    if scenario == "missing":
        slot.get.return_value.exists = False
    elif scenario == "unavailable":
        slot.get.return_value.to_dict.return_value = {**H, "disponivel": False}
    else:
        professional.get.return_value.exists = False
    with pytest.raises(error):
        a.AgendamentoRepository(client).create(**INPUT_A)
    transaction.create.assert_not_called()
    transaction.update.assert_not_called()
    transaction._commit.assert_not_called()
    transaction._rollback.assert_called_once()
    if scenario != "professional":
        professional.get.assert_not_called()


def test_sdk_retry_revalidates_slot_after_conflict(transaction_setup):
    client, transaction, slot, professional, *_ = transaction_setup
    slot.get.side_effect = [snapshot("hor-id", H), snapshot("hor-id", {**H, "disponivel": False})]
    transaction._commit.side_effect = Aborted("concorrência")
    with pytest.raises(a.HorarioIndisponivelError):
        a.AgendamentoRepository(client).create(**INPUT_A)
    assert slot.get.call_args_list == [call(transaction=transaction)] * 2
    transaction.create.assert_called_once()
    transaction.update.assert_called_once()
    transaction._commit.assert_called_once()
    transaction._rollback.assert_called_once()
    assert transaction._begin.call_count == 2
    assert transaction._clean_up.call_count == 2


def test_commit_failure_rolls_back(transaction_setup):
    client, transaction, *_ = transaction_setup
    transaction._commit.side_effect = RuntimeError("commit failure")
    with pytest.raises(RuntimeError, match="commit failure"):
        a.AgendamentoRepository(client).create(**INPUT_A)
    transaction._rollback.assert_called_once()


@pytest.mark.parametrize("patient", [None, "paciente-demo"])
def test_booking_repository_list(patient):
    client = Mock()
    collection = client.collection.return_value
    query = collection if patient is None else collection.where.return_value
    query.stream.return_value = iter([snapshot("ag-id", A)])
    assert a.AgendamentoRepository(client).list(patient) == [AgendamentoResponse(id="ag-id", **A)]
    if patient is None:
        collection.where.assert_not_called()
    else:
        filter = collection.where.call_args.kwargs["filter"]
        assert (filter.field_path, filter.op_string, filter.value) == ("pacienteId", "==", patient)


@pytest.mark.parametrize("exists", [True, False])
def test_professional_lookup(exists):
    client = Mock()
    document = client.collection.return_value.document.return_value
    document.get.return_value = snapshot("prof-id", P, exists)
    assert p.ProfissionalRepository(client).get_by_id("prof-id") == (ProfissionalResponse(id="prof-id", **P) if exists else None)
    client.collection.assert_called_once_with("profissionais")
    client.collection.return_value.document.assert_called_once_with("prof-id")
    document.get.assert_called_once_with()


@pytest.mark.parametrize("module,dependency", [(h, h.get_horario_repository), (a, a.get_agendamento_repository)])
def test_dependency_client(monkeypatch, module, dependency):
    client = Mock()
    get_client = Mock(return_value=client)
    monkeypatch.setattr(module, "get_firestore_client", get_client)
    assert dependency().client is client
    get_client.assert_called_once_with()


def test_two_concurrent_reservations_only_one_commits(transaction_setup):
    from concurrent.futures import ThreadPoolExecutor
    from threading import Barrier, Lock

    client, _, slot, _, _, _ = transaction_setup
    barrier, lock = Barrier(2), Lock()
    state = {"disponivel": True, "agendamentos": []}

    def new_transaction():
        transaction = Mock()
        transaction._read_only = False
        transaction._max_attempts = 5
        transaction._id = b"mock-transaction"
        transaction.pending = None
        transaction.read_count = 0
        transaction._clean_up.side_effect = lambda: setattr(transaction, "pending", None)
        transaction.create.side_effect = lambda ref, payload: setattr(transaction, "pending", payload)

        def commit():
            with lock:
                if not state["disponivel"]:
                    raise Aborted("outro agendamento confirmou primeiro")
                state["agendamentos"].append(transaction.pending)
                state["disponivel"] = False

        transaction._commit.side_effect = commit
        return transaction

    def read_slot(transaction):
        with lock:
            available = state["disponivel"]
        transaction.read_count += 1
        if transaction.read_count == 1:
            barrier.wait(timeout=5)
        return snapshot("hor-id", {**H, "disponivel": available})

    client.transaction.side_effect = new_transaction
    slot.get.side_effect = read_slot

    def reserve():
        try:
            return a.AgendamentoRepository(client).create(**INPUT_A)
        except a.HorarioIndisponivelError:
            return "conflict"

    with ThreadPoolExecutor(max_workers=2) as executor:
        results = list(executor.map(lambda _: reserve(), range(2)))
    assert sum(isinstance(result, AgendamentoResponse) for result in results) == 1
    assert results.count("conflict") == 1
    assert len(state["agendamentos"]) == 1
    assert state["disponivel"] is False
