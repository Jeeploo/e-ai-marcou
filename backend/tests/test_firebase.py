import importlib
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.core import firebase
from app.main import app


@pytest.fixture
def sdk(monkeypatch):
    monkeypatch.setattr(firebase.settings, "firebase_credentials", "/fake/credential.json")
    monkeypatch.setattr(firebase.settings, "firebase_project_id", "test-project")
    get_app = Mock(side_effect=ValueError("No app"))
    initialize = Mock()
    certificate = Mock()
    client = Mock()
    monkeypatch.setattr(firebase.firebase_admin, "get_app", get_app)
    monkeypatch.setattr(firebase.firebase_admin, "initialize_app", initialize)
    monkeypatch.setattr(firebase.credentials, "Certificate", certificate)
    monkeypatch.setattr(firebase.firestore, "client", client)
    monkeypatch.setattr(firebase.Path, "is_file", Mock(return_value=True))
    return get_app, initialize, certificate, client


def test_import_has_no_firebase_side_effects(sdk):
    importlib.reload(firebase)
    for mock in sdk:
        mock.assert_not_called()


def test_initializes_using_configured_credential_and_project(sdk):
    get_app, initialize, certificate, client = sdk
    assert firebase.get_firestore_client() is client.return_value
    certificate.assert_called_once_with("/fake/credential.json")
    initialize.assert_called_once_with(
        certificate.return_value,
        {"projectId": "test-project"},
        name="e-ai-marcou-backend",
    )
    client.assert_called_once_with(app=initialize.return_value)


def test_reuses_existing_app(sdk):
    get_app, initialize, certificate, client = sdk
    get_app.side_effect = None
    firebase.get_firestore_client()
    firebase.get_firestore_client()
    initialize.assert_not_called()
    certificate.assert_not_called()
    client.assert_called_with(app=get_app.return_value)


def test_concurrent_calls_initialize_only_once(sdk):
    get_app, initialize, _, _ = sdk
    apps = {}

    def lookup(name):
        if name not in apps:
            raise ValueError("No app")
        return apps[name]

    def create(credential, options, name):
        apps[name] = object()
        return apps[name]

    get_app.side_effect = lookup
    initialize.side_effect = create
    with ThreadPoolExecutor(max_workers=4) as executor:
        list(executor.map(lambda _: firebase.get_firestore_client(), range(8)))
    initialize.assert_called_once()


@pytest.mark.parametrize("field,variable", [
    ("firebase_credentials", "FIREBASE_CREDENTIALS"),
    ("firebase_project_id", "FIREBASE_PROJECT_ID"),
])
@pytest.mark.parametrize("value", [None, "", "   "])
def test_missing_configuration(sdk, monkeypatch, field, variable, value):
    monkeypatch.setattr(firebase.settings, field, value)
    with pytest.raises(firebase.FirebaseConfigurationError, match=variable):
        firebase.get_firestore_client()
    sdk[1].assert_not_called()
    sdk[2].assert_not_called()
    sdk[3].assert_not_called()


def test_missing_credential_file(sdk, monkeypatch):
    monkeypatch.setattr(firebase.Path, "is_file", Mock(return_value=False))
    with pytest.raises(firebase.FirebaseConfigurationError, match="não foi encontrado"):
        firebase.get_firestore_client()
    sdk[2].assert_not_called()


@pytest.mark.parametrize("stage", [1, 2, 3])
def test_sdk_errors_do_not_expose_sensitive_details(sdk, stage):
    sdk[stage].side_effect = ValueError("sensitive credential details")
    with pytest.raises(RuntimeError) as error:
        firebase.get_firestore_client()
    assert "sensitive" not in str(error.value)
    assert error.value.__suppress_context__


def test_health_does_not_access_firebase(sdk, monkeypatch):
    monkeypatch.setattr(firebase.settings, "firebase_credentials", None)
    monkeypatch.setattr(firebase.settings, "firebase_project_id", None)
    with TestClient(app) as client:
        response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    for mock in sdk:
        mock.assert_not_called()
