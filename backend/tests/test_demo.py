from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.core import config, firebase
from app.main import app
from app.repositories import provider


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(config.settings, "data_mode", "demo")
    monkeypatch.setattr(config.settings, "firebase_credentials", None)
    monkeypatch.setattr(config.settings, "firebase_project_id", None)
    monkeypatch.setattr(firebase, "get_firestore_client", Mock(side_effect=AssertionError("Firebase proibido")))
    for name in ("especialidades", "clinicas", "profissionais", "horarios", "agendamentos"):
        from importlib import import_module
        monkeypatch.setattr(import_module(f"app.repositories.{name}"), "get_firestore_client",
                            Mock(side_effect=AssertionError("Firebase proibido")))
    provider.get_demo_store.cache_clear()
    with TestClient(app) as test_client:
        yield test_client
    provider.get_demo_store.cache_clear()


def free_slots(client):
    return client.get('/api/horarios', params={'disponivel': True}).json()


def book(client, slot, patient="teste"):
    return client.post('/api/agendamentos', json={'pacienteId': patient, 'horarioId': slot['id']})


def test_demo_initializes_without_firebase(client):
    assert client.get('/api/health').json() == {'status': 'ok', 'app': config.settings.app_name}
    for path in ('especialidades', 'clinicas', 'profissionais', 'horarios'):
        response = client.get('/api/' + path)
        assert response.status_code == 200
        assert response.json()
    specialties = {x['id'] for x in client.get('/api/especialidades').json()}
    clinics = {x['id'] for x in client.get('/api/clinicas').json()}
    people = client.get('/api/profissionais').json()
    assert all(p['especialidadeId'] in specialties and p['clinicaId'] in clinics for p in people)
    initial = client.get('/api/agendamentos', params={'pacienteId': 'paciente-demo'}).json()
    assert {a['status'] for a in initial} == {'agendado', 'cancelado'}
    assert any(p['especialidadeId'] == people[0]['especialidadeId'] for p in people)


def test_booking_lifecycle_and_slot_filters(client):
    old, new = free_slots(client)[:2]
    created = book(client, old)
    assert created.status_code == 201
    appointment = created.json()
    assert book(client, old).status_code == 409
    assert client.get('/api/agendamentos/' + appointment['id']).json() == appointment
    def available(slot):
        items = client.get('/api/horarios', params={
            'profissionalId': slot['profissionalId'], 'data': slot['data'], 'disponivel': True,
        }).json()
        assert all(x['profissionalId'] == slot['profissionalId'] and x['data'] == slot['data'] and x['disponivel'] for x in items)
        return slot['id'] in {x['id'] for x in items}
    assert not available(old)
    response = client.patch(f"/api/agendamentos/{appointment['id']}/reagendar", json={'novoHorarioId': new['id']})
    assert response.status_code == 200
    assert response.json()['horarioId'] == new['id']
    assert response.json()['criadoEm'] == appointment['criadoEm']
    assert available(old) and not available(new)
    assert book(client, old).status_code == 201
    response = client.delete('/api/agendamentos/' + appointment['id'])
    assert response.status_code == 200 and response.json()['status'] == 'cancelado'
    assert available(new)
    history = client.get('/api/agendamentos', params={'pacienteId': 'teste'}).json()
    assert any(a['id'] == appointment['id'] and a['status'] == 'cancelado' for a in history)
    assert client.delete('/api/agendamentos/' + appointment['id']).status_code == 409
    assert book(client, new).status_code == 201


def test_concurrent_booking_has_exactly_one_winner(client):
    slot = free_slots(client)[0]
    barrier = Barrier(8)
    def attempt(index):
        barrier.wait()
        return book(client, slot, f'concorrente-{index}').status_code
    with ThreadPoolExecutor(max_workers=8) as executor:
        statuses = list(executor.map(attempt, range(8)))
    assert statuses.count(201) == 1
    assert statuses.count(409) == 7


def test_failed_reschedule_preserves_old_reservation(client):
    old, occupied = free_slots(client)[:2]
    first = book(client, old).json()
    book(client, occupied)
    response = client.patch(f"/api/agendamentos/{first['id']}/reagendar", json={'novoHorarioId': occupied['id']})
    assert response.status_code == 409
    assert client.get('/api/agendamentos/' + first['id']).json() == first
    assert book(client, old).status_code == 409


def test_reset_restores_initial_state(client):
    slot = free_slots(client)[0]
    book(client, slot, 'temporario')
    provider.get_demo_store.cache_clear()
    assert client.get('/api/agendamentos', params={'pacienteId': 'temporario'}).json() == []


def test_mode_configuration(monkeypatch):
    monkeypatch.setattr(config, 'dotenv_values', lambda _: {})
    monkeypatch.delenv('DATA_MODE', raising=False)
    assert config.load_settings().data_mode == 'firebase'
    monkeypatch.setenv('DATA_MODE', 'demo')
    assert config.load_settings().data_mode == 'demo'
    monkeypatch.setenv('DATA_MODE', 'invalid')
    with pytest.raises(ValueError):
        config.load_settings()


def test_concurrent_first_requests_share_one_store(client):
    provider.get_demo_store.cache_clear()
    barrier = Barrier(8)
    def initialize(_):
        barrier.wait()
        from app.repositories.especialidades import get_especialidade_repository
        return get_especialidade_repository().store
    with ThreadPoolExecutor(max_workers=8) as executor:
        stores = list(executor.map(initialize, range(8)))
    assert all(store is stores[0] for store in stores)


def test_demo_catalog_and_slot_creation(client):
    specialty = client.post('/api/especialidades', json={'nome': 'Neurologia'}).json()
    clinic = client.post('/api/clinicas', json={
        'nome': 'Clínica Nova', 'endereco': 'Rua Nova, 10', 'cidade': 'Recife', 'uf': 'pe',
    }).json()
    response = client.post('/api/profissionais', json={
        'nome': 'Dra. Maria', 'crm': 'CRM-PE 9999', 'especialidadeId': specialty['id'],
        'clinicaId': clinic['id'], 'valorConsulta': 250,
    })
    assert response.status_code == 201
    professional = response.json()
    from datetime import date, timedelta
    payload = {'profissionalId': professional['id'], 'data': (date.today() + timedelta(days=1)).isoformat(), 'hora': '12:00'}
    response = client.post('/api/horarios', json=payload)
    assert response.status_code == 201
    assert response.json()['clinicaId'] == clinic['id']
    assert client.post('/api/horarios', json=payload).status_code == 409
    assert book(client, response.json()).json()['valor'] == 250


@pytest.mark.parametrize('mode', ['demo', 'firebase'])
def test_health_in_both_modes(client, monkeypatch, mode):
    monkeypatch.setattr(config.settings, 'data_mode', mode)
    assert client.get('/api/health').status_code == 200
