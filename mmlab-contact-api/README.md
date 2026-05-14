# M M LAB contact API — legacy FastAPI backend

## Estado

Este directorio queda conservado como implementación histórica/local del backend de contacto.

El backend productivo actual de M M LAB es:

```text
mmlab-contact-worker/
Motivo

El portfolio productivo usa una arquitectura estática:

GitHub Pages
  -> Cloudflare Worker
  -> Telegram Bot API

Por eso, para producción se prioriza Cloudflare Worker.

Endpoints productivos actuales
GET  /health
POST /contact
POST /ai-chat
Uso actual

Este backend FastAPI no debe considerarse la fuente productiva.

Puede servir como:

referencia histórica;
laboratorio local;
respaldo conceptual;
comparación de implementación.
No guardar secretos

No guardar tokens ni credenciales en este directorio.

Los secretos productivos pertenecen a Cloudflare Worker mediante Wrangler:

npx wrangler secret put TELEGRAM_BOT_TOKEN

TELEGRAM_CHAT_ID, ALLOWED_ORIGIN y RATE_LIMIT_PER_MINUTE se gestionan como variables públicas del Worker cuando corresponda.

Decisión vigente

Backend productivo:

mmlab-contact-worker/

Backend legacy:

mmlab-contact-api/

Los cambios productivos de contacto o IA deben implementarse primero en el Worker.
