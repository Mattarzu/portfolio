# M M LAB Contact Worker

Cloudflare Worker para recibir POST /contact desde GitHub Pages y reenviar el mensaje a Telegram.

## Variables

Variables públicas en wrangler.toml:

- TELEGRAM_CHAT_ID
- ALLOWED_ORIGIN
- RATE_LIMIT_PER_MINUTE

Secret obligatorio en Cloudflare:

- TELEGRAM_BOT_TOKEN

## Deploy

Login:

npx wrangler login

Setear secret:

cd mmlab-contact-worker
npx wrangler secret put TELEGRAM_BOT_TOKEN

Deploy:

npx wrangler deploy

## Endpoints

GET /health

POST /contact
