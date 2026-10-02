import asyncio
import json

from app.main import app


def test_openapi_is_available():
    """Verifica a inicialização HTTP sem serviços externos ou credenciais."""
    messages = []

    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    async def send(message):
        messages.append(message)

    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": "GET",
        "scheme": "http",
        "path": "/openapi.json",
        "raw_path": b"/openapi.json",
        "query_string": b"",
        "root_path": "",
        "headers": [],
        "server": ("test", 80),
        "client": ("test", 1234),
    }
    asyncio.run(app(scope, receive, send))

    assert messages[0]["status"] == 200
    body = b"".join(message.get("body", b"") for message in messages)
    document = json.loads(body)
    assert document["info"]["title"]
    assert document["paths"] == {}
