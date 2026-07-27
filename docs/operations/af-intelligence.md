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
  -> adaptador de proveedor
  -> Gemini Developer API (Free Tier)
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
- Bloqueo previo de correos, teléfonos y posibles credenciales.
- Recuperación desde una base de conocimiento versionada.
- Sin web search, tools, agentes ni acceso a sistemas privados.
- `gemini-3.5-flash-lite` estable como modelo predeterminado.
- Máximo 220 tokens de salida.
- `store: false`.
- Cinco consultas cada quince minutos por IP.
- Cincuenta llamadas generativas diarias.
- Fallback guiado ante cualquier error.
- Clave sólo como secreto del Worker.
- OpenAI disponible mediante configuración, sin cambiar el frontend.

## Control de costo

El Worker evita llamadas innecesarias y limita volumen. El proyecto de Gemini debe
permanecer en Free Tier sin facturación vinculada: cuando se agota la cuota, el
proveedor rechaza la llamada y el Worker vuelve al modo guiado. Nunca compartir una
clave de desarrollo general con el portfolio.

Google puede usar solicitudes del nivel gratuito para mejorar sus productos. La
interfaz lo informa de forma explícita y el backend impide enviar los patrones de
datos sensibles definidos en `portfolio-context.js`.

## Fuente de verdad

- Backend: `mmlab-contact-worker/src/worker.js`
- Adaptadores: `mmlab-contact-worker/src/ai-provider.js`
- Conocimiento: `mmlab-contact-worker/src/portfolio-context.js`
- Frontend: `assets/js/home-v3.js`
- Configuración pública: `contact-config.js`
- Límites desplegables: `mmlab-contact-worker/wrangler.toml`
- Pruebas: `mmlab-contact-worker/test/`

## Activación

La implementación puede integrarse sin clave: permanecerá en modo guiado.
La IA real se activa solamente después de crear un proyecto gratuito exclusivo,
guardar `GEMINI_API_KEY` con Wrangler y desplegar el Worker.
