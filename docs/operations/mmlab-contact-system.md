# M M LAB Contact System

## Estado

Sistema productivo de contacto para el portfolio M M LAB.

El formulario “Hablar con Matt”, integrado dentro del Panda, envía mensajes reales a Telegram usando un backend productivo en Cloudflare Workers.

## Arquitectura

```txt
GitHub Pages
  -> contact-config.js
  -> Cloudflare Worker /contact
  -> Telegram Bot API
  -> Telegram privado
```

## Repositorio

Repo local:

```txt
~/Projects/portfolio
```

Rama productiva:

```txt
main
```

Frontend:

```txt
HTML/CSS/JS estático
sin npm/package.json
```

Producción frontend:

```txt
GitHub Pages
```

## Configuración frontend

Archivo:

```txt
contact-config.js
```

Valor productivo:

```js
window.MMLAB_CONTACT_ENDPOINT = "<contact-worker-url>/contact";
```

El frontend no contiene secretos. Solo conoce el endpoint público del Worker.

## Backend productivo

Backend productivo:

```txt
Cloudflare Worker
```

Directorio:

```txt
mmlab-contact-worker/
```

URL pública:

```txt
<contact-worker-url>
```

Endpoints:

```txt
GET /health
POST /contact
```

## Backend local/documentado

Backend FastAPI local/documentado:

```txt
mmlab-contact-api/
```

Este backend queda como referencia local y documentación técnica. El backend productivo usado por el portfolio es Cloudflare Worker.

## Secrets y variables

El token del bot no debe estar en Git.

Secret productivo en Cloudflare:

```txt
TELEGRAM_BOT_TOKEN
```

Chat ID usado:

```txt
TELEGRAM_CHAT_ID=<private-chat-id>
```

CORS productivo:

```txt
ALLOWED_ORIGIN=https://mattarzu.github.io
```

## Seguridad

Reglas operativas:

- No commitear `.env`.
- No commitear `.venv/`.
- No exponer `TELEGRAM_BOT_TOKEN` en frontend.
- Mantener `TELEGRAM_BOT_TOKEN` solo como secret de Cloudflare.
- El frontend solo debe apuntar al endpoint público del Worker.
- El Worker es el único componente que llama a Telegram Bot API.
- CORS debe estar restringido al origen productivo.
- `/health` no debe exponer configuración sensible.
- `/contact` debe validar método, origen y payload.

## Flujo de contacto

1. Usuario abre el portfolio en GitHub Pages.
2. Usuario interactúa con Panda.
3. Usuario envía el formulario “Hablar con Matt”.
4. El frontend hace `POST` al endpoint definido en `contact-config.js`.
5. Cloudflare Worker recibe la solicitud.
6. Worker valida CORS y payload.
7. Worker llama a Telegram Bot API usando `TELEGRAM_BOT_TOKEN`.
8. Telegram entrega el mensaje privado a Matt.

## Deploy frontend

El frontend se publica desde `main`.

Validación sugerida antes de push:

```bash
cd ~/Projects/portfolio
git status --short
git diff --check
```

Push:

```bash
git push origin main
```

## Deploy Worker

Desde:

```txt
mmlab-contact-worker/
```

Comando:

```bash
cd ~/Projects/portfolio/mmlab-contact-worker
wrangler deploy
```

Actualizar secret de Telegram:

```bash
cd ~/Projects/portfolio/mmlab-contact-worker
wrangler secret put TELEGRAM_BOT_TOKEN
```

## Validaciones operativas

Health check:

```bash
curl -sS <contact-worker-url>/health
```

Respuesta esperada:

```json
{"ok":true}
```

CORS productivo:

```bash
curl -i -sS \
  -H 'Origin: https://mattarzu.github.io' \
  -H 'Access-Control-Request-Method: POST' \
  -X OPTIONS \
  <contact-worker-url>/contact
```

Header esperado:

```txt
access-control-allow-origin: https://mattarzu.github.io
```

Contacto de prueba:

```bash
curl -i -sS \
  -H 'Origin: https://mattarzu.github.io' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","contact":"test@example.com","message":"Mensaje de prueba"}' \
  <contact-worker-url>/contact
```

Respuesta esperada:

```json
{"ok":true}
```

## Commits relevantes

```txt
0c63f97 Add Cloudflare Worker contact backend
283da9c Merge M M LAB portfolio contact backend
e6cfa98 Connect Panda contact form to contact API
0494e70 Add Telegram contact API backend
97871e7 Integrate contact form into Panda assistant
```

## Estado final esperado

```txt
frontend_productive=GitHub Pages
backend_productive=Cloudflare Worker
telegram_delivery=enabled
cors_productive_origin=https://mattarzu.github.io
secrets_in_git=no
```
