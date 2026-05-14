
M M LAB backend architecture
Backend productivo

El backend productivo actual es Cloudflare Worker:

mmlab-contact-worker/

Worker público:

https://mmlab-contact-api.mattm2.workers.dev

Endpoints:

GET  /health
POST /contact
POST /ai-chat
Flujo de contacto
Portfolio GitHub Pages
  -> POST /contact
  -> Cloudflare Worker
  -> Telegram Bot API
  -> Telegram privado
Flujo de IA local

En desarrollo local:

Portfolio local
  -> Worker local /ai-chat
  -> Qwen local vía llama-server

En producción, la IA queda deshabilitada hasta tener:

Dominio Cloudflare
  -> Cloudflare Tunnel nombrado
  -> Cloudflare Access
  -> Service Token
  -> Qwen local protegido
Backend legacy

El directorio:

mmlab-contact-api/

queda como implementación legacy basada en FastAPI.

No es el backend productivo.

Regla de mantenimiento

Cambios productivos de contacto o IA deben hacerse primero en:

mmlab-contact-worker/src/worker.js

No duplicar lógica productiva entre Worker y FastAPI.
