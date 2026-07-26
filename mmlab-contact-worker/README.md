# ALLFICTION portfolio API

Cloudflare Worker que protege las funciones dinámicas del portfolio:

- `POST /contact`: reenvía contactos válidos a Telegram.
- `POST /ai-chat`: responde preguntas acotadas sobre ALLFICTION mediante el proveedor configurado.
- `GET /health`: informa disponibilidad y estado de configuración sin revelar secretos.

La web sigue alojada en AWS Lightsail. El Worker evita ejecutar un modelo o agregar
otro proceso a la instancia, por lo que AF Intelligence no exige ampliar AWS.

## AF Intelligence

El endpoint de IA usa una arquitectura híbrida:

1. Valida longitud, origen, honeypot y cuota.
2. Detecta intentos comunes de prompt injection.
3. Bloquea correos, teléfonos y posibles credenciales antes del proveedor.
4. Recupera sólo los fragmentos relevantes de `src/portfolio-context.js`.
5. Evita llamar al proveedor si la consulta está fuera del portfolio.
6. Usa un adaptador desacoplado con `store: false`.
7. Devuelve la respuesta y enlaces a la evidencia utilizada.
8. Ante cualquier error o límite, devuelve modo guiado verificado.

Proveedor y modelo fijados por defecto:

```text
gemini / gemini-3.5-flash-lite
```

Gemini Free Tier mantiene el costo en US$0 con facturación desactivada. Google puede
usar solicitudes del nivel gratuito para mejorar sus productos; por eso el frontend
lo informa y el Worker rechaza datos personales o secretos antes de la llamada.

El adaptador de `src/ai-provider.js` también conserva compatibilidad con OpenAI.
Para cambiar de proveedor se modifican `AI_PROVIDER`, `AI_MODEL` y el secreto
correspondiente; la interfaz y `/ai-chat` no cambian.

Límites de aplicación:

- 500 caracteres por pregunta.
- 220 tokens máximos de salida.
- 5 consultas cada 15 minutos por IP.
- 50 llamadas generativas globales por día.
- Sin herramientas, navegación web ni agentes.

La cuota diaria se mantiene en memoria cuando no existe un binding `AI_USAGE_KV`.
Para persistirla entre instancias se puede agregar un namespace KV. La protección
principal contra gasto es mantener desactivada la facturación del proyecto de Gemini.

## Secretos

Nunca guardar valores reales en Git.

```bash
cd mmlab-contact-worker
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put GEMINI_API_KEY
```

Variables públicas y límites viven en `wrangler.toml`.

## Costo cero y activación

Antes de habilitar la clave:

1. Crear un proyecto exclusivo para AF Intelligence en Google AI Studio.
2. Confirmar que el proyecto esté en Free Tier y sin facturación vinculada.
3. Crear una API key exclusiva y restringirla a Gemini API.
4. Guardar esa clave únicamente como `GEMINI_API_KEY` en Wrangler.
5. Desplegar y comprobar `/health` y una pregunta dentro del portfolio.

Sin facturación, el proveedor rechaza llamadas al agotarse la cuota gratuita y el
Worker vuelve al modo guiado. Los límites del Worker agregan defensa ante abuso.

Para usar OpenAI en el futuro:

```toml
AI_PROVIDER = "openai"
AI_MODEL = "gpt-5.4-nano-2026-03-17"
```

```bash
npx wrangler secret put OPENAI_API_KEY
```

En ese caso debe configurarse un límite de gasto en el proyecto de OpenAI antes del
despliegue.

## KV opcional

Crear un namespace:

```bash
npx wrangler kv namespace create AI_USAGE_KV
```

Agregar el identificador devuelto a `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "AI_USAGE_KV"
id = "ID_REAL_DEL_NAMESPACE"
```

No confirmar un ID inventado o de otra cuenta.

## Validación

```bash
npm test
npm run check
npx wrangler dev
```

Prueba local:

```bash
curl -fsS http://127.0.0.1:8787/health
curl -fsS \
  -X POST http://127.0.0.1:8787/ai-chat \
  -H 'Origin: http://127.0.0.1:8081' \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "¿Qué proyecto demuestra experiencia backend?",
    "locale": "es-AR",
    "sessionId": "local-test"
  }'
```

## Despliegue

```bash
npx wrangler deploy
```

Después del deploy:

```bash
curl -fsS https://mmlab-contact-api.mattm2.workers.dev/health
```

La respuesta nunca debe incluir claves o tokens.
