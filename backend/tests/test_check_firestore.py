import importlib.util
from pathlib import Path
from unittest.mock import Mock

import pytest


@pytest.fixture
def script(monkeypatch):
    monkeypatch.delenv("FIRESTORE_EMULATOR_HOST", raising=False)
    path = Path(__file__).resolve().parents[1] / "scripts" / "check_firestore.py"
    spec = importlib.util.spec_from_file_location("check_firestore", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.mark.parametrize("collections", [[], [object()]])
def test_manual_check_reads_without_exposing_data(script, monkeypatch, capsys, collections):
    client = Mock()
    client.collections.return_value = iter(collections)
    monkeypatch.setattr(script, "get_firestore_client", Mock(return_value=client))
    assert script.main() == 0
    client.collections.assert_called_once_with(retry=None, timeout=10)
    assert client.mock_calls == [
        (("collections"), (), {"retry": None, "timeout": 10})
    ]
    assert "Nenhum dado foi gravado" in capsys.readouterr().out


def test_manual_check_hides_sdk_error(script, monkeypatch, capsys):
    monkeypatch.setattr(script, "get_firestore_client", Mock(side_effect=RuntimeError("secret")))
    assert script.main() == 1
    output = capsys.readouterr()
    assert "secret" not in output.err
    assert "Falha na leitura" in output.err


def test_manual_check_rejects_emulator(script, monkeypatch):
    monkeypatch.setenv("FIRESTORE_EMULATOR_HOST", "localhost:8080")
    get_client = Mock()
    monkeypatch.setattr(script, "get_firestore_client", get_client)
    assert script.main() == 1
    get_client.assert_not_called()
