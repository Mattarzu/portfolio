# AF Intelligence — arquitectura productiva

## Objetivo

Ofrecer IA aplicada real en el portfolio sin ejecutar un modelo en AWS, depender de una
PC encendida ni permitir consumo sin límites.

## Flujo

```text
Visitante
  -> frontend estático en AWS Lightsail
  -> Cloudflare Worker /ai-chat
  -> recuperación local de contexto verificado
  -> OpenAI Responses API
  -> respuesta con enlaces de evidencia
```

Si la consulta está fuera de alcance, falta la clave, el proveedor falla o se alcanza
una cuota, el Worker responde en modo guiado. El frontend conserva además su propio
fallback local.

## Controles

- Orígenes CORS explícitos.
- Entrada máxima de 500 caracteres.
- Historial máximo de cuatro mensajes acotados.
- Detección temprana de prompt injection.
- Recuperación desde una base de conocimiento versionada.
- Sin web search, tools, agentes ni acceso a sistemas privados.
- `gpt-5.4-nano-2026-03-17` con razonamiento `none`.
- Máximo 220 tokens de salida.
- `store: false`.
- `safety_identifier` derivado y no reversible.
- Cinco consultas cada quince minutos por IP.
- Cincuenta llamadas generativas diarias.
- Fallback guiado ante cualquier error.
- Clave sólo como secreto del Worker.

## Control de costo

El Worker evita llamadas innecesarias y limita volumen. El corte mensual definitivo
debe ser un proyecto exclusivo de OpenAI con límite de US$2. Nunca compartir una clave
de desarrollo general con el portfolio.

## Fuente de verdad

- Backend: `mmlab-contact-worker/src/worker.js`
- Conocimiento: `mmlab-contact-worker/src/portfolio-context.js`
- Frontend: `assets/js/home-v3.js`
- Configuración pública: `contact-config.js`
- Límites desplegables: `mmlab-contact-worker/wrangler.toml`
- Pruebas: `mmlab-contact-worker/test/`

## Activación

La implementación puede integrarse sin clave: permanecerá en modo guiado.
La IA real se activa solamente después de guardar `OPENAI_API_KEY` con Wrangler,
confirmar el límite del proyecto de OpenAI y desplegar el Worker.
