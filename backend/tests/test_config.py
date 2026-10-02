from app.core import config


def test_load_settings_from_dotenv_without_local_file(monkeypatch):
    for name in ("APP_NAME", "FIREBASE_CREDENTIALS", "FIREBASE_PROJECT_ID"):
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setattr(config, "dotenv_values", lambda _: {
        "APP_NAME": "Teste",
        "FIREBASE_CREDENTIALS": "/fake/credential.json",
        "FIREBASE_PROJECT_ID": "test-project",
    })
    settings = config.load_settings()
    assert settings.app_name == "Teste"
    assert settings.firebase_credentials == "/fake/credential.json"
    assert settings.firebase_project_id == "test-project"


def test_environment_overrides_dotenv(monkeypatch):
    monkeypatch.setattr(config, "dotenv_values", lambda _: {
        "FIREBASE_CREDENTIALS": "/fake/dotenv.json",
        "FIREBASE_PROJECT_ID": "dotenv-project",
    })
    monkeypatch.setenv("APP_NAME", "Ambiente")
    monkeypatch.setenv("FIREBASE_CREDENTIALS", "/fake/environment.json")
    monkeypatch.setenv("FIREBASE_PROJECT_ID", "environment-project")
    settings = config.load_settings()
    assert settings.app_name == "Ambiente"
    assert settings.firebase_credentials == "/fake/environment.json"
    assert settings.firebase_project_id == "environment-project"
