# M M LAB Contact System Validation V1

## Objetivo

Validar el sistema productivo de contacto del portfolio M M LAB.

Arquitectura validada:

```txt
GitHub Pages
  -> contact-config.js
  -> Cloudflare Worker /contact
  -> Telegram Bot API
  -> Telegram privado
```

## Componentes validados

- Frontend estático HTML/CSS/JS.
- Producción frontend en GitHub Pages.
- `contact-config.js` apunta al Worker productivo.
- Cloudflare Worker responde `/health`.
- Cloudflare Worker responde `/contact`.
- CORS acepta el origen productivo.
- Telegram recibe mensajes reales.
- Secret `TELEGRAM_BOT_TOKEN` no está trackeado por Git.
- `.env` local está ignorado.
- `.venv/` local está ignorado.
- Push a `main` completado.

## Backend productivo

Worker público:

```txt
<contact-worker-url>
```

Endpoint de salud:

```txt
<contact-worker-url>/health
```

Endpoint de contacto:

```txt
<contact-worker-url>/contact
```

## Configuración frontend validada

Archivo:

```txt
contact-config.js
```

Valor esperado:

```js
window.MMLAB_CONTACT_ENDPOINT = "<contact-worker-url>/contact";
```

## CORS validado

Origen permitido:

```txt
https://mattarzu.github.io
```

Header esperado:

```txt
access-control-allow-origin: https://mattarzu.github.io
```

## Validación de secretos

Comando de inspección:

```bash
git ls-files \
  .env \
  .venv \
  mmlab-contact-api/.env \
  mmlab-contact-api/.venv \
  mmlab-contact-worker/.env \
  mmlab-contact-worker/.venv
```

Resultado esperado:

```txt
sin archivos trackeados
```

Archivos locales ignorados:

```txt
mmlab-contact-api/.env
mmlab-contact-api/.venv/
```

Escaneo seguro sin `.env` y sin `.venv`:

```bash
grep -RInE 'TELEGRAM_BOT_TOKEN|bot[0-9]+:|api[_-]?key|secret|token' \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=.venv \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='*.md' \
  . || true
```

Resultados aceptables:

```txt
referencias a variables de entorno
uso runtime de env.TELEGRAM_BOT_TOKEN
comentarios indicando que no hay secretos en frontend
```

Resultado no aceptable:

```txt
token real hardcodeado
bot token real en archivos trackeados
.env trackeado por Git
```

## Health check

Comando:

```bash
curl -sS <contact-worker-url>/health
```

Resultado esperado:

```json
{"ok":true}
```

Resultado observado:

```json
{"ok":true}
```

## Contact endpoint

Comando:

```bash
curl -i -sS \
  -H 'Origin: https://mattarzu.github.io' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","contact":"test@example.com","message":"Mensaje de prueba"}' \
  <contact-worker-url>/contact
```

Resultado esperado:

```json
{"ok":true}
```

Resultado observado:

```json
{"ok":true}
```

## Telegram

Resultado:

```txt
Telegram recibió mensajes de prueba correctamente.
```

## Formulario real

Resultado:

```txt
El formulario “Hablar con Matt” dentro del Panda envió mensajes reales a Telegram.
```

## CORS

Comando:

```bash
curl -i -sS \
  -H 'Origin: https://mattarzu.github.io' \
  -H 'Access-Control-Request-Method: POST' \
  -X OPTIONS \
  <contact-worker-url>/contact
```

Resultado esperado:

```txt
access-control-allow-origin: https://mattarzu.github.io
```

Resultado observado:

```txt
access-control-allow-origin: https://mattarzu.github.io
```

## Variables productivas

Cloudflare secret:

```txt
TELEGRAM_BOT_TOKEN
```

Variables operativas:

```txt
TELEGRAM_CHAT_ID=<private-chat-id>
ALLOWED_ORIGIN=https://mattarzu.github.io
```

## Resultado final

```txt
mmlab_contact_system_v1=passed
frontend_productive=GitHub Pages
backend_productive=Cloudflare Worker
telegram_delivery=passed
cors_productive_origin=passed
secret_not_tracked=passed
env_ignored=passed
venv_ignored=passed
```
