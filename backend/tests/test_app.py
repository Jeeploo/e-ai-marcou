from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app


def test_health():
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "app": settings.app_name}


def test_health_uses_configured_app_name(monkeypatch):
    monkeypatch.setattr(settings, "app_name", "Aplicação de teste")

    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["app"] == "Aplicação de teste"


def test_openapi_is_available():
    with TestClient(app) as client:
        response = client.get("/openapi.json")

    assert response.status_code == 200
    document = response.json()
    assert document["info"]["title"] == settings.app_name
    assert set(document["paths"]) == {"/api/health"}
    assert "get" in document["paths"]["/api/health"]
