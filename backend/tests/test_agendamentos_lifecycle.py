from copy import deepcopy
from unittest.mock import Mock

import pytest
from google.api_core.exceptions import Aborted

from app.repositories import agendamentos as a
from app.schemas.agendamentos import AgendamentoResponse
from test_horarios_agendamentos import A, H, P, block_firestore, client, repos, snapshot


@pytest.mark.parametrize('method,path,operation', [('get', '/api/agendamentos/ag-id', 'get_by_id'), ('delete', '/api/agendamentos/ag-id', 'cancel'), ('patch', '/api/agendamentos/ag-id/reagendar', 'reschedule')])
def test_routes_success(client, repos, method, path, operation):
    result = AgendamentoResponse(id='ag-id', **{**A, 'status': 'cancelado' if method == 'delete' else 'agendado'})
    getattr(repos[1], operation).return_value = result
    kwargs = {'json': {'novoHorarioId': ' novo-id '}} if method == 'patch' else {}
    response = getattr(client, method)(path, **kwargs)
    assert response.status_code == 200
    assert response.json() == result.model_dump(mode='json')
    getattr(repos[1], operation).assert_called_once_with(*(['ag-id', 'novo-id'] if method == 'patch' else ['ag-id']))


def test_get_missing(client, repos):
    repos[1].get_by_id.return_value = None
    assert client.get('/api/agendamentos/missing').status_code == 404


@pytest.mark.parametrize('operation,method,path', [('cancel', 'delete', '/api/agendamentos/ag-id'), ('reschedule', 'patch', '/api/agendamentos/ag-id/reagendar')])
@pytest.mark.parametrize('error,status', [(a.AgendamentoNaoEncontradoError, 404), (a.AgendamentoInativoError, 409), (a.HorarioNaoEncontradoError, 404), (a.HorarioIndisponivelError, 409), (a.ProfissionalNaoEncontradoError, 400), (a.MesmoHorarioError, 409)])
def test_route_errors(client, repos, operation, method, path, error, status):
    getattr(repos[1], operation).side_effect = error
    kwargs = {'json': {'novoHorarioId': 'novo-id'}} if method == 'patch' else {}
    assert getattr(client, method)(path, **kwargs).status_code == status


@pytest.mark.parametrize('body', [{}, {'novoHorarioId': None}, {'novoHorarioId': ''}, {'novoHorarioId': '   '}, {'novoHorarioId': 1}] + [{'novoHorarioId': 'novo-id', field: 'injetado'} for field in ('profissionalId', 'clinicaId', 'data', 'hora', 'valor', 'status', 'pacienteId', 'horarioId')])
def test_patch_body(client, repos, body):
    assert client.patch('/api/agendamentos/ag-id/reagendar', json=body).status_code == 422
    repos[1].reschedule.assert_not_called()


@pytest.fixture
def store():
    state = {'agendamentos': {'ag-id': deepcopy(A)}, 'horarios': {'hor-id': {**H, 'disponivel': False}, 'novo-id': {**H, 'profissionalId': 'novo-prof', 'clinicaId': 'nova-clinica', 'hora': '11:00'}, 'outro-id': {**H, 'disponivel': False}}, 'profissionais': {'novo-prof': {**P, 'valorConsulta': 220}}}
    client, transaction = Mock(), Mock()
    refs = {}
    def collection(name):
        result = Mock()
        def document(id):
            key = (name, id)
            if key not in refs:
                ref = Mock(id=id)
                def get(transaction=None):
                    if transaction is not None:
                        assert not transaction.pending, 'leitura após gravação'
                    return snapshot(id, deepcopy(state[name].get(id)), id in state[name])
                ref.get.side_effect = get
                refs[key] = ref
            return refs[key]
        result.document.side_effect = document
        return result
    client.collection.side_effect = collection
    transaction._read_only = False
    transaction._max_attempts = 5
    transaction._id = b'fake'
    transaction.pending = []
    transaction._clean_up.side_effect = lambda: transaction.pending.clear()
    transaction._rollback.side_effect = lambda: transaction.pending.clear()
    def update(ref, payload):
        key = next(key for key, value in refs.items() if value is ref)
        transaction.pending.append((key, deepcopy(payload)))
    def commit():
        candidate = deepcopy(state)
        for (name, id), payload in transaction.pending:
            candidate[name][id].update(payload)
        state.clear()
        state.update(candidate)
    transaction.update.side_effect = update
    transaction._commit.side_effect = commit
    client.transaction.return_value = transaction
    return a.AgendamentoRepository(client), state, transaction


