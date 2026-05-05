from fastapi.testclient import TestClient

from app.main import _REQUESTS, app, build_telegram_message, ContactPayload


def setup_function() -> None:
    _REQUESTS.clear()


def test_health_ok() -> None:
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_contact_success(monkeypatch) -> None:
    sent = {}

    async def fake_send_telegram(text: str) -> None:
        sent["text"] = text

    monkeypatch.setattr("app.main.send_telegram", fake_send_telegram)

    client = TestClient(app)
    response = client.post(
        "/contact",
        json={
            "name": "Matt",
            "contact": "matt@example.com",
            "message": "Quiero hablar sobre un proyecto.",
            "page": "https://mattarzu.github.io/",
            "createdAt": "2026-05-05T12:00:00.000Z",
        },
    )

    assert response.status_code == 200
    assert response.json() == {"ok": True}
    assert "Nuevo contacto" in sent["text"]
    assert "Matt" in sent["text"]


def test_contact_requires_fields() -> None:
    client = TestClient(app)

    response = client.post("/contact", json={})

    assert response.status_code == 422


def test_honeypot_returns_ok_without_sending(monkeypatch) -> None:
    called = {"value": False}

    async def fake_send_telegram(text: str) -> None:
        called["value"] = True

    monkeypatch.setattr("app.main.send_telegram", fake_send_telegram)

    client = TestClient(app)
    response = client.post(
        "/contact",
        json={
            "name": "Bot",
            "contact": "bot@example.com",
            "message": "spam",
            "page": "https://mattarzu.github.io/",
            "createdAt": "2026-05-05T12:00:00.000Z",
            "website": "https://spam.example",
        },
    )

    assert response.status_code == 200
    assert response.json() == {"ok": True}
    assert called["value"] is False


def test_rate_limit(monkeypatch) -> None:
    async def fake_send_telegram(text: str) -> None:
        return None

    monkeypatch.setattr("app.main.send_telegram", fake_send_telegram)
    monkeypatch.setenv("RATE_LIMIT_PER_MINUTE", "2")

    client = TestClient(app)

    payload = {
        "name": "Matt",
        "contact": "matt@example.com",
        "message": "Mensaje válido.",
        "page": "https://mattarzu.github.io/",
        "createdAt": "2026-05-05T12:00:00.000Z",
    }

    assert client.post("/contact", json=payload).status_code == 200
    assert client.post("/contact", json=payload).status_code == 200

    response = client.post("/contact", json=payload)

    assert response.status_code == 429
    assert response.json()["detail"] == "rate-limit-exceeded"


def test_telegram_message_escapes_html() -> None:
    payload = ContactPayload(
        name="<Matt>",
        contact="matt@example.com",
        message="<script>alert(1)</script>",
        page="https://mattarzu.github.io/",
        createdAt="2026-05-05T12:00:00.000Z",
    )

    text = build_telegram_message(payload)

    assert "&lt;Matt&gt;" in text
    assert "&lt;script&gt;" in text
    assert "<script>" not in text
