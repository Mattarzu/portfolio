# ALLFICTION — checklist de arquitectura actual

## Frontend

- Portfolio V3 estático.
- Producción en AWS Lightsail.
- Caddy administra HTTPS y reverse proxy.
- GitHub Actions despliega desde `main`.
- No existen secretos en HTML, CSS ni JavaScript público.

## AF Intelligence

- UI productiva en `assets/js/home-v3.js`.
- Endpoint productivo en `mmlab-contact-worker/src/worker.js`.
- Recuperación desde `mmlab-contact-worker/src/portfolio-context.js`.
- OpenAI Responses API como proveedor generativo.
- `gpt-5.4-nano-2026-03-17` fijado para comportamiento estable.
- Preguntas fuera de alcance no consumen tokens.
- Respuestas generativas incluyen enlaces de evidencia.
- Fallback guiado disponible en Worker y frontend.
- Clave configurada sólo como secreto de Wrangler.

## Límites

- 500 caracteres de entrada.
- 220 tokens máximos de salida.
- Cinco consultas cada quince minutos por IP.
- Cincuenta llamadas generativas diarias.
- Proyecto de OpenAI separado con límite mensual de US$2 pendiente de verificación
  al momento de activar la clave.

## Backend dinámico

- Cloudflare Worker para `/contact`, `/ai-chat` y `/health`.
- CORS limitado a orígenes explícitos.
- Telegram Bot API como destino de contactos.
- FastAPI en `mmlab-contact-api/` conservado únicamente como implementación legacy.

## Validación

- Tests unitarios de recuperación, CORS, límites, fallback y contrato de OpenAI.
- Validación de sintaxis JavaScript.
- Contratos de HTML, assets, canonical y presupuestos de tamaño.
- Smoke test público del frontend después de cada deploy.

## Reglas operativas

- Nunca guardar `OPENAI_API_KEY` ni `TELEGRAM_BOT_TOKEN` en Git.
- No activar IA real antes de configurar el límite del proyecto de OpenAI.
- No reutilizar una clave general de desarrollo.
- No eliminar el modo guiado.
- No habilitar tools, web search o agentes para este caso de uso.
