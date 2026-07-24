# ALLFICTION portfolio API

Cloudflare Worker que protege las funciones dinámicas del portfolio:

- `POST /contact`: reenvía contactos válidos a Telegram.
- `POST /ai-chat`: responde preguntas acotadas sobre ALLFICTION mediante OpenAI.
- `GET /health`: informa disponibilidad y estado de configuración sin revelar secretos.

La web sigue alojada en AWS Lightsail. El Worker evita ejecutar un modelo o agregar
otro proceso a la instancia, por lo que AF Intelligence no exige ampliar AWS.

## AF Intelligence

El endpoint de IA usa una arquitectura híbrida:

1. Valida longitud, origen, honeypot y cuota.
2. Detecta intentos comunes de prompt injection.
3. Recupera sólo los fragmentos relevantes de `src/portfolio-context.js`.
4. Evita llamar al proveedor si la consulta está fuera del portfolio.
5. Llama a OpenAI Responses API con `store: false`.
6. Devuelve la respuesta y enlaces a la evidencia utilizada.
7. Ante cualquier error o límite, devuelve modo guiado verificado.

Modelo fijado por defecto:

```text
gpt-5.4-nano-2026-03-17
```

Límites de aplicación:

- 500 caracteres por pregunta.
- 220 tokens máximos de salida.
- 5 consultas cada 15 minutos por IP.
- 50 llamadas generativas globales por día.
- Sin herramientas, navegación web ni agentes.

La cuota diaria se mantiene en memoria cuando no existe un binding `AI_USAGE_KV`.
Para persistirla entre instancias se puede agregar un namespace KV; el límite mensual
autoritativo debe configurarse en un proyecto separado de OpenAI.

## Secretos

Nunca guardar valores reales en Git.

```bash
cd mmlab-contact-worker
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put OPENAI_API_KEY
```

Variables públicas y límites viven en `wrangler.toml`.

## Límite mensual obligatorio

Antes de habilitar la clave:

1. Crear un proyecto exclusivo para AF Intelligence en OpenAI.
2. Crear una service-account key para ese proyecto.
3. Fijar un límite mensual de US$2 en el proyecto.
4. Guardar esa clave únicamente como `OPENAI_API_KEY` en Wrangler.

El límite diario del Worker es defensa adicional; el límite del proyecto de OpenAI es
el corte de gasto que protege frente a reinicios o concurrencia distribuida.

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
