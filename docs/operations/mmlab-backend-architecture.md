
M M LAB backend architecture
Resumen

M M LAB usa frontend estático con backend productivo en Cloudflare Worker.

La implementación FastAPI anterior queda conservada como backend legacy para referencia local e histórica.

Backend productivo

El backend productivo actual es:

mmlab-contact-worker/

Worker público:

https://mmlab-contact-api.mattm2.workers.dev

Archivo principal:

mmlab-contact-worker/src/worker.js
Endpoints productivos
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

Componentes locales actuales:

llama-server: 127.0.0.1:8080
Worker local: 127.0.0.1:8787
Endpoint UI: /ai-chat
Producción segura

En producción, la IA local queda deshabilitada explícitamente:

window.MMLAB_AI_ENABLED = false;

La IA no debe exponerse públicamente hasta tener una ruta protegida.

Arquitectura futura recomendada:

Dominio Cloudflare
  -> Cloudflare Tunnel nombrado
  -> Cloudflare Access
  -> Service Token
  -> Qwen local protegido
Backend legacy

El directorio siguiente queda como implementación legacy basada en FastAPI:

mmlab-contact-api/

No es el backend productivo.

Regla de mantenimiento

Cambios productivos de contacto o IA deben hacerse primero en:

mmlab-contact-worker/src/worker.js

No duplicar lógica productiva entre Worker y FastAPI salvo que sea una migración controlada o una prueba local documentada.

Estado actual recomendado
Frontend: GitHub Pages.
Contacto productivo: Cloudflare Worker.
Telegram Bot: activo mediante secretos de Cloudflare.
Panda IA local: funcional en desarrollo.
Panda IA producción: deshabilitado por seguridad.
FastAPI: legacy.
