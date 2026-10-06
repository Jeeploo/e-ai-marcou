"""Os testes legados de repositório validam explicitamente o modo Firestore."""
import pytest
from app.core.config import settings


@pytest.fixture(autouse=True)
def default_persistence_mode(monkeypatch):
    # Não depender do .env pessoal de quem roda pytest; testes demo selecionam demo.
    monkeypatch.setattr(settings, "data_mode", "firebase")
