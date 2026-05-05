# M M LAB Contact API

Backend mínimo para el formulario público "Hablar con Matt".

## Stack

- FastAPI
- Telegram Bot API sendMessage
- Sin base de datos
- Sin almacenamiento de mensajes
- Sin secretos en frontend
- Sin secretos en Git

## Endpoint

POST /contact

Body esperado:

{
  "name": "Nombre",
  "contact": "email, teléfono o Telegram",
  "message": "Mensaje",
  "page": "https://mattarzu.github.io/...",
  "createdAt": "2026-05-05T12:00:00.000Z",
  "website": ""
}

website es honeypot anti-spam. Debe quedar vacío desde usuarios reales.

Respuesta OK:

{ "ok": true }

Errores controlados:

{ "detail": "rate-limit-exceeded" }

{ "detail": "contact-delivery-failed" }

## Variables de entorno

Copiar .env.example a .env:

cp .env.example .env

Configurar:

TELEGRAM_BOT_TOKEN=token_del_bot
TELEGRAM_CHAT_ID=id_del_chat
ALLOWED_ORIGIN=https://mattarzu.github.io
RATE_LIMIT_PER_MINUTE=5

Para desarrollo local:

ALLOWED_ORIGIN=http://127.0.0.1:3000,http://localhost:3000

Para producción:

ALLOWED_ORIGIN=https://mattarzu.github.io

## Cómo obtener TELEGRAM_BOT_TOKEN

1. Abrir Telegram.
2. Hablar con @BotFather.
3. Ejecutar /newbot.
4. Elegir nombre y username del bot.
5. Copiar el token entregado por BotFather.
6. Guardarlo solo en .env o variables del proveedor de deploy.

## Cómo obtener TELEGRAM_CHAT_ID

1. Mandarle un mensaje cualquiera al bot desde tu cuenta de Telegram.
2. Ejecutar localmente, con el token cargado:

curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getUpdates"

3. Buscar chat.id.
4. Usar ese número como TELEGRAM_CHAT_ID.

Si el bot va a escribir en un grupo, agregá el bot al grupo, mandá un mensaje en el grupo y repetí getUpdates. El chat.id del grupo suele ser negativo.

## Ejecutar local

cd mmlab-contact-api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

set -a
source .env
set +a

uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

Health check:

curl http://127.0.0.1:8000/health

Prueba manual:

curl -X POST http://127.0.0.1:8000/contact \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Matt",
    "contact": "test@example.com",
    "message": "Prueba desde M M LAB.",
    "page": "http://127.0.0.1:3000/",
    "createdAt": "2026-05-05T12:00:00.000Z"
  }'

## Tests

cd mmlab-contact-api
source .venv/bin/activate
pytest -q

## Seguridad

- TELEGRAM_BOT_TOKEN no debe ir al frontend.
- .env está ignorado por Git.
- CORS se restringe con ALLOWED_ORIGIN.
- No se persisten mensajes.
- El endpoint tiene rate limit simple por IP.
- El honeypot website permite descartar bots básicos.
