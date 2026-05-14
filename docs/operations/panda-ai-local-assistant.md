# Panda IA local assistant

## Estado

Panda IA quedó integrado como asistente local-first para M M LAB.

En local:

```text
Portfolio local
  -> Cloudflare Worker local /ai-chat
  -> Qwen local vía llama-server
En producción:

GitHub Pages
  -> Panda estable
  -> Contacto productivo
  -> IA deshabilitada por seguridad
Motivo de seguridad

La IA no queda habilitada en producción porque todavía no existe un dominio gestionado en Cloudflare para publicar Qwen local mediante Cloudflare Tunnel nombrado y Cloudflare Access.

Hasta tener ese frente completo, producción mantiene:

window.MMLAB_AI_ENABLED = false;
Backend productivo

El backend productivo actual es:

mmlab-contact-worker/

Endpoints:

GET  /health
POST /contact
POST /ai-chat

/ai-chat está listo para usar upstreams compatibles con OpenAI Chat Completions y soporta headers opcionales de Cloudflare Access:

CF-Access-Client-Id
CF-Access-Client-Secret
Pendiente para IA en producción

Para habilitar IA pública falta:

Agregar un dominio a Cloudflare.
Crear túnel nombrado hacia Qwen local.
Proteger el hostname con Cloudflare Access.
Crear Service Token.
Cargar secrets en el Worker:
AI_BASE_URL
AI_API_KEY
AI_MODEL
AI_ACCESS_CLIENT_ID
AI_ACCESS_CLIENT_SECRET
Cambiar window.MMLAB_AI_ENABLED = true.
