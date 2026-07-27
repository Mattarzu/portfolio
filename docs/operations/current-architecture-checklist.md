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
- Adaptador generativo desacoplado de proveedor.
- Gemini Developer API como proveedor predeterminado.
- `gemini-3.5-flash-lite` fijado para comportamiento estable y Free Tier.
- Preguntas fuera de alcance no consumen tokens.
- Correos, teléfonos y posibles credenciales no salen del Worker.
- Respuestas generativas incluyen enlaces de evidencia.
- Fallback guiado disponible en Worker y frontend.
- Clave configurada sólo como secreto de Wrangler.

## Límites

- 500 caracteres de entrada.
- 220 tokens máximos de salida.
- Cinco consultas cada quince minutos por IP.
- Cincuenta llamadas generativas diarias.
- Proyecto de Gemini separado, Free Tier y sin facturación vinculada.

## Backend dinámico

- Cloudflare Worker para `/contact`, `/ai-chat` y `/health`.
- CORS limitado a orígenes explícitos.
- Telegram Bot API como destino de contactos.
- FastAPI en `mmlab-contact-api/` conservado únicamente como implementación legacy.

## Validación

- Tests unitarios de recuperación, CORS, límites, privacidad, fallback y adaptadores.
- Validación de sintaxis JavaScript.
- Contratos de HTML, assets, canonical y presupuestos de tamaño.
- Smoke test público del frontend después de cada deploy.

## Reglas operativas

- Nunca guardar `GEMINI_API_KEY`, `OPENAI_API_KEY` ni `TELEGRAM_BOT_TOKEN` en Git.
- No activar Gemini real con facturación vinculada.
- No reutilizar una clave general de desarrollo.
- No eliminar el modo guiado.
- No habilitar tools, web search o agentes para este caso de uso.
