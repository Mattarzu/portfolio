
Panda AI local assistant
Estado

Panda IA local quedó integrado como asistente local del portfolio M M LAB.

Funciona en desarrollo local usando Qwen vía llama-server y un Worker local como capa intermedia.

Componentes
Qwen local
  -> llama-server
  -> 127.0.0.1:8080
Cloudflare Worker local
  -> 127.0.0.1:8787
  -> /ai-chat
Portfolio local
  -> assets/js/panda-stable.js
  -> assets/css/panda-stable.css
Flujo local
Usuario
  -> Panda UI
  -> /ai-chat
  -> Worker local
  -> llama-server
  -> Qwen local
Archivos principales
assets/js/panda-stable.js
assets/css/panda-stable.css
mmlab-contact-worker/src/worker.js
Producción

La IA local queda deshabilitada en producción:

window.MMLAB_AI_ENABLED = false;

Motivo:

evitar exposición pública del modelo local;
evitar abuso del endpoint;
evitar publicar infraestructura doméstica sin autenticación;
mantener GitHub Pages seguro.
Requisito para habilitar IA en producción

No habilitar Panda IA pública hasta tener:

Dominio propio
  -> Cloudflare Tunnel nombrado
  -> Cloudflare Access
  -> Service Token
  -> Worker validando acceso
  -> Qwen local protegido
Regla operativa

Panda puede estar visible como UI estable, pero el modo IA debe quedar cerrado en producción hasta que exista una ruta autenticada.

Validación local básica
curl -fsS http://127.0.0.1:8787/health
curl -fsS \
  -X POST http://127.0.0.1:8787/ai-chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"respondé exactamente: panda-ok"}'
Validación frontend

Revisar que el navegador cargue:

assets/js/panda-stable.js
assets/css/panda-stable.css

Y que producción mantenga:

window.MMLAB_AI_ENABLED = false;