@pytest.mark.parametrize('exists', [True, False])
def test_repository_get(store, exists):
    repo, state, _ = store
    if not exists:
        del state['agendamentos']['ag-id']
    assert repo.get_by_id('ag-id') == (AgendamentoResponse(id='ag-id', **A) if exists else None)


def test_cancel_exact_slot_and_repeat(store):
    repo, state, transaction = store
    assert repo.cancel('ag-id').status == 'cancelado'
    assert state['agendamentos']['ag-id'] == {**A, 'status': 'cancelado'}
    assert state['horarios']['hor-id']['disponivel'] is True
    assert state['horarios']['outro-id']['disponivel'] is False
    before = deepcopy(state)
    transaction.update.reset_mock()
    with pytest.raises(a.AgendamentoInativoError):
        repo.cancel('ag-id')
    assert state == before
    transaction.update.assert_not_called()


def test_reschedule_success(store):
    repo, state, _ = store
    result = repo.reschedule('ag-id', 'novo-id')
    assert state['horarios']['hor-id']['disponivel'] is True
    assert state['horarios']['novo-id']['disponivel'] is False
    assert result.model_dump() == dict(id='ag-id', **{**A, 'horarioId': 'novo-id', 'profissionalId': 'novo-prof', 'clinicaId': 'nova-clinica', 'hora': '11:00', 'valor': 220})
    assert state['agendamentos']['ag-id'] == result.model_dump(exclude={'id'})


@pytest.mark.parametrize('operation', ['cancel', 'reschedule'])
@pytest.mark.parametrize('scenario,error', [('missing', a.AgendamentoNaoEncontradoError), ('cancelled', a.AgendamentoInativoError), ('old_missing', a.HorarioNaoEncontradoError)])
def test_invalid_booking_no_changes(store, operation, scenario, error):
    repo, state, transaction = store
    if scenario == 'missing':
        del state['agendamentos']['ag-id']
    elif scenario == 'cancelled':
        state['agendamentos']['ag-id']['status'] = 'cancelado'
    else:
        del state['horarios']['hor-id']
    before = deepcopy(state)
    with pytest.raises(error):
        getattr(repo, operation)(*(['ag-id'] if operation == 'cancel' else ['ag-id', 'novo-id']))
    assert state == before
    transaction.update.assert_not_called()
    transaction._rollback.assert_called_once()


@pytest.mark.parametrize('scenario,error', [('missing', a.HorarioNaoEncontradoError), ('occupied', a.HorarioIndisponivelError), ('professional', a.ProfissionalNaoEncontradoError), ('same', a.MesmoHorarioError)])
def test_invalid_new_slot_preserves_reservation(store, scenario, error):
    repo, state, transaction = store
    if scenario == 'missing':
        del state['horarios']['novo-id']
    elif scenario == 'occupied':
        state['horarios']['novo-id']['disponivel'] = False
    elif scenario == 'professional':
        del state['profissionais']['novo-prof']
    before = deepcopy(state)
    with pytest.raises(error):
        repo.reschedule('ag-id', 'hor-id' if scenario == 'same' else 'novo-id')
    assert state == before
    transaction.update.assert_not_called()


@pytest.mark.parametrize('operation', ['cancel', 'reschedule'])
@pytest.mark.parametrize('failure', ['write', 'commit'])
def test_transaction_failure_keeps_entire_state(store, operation, failure):
    repo, state, transaction = store
    before = deepcopy(state)
    if failure == 'commit':
        transaction._commit.side_effect = RuntimeError('falha')
    else:
        update = transaction.update.side_effect
        def fail(ref, payload):
            update(ref, payload)
            if len(transaction.pending) == 2:
                raise RuntimeError('falha')
        transaction.update.side_effect = fail
    with pytest.raises(RuntimeError, match='falha'):
        getattr(repo, operation)(*(['ag-id'] if operation == 'cancel' else ['ag-id', 'novo-id']))
    assert state == before
    assert transaction.pending == []
    transaction._rollback.assert_called_once()


def test_reschedule_retry_revalidates_occupied_slot(store):
    repo, state, transaction = store
    def conflict():
        state['horarios']['novo-id']['disponivel'] = False
        raise Aborted('outra reserva confirmou primeiro')
    transaction._commit.side_effect = conflict
    with pytest.raises(a.HorarioIndisponivelError):
        repo.reschedule('ag-id', 'novo-id')
    assert state['agendamentos']['ag-id'] == A
    assert state['horarios']['hor-id']['disponivel'] is False
    assert transaction._begin.call_count == 2
    assert transaction._commit.call_count == 1
