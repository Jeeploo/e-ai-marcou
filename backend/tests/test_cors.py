import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings, settings
from app.main import app


ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
API_PATHS = [
    "/api/health", "/api/especialidades", "/api/clinicas",
    "/api/profissionais", "/api/horarios", "/api/agendamentos",
]


def test_default_cors_origins_are_explicit():
    assert Settings().cors_origins == ALLOWED_ORIGINS


@pytest.mark.parametrize("origin", ALLOWED_ORIGINS)
def test_allowed_origin_receives_cors_headers(origin):
    with TestClient(app) as client:
        response = client.get("/api/health", headers={"Origin": origin})

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "app": settings.app_name}
    assert response.headers["access-control-allow-origin"] == origin
    assert response.headers["access-control-allow-credentials"] == "true"
    assert "Origin" in response.headers["vary"]


@pytest.mark.parametrize("origin", ALLOWED_ORIGINS)
@pytest.mark.parametrize("path", API_PATHS)
def test_preflight_allows_existing_routes_and_custom_headers(origin, path):
    with TestClient(app) as client:
        response = client.options(path, headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET" if path == "/api/health" else "POST",
            "Access-Control-Request-Headers": "Content-Type, X-Request-ID",
        })

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin
    assert response.headers["access-control-allow-credentials"] == "true"
    assert {"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"} <= set(
        response.headers["access-control-allow-methods"].split(", ")
    )
    assert response.headers["access-control-allow-headers"] == "Content-Type, X-Request-ID"


@pytest.mark.parametrize("origin", ["https://unauthorized.example", "http://localhost:5174"])
def test_unauthorized_origin_does_not_receive_allow_origin(origin):
    with TestClient(app) as client:
        response = client.get("/api/health", headers={"Origin": origin})
        preflight = client.options("/api/health", headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
        })

    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers
    assert preflight.status_code == 400
    assert "access-control-allow-origin" not in preflight.headers


def test_request_without_origin_preserves_health_response():
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "app": settings.app_name}
    assert "access-control-allow-origin" not in response.headers
