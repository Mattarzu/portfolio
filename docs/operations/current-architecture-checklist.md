# ALLFICTION — checklist de arquitectura actual

## Frontend

- Portfolio V3 estático.
- Destino de publicación: Cloudflare Pages, subida directa desde GitHub Actions.
- `.github/workflows/deploy-pages.yml` sólo corre con `workflow_dispatch` desde `main`, y sólo si existen los secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` más la variable `CLOUDFLARE_PAGES_PROJECT`.
- Build: `node scripts/prepare-pages-output.mjs`. Directorio publicado: `dist`. El comando copia el sitio y excluye Worker, docs, tests y FastAPI.
- AWS Lightsail y Caddy quedan como legado pendiente de baja. `deploy-lightsail.yml` se eliminó. Un merge a `main` no despliega a Lightsail.
- El frontend sigue apuntando al Worker existente en `contact-config.js`.
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
- CORS limitado a orígenes explícitos. `wrangler.toml` agrega el marcador `https://PAGES_PROJECT_NAME.pages.dev`. No rige en el Worker publicado hasta el próximo `wrangler deploy`.
- Telegram Bot API como destino de contactos.
- FastAPI en `mmlab-contact-api/` conservado únicamente como implementación legacy.

## Validación

- Tests unitarios de recuperación, CORS, límites, privacidad, fallback y adaptadores.
- Validación de sintaxis JavaScript.
- Contratos de HTML, assets, canonical y presupuestos de tamaño.
- Smoke test público del frontend dentro del workflow manual de Pages, con las mismas comprobaciones que el antiguo deploy de Lightsail.

## Reglas operativas

- Nunca guardar `GEMINI_API_KEY`, `OPENAI_API_KEY` ni `TELEGRAM_BOT_TOKEN` en Git.
- No activar Gemini real con facturación vinculada.
- No reutilizar una clave general de desarrollo.
- No eliminar el modo guiado.
- No habilitar tools, web search o agentes para este caso de uso.
