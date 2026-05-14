
M M LAB current architecture checklist
Frontend estático
 Portfolio estático.
 Producción en GitHub Pages.
 Sin backend propio dentro del frontend.
 Sin secretos en archivos públicos.
Panda estable
 UI estable separada.
 JavaScript principal: assets/js/panda-stable.js.
 CSS principal: assets/css/panda-stable.css.
 Panda visible sin depender de IA productiva.
Backend productivo
 Backend real en Cloudflare Worker.
 Directorio productivo: mmlab-contact-worker/.
 Archivo principal: mmlab-contact-worker/src/worker.js.
 Worker público desplegado.
Contacto
 Endpoint /contact.
 Honeypot validado.
 Telegram Bot API como destino final.
 Secretos gestionados en Cloudflare.
IA local
 Qwen local vía llama-server.
 llama-server local en 127.0.0.1:8080.
 Worker local en 127.0.0.1:8787.
 Endpoint /ai-chat probado localmente.
 Producción con window.MMLAB_AI_ENABLED = false.
Producción segura
 Panda IA no expuesta públicamente.
 GitHub Pages no llama al modelo local.
 No hay túnel público sin Access.
 No hay tokens productivos en Git.
Legacy
 FastAPI conservado como legacy.
 Directorio legacy: mmlab-contact-api/.
 No se usa como backend productivo.
 Documentado como referencia histórica/local.
Próximos frentes posibles
 Limpiar main.js y restos de Panda legacy.
 Agregar CI mínima para node --check y git diff --check.
 Preparar dominio Cloudflare.
 Diseñar Cloudflare Tunnel protegido con Access.
 Mejorar documentación pública del portfolio.
