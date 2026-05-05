from __future__ import annotations

import html
import os
import time
from collections import defaultdict, deque
from dataclasses import dataclass

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator


def allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGIN", "https://mattarzu.github.io")
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    return origins or ["https://mattarzu.github.io"]


def rate_limit_per_minute() -> int:
    try:
        value = int(os.getenv("RATE_LIMIT_PER_MINUTE", "5"))
    except ValueError:
        value = 5
    return max(1, min(value, 60))


app = FastAPI(
    title="M M LAB Contact API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
)

_REQUESTS: dict[str, deque[float]] = defaultdict(deque)
_WINDOW_SECONDS = 60


class ContactPayload(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    contact: str = Field(min_length=1, max_length=160)
    message: str = Field(min_length=1, max_length=2000)
    page: str = Field(default="", max_length=300)
    createdAt: str = Field(default="", max_length=80)
    website: str = Field(default="", max_length=200)  # honeypot

    @field_validator("name", "contact", "message", "page", "createdAt", "website")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else value


@dataclass(frozen=True)
class TelegramConfig:
    token: str
    chat_id: str


def telegram_config() -> TelegramConfig:
    token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = os.getenv("TELEGRAM_CHAT_ID", "").strip()

    if not token or not chat_id:
        raise RuntimeError("telegram-not-configured")

    return TelegramConfig(token=token, chat_id=chat_id)


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip() or "unknown"

    if request.client and request.client.host:
        return request.client.host

    return "unknown"


def enforce_rate_limit(key: str) -> None:
    now = time.time()
    bucket = _REQUESTS[key]

    while bucket and now - bucket[0] > _WINDOW_SECONDS:
        bucket.popleft()

    if len(bucket) >= rate_limit_per_minute():
        raise HTTPException(status_code=429, detail="rate-limit-exceeded")

    bucket.append(now)


def build_telegram_message(payload: ContactPayload) -> str:
    safe_name = html.escape(payload.name)
    safe_contact = html.escape(payload.contact)
    safe_message = html.escape(payload.message)
    safe_page = html.escape(payload.page or "unknown")
    safe_created_at = html.escape(payload.createdAt or "unknown")

    return (
        "<b>Nuevo contacto — M M LAB</b>\n\n"
        f"<b>Nombre:</b> {safe_name}\n"
        f"<b>Contacto:</b> {safe_contact}\n"
        f"<b>Página:</b> {safe_page}\n"
        f"<b>Fecha cliente:</b> {safe_created_at}\n\n"
        f"<b>Mensaje:</b>\n{safe_message}"
    )


async def send_telegram(text: str) -> None:
    cfg = telegram_config()

    url = f"https://api.telegram.org/bot{cfg.token}/sendMessage"
    payload = {
        "chat_id": cfg.chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(url, json=payload)

    if response.status_code >= 400:
        raise RuntimeError("telegram-http-error")

    try:
        data = response.json()
    except ValueError as exc:
        raise RuntimeError("telegram-invalid-json") from exc

    if data.get("ok") is not True:
        raise RuntimeError("telegram-api-error")


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.post("/contact")
async def contact(payload: ContactPayload, request: Request) -> dict[str, bool]:
    enforce_rate_limit(client_ip(request))

    # Honeypot: responder OK sin enviar nada para no dar señal a bots.
    if payload.website:
        return {"ok": True}

    try:
        await send_telegram(build_telegram_message(payload))
    except RuntimeError:
        raise HTTPException(status_code=502, detail="contact-delivery-failed")

    return {"ok": True}
