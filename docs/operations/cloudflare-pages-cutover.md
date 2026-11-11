# Corte del frontend a Cloudflare Pages

El portfolio estático sale de AWS Lightsail. El Worker `mmlab-contact-api`
sigue siendo el backend de `/contact`, `/ai-chat`, `/health` y el resto de
rutas dinámicas. Este documento no despliega nada: deja el procedimiento para
hacerlo a mano.

## Decisión

Publicación por **subida directa** con GitHub Actions
(`cloudflare/wrangler-action@v4`), no por la integración Git de Pages.

- El workflow es `.github/workflows/deploy-pages.yml`.
- Sólo arranca con `workflow_dispatch` y sólo desde `main`.
- Un merge a `main` ejecuta `static-checks.yml` y no publica el sitio.
- Comando de build: `node scripts/prepare-pages-output.mjs`.
- Directorio de salida: `dist`.
- No hay compilador. El comando existe para no publicar el resto del repo.

La integración Git de Pages quedaría publicando cada push a la rama de
producción en cuanto el repositorio se conecta. Este corte no puede hacer eso:
Lightsail ya no debe recibir deploys, y el Worker todavía no admite el origen
de Pages hasta que se sustituya el marcador y Matt lo redespliegue.

El token de GitHub queda limitado a Pages. El workflow ejecuta `pages deploy`
y no despliega el Worker.

## Qué entra en `dist`

Archivos de la raíz: `index.html`, `404.html`, `robots.txt`, `sitemap.xml`,
`site.webmanifest`, `styles.css`, `main.js`, `contact-config.js`,
`favicon.svg`, `preview.png`.

Directorios: `assets/`, `projects/`, `panels/`.

Quedan fuera `mmlab-contact-worker/`, `mmlab-contact-api/`, `docs/`,
`scripts/`, `evals/`, `.github/` y los tests. `wrangler.toml` contiene
`TELEGRAM_CHAT_ID` y no se publica.

No se agregan `_headers` ni `_redirects`. El repositorio no tiene un Caddyfile
que copiar, y una CSP nueva podría romper el sitio. Pages sirve `404.html`
para rutas desconocidas.

## Qué no cambia en este cambio

- `contact-config.js` sigue apuntando a
  `https://mmlab-contact-api.mattm2.workers.dev`.
- El código del Worker no cambia. CORS sigue siendo una lista de orígenes
  exactos, separada por comas, sin comodines.
- Las URLs canónicas, Open Graph y `sitemap.xml` siguen en
  `https://allfiction.56-126-148-93.sslip.io`. No hay hostname real de Pages
  todavía, y `scripts/check-site.mjs` exige ese origen. No reemplazarlas por
  el marcador.

## CORS del Worker

`mmlab-contact-worker/wrangler.toml` agrega el marcador exacto
`https://PAGES_PROJECT_NAME.pages.dev` al final de `ALLOWED_ORIGIN`.
`PAGES_PROJECT_NAME` no es un proyecto real.

Sustituir ese texto por el slug del proyecto antes de redesplegar. El origen
de Pages takes effect only after the next wrangler deploy. Hasta ese deploy,
el Worker que está en producción conserva la lista anterior y el navegador en
Pages recibirá un rechazo de origen en contacto, IA y las demás rutas
dinámicas.

Los orígenes que ya estaban siguen: el sslip de Lightsail, GitHub Pages,
`http://127.0.0.1:8081` y `http://localhost:8081`. Las URLs de preview
(`https://<hash>.<proyecto>.pages.dev` y
`https://<rama>.<proyecto>.pages.dev`) no están permitidas. Un dominio propio
tampoco, hasta agregarlo como origen exacto y redesplegar el Worker.

## Checklist de Matt

Nombres solamente. No guardar valores en git.

### Cloudflare

1. En el dashboard: Workers & Pages → Create → Pages → Direct Upload.
   No conectar el repositorio de GitHub. La build la hace Actions.
2. Elegir el nombre del proyecto. Ese slug es la etiqueta de
   `https://<slug>.pages.dev`. Anotarlo: sustituye a `PAGES_PROJECT_NAME`.
3. Rama de producción: `main`.
4. La configuración de build del dashboard no se usa en Direct Upload.
   La build del repo es `node scripts/prepare-pages-output.mjs` y la salida
   es `dist`.
5. Crear un API token de cuenta: permiso **Account → Cloudflare Pages → Edit**.
   No otorgar Workers Scripts / Edit en ese token. Así GitHub no puede
   desplegar el Worker.
6. Copiar el Account ID desde el dashboard. Es un identificador, no una clave.

### GitHub

En Settings → Secrets and variables → Actions, a nivel del repositorio.
No crear un environment.

| Nombre | Tipo | Uso |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | secret | Token con Pages Edit |
| `CLOUDFLARE_ACCOUNT_ID` | secret | Account ID |
| `CLOUDFLARE_PAGES_PROJECT` | variable | Slug del proyecto, por ejemplo el nombre elegido en el paso 2 |

`CLOUDFLARE_PAGES_PROJECT` tiene que coincidir con el subdominio de
`pages.dev`: minúsculas, y empezar por una letra. No usar
`PAGES_PROJECT_NAME` ni `pages-project-name`.

### Primer publish

1. Merge de este PR a `main` cuando los checks estén verdes. Eso no publica.
2. Actions → Deploy portfolio frontend to Cloudflare Pages → Run workflow,
   rama `main`.
3. Si faltan el secret o la variable, el workflow se detiene antes de
   `pages deploy`.
4. Si el proyecto no existe, `pages deploy` falla. Crearlo antes en Cloudflare.

### Worker

1. En `mmlab-contact-worker/wrangler.toml`, reemplazar `PAGES_PROJECT_NAME`
   por el mismo slug.
2. Si hay dominio propio, agregar ese origen exacto (`https://...`) a
   `ALLOWED_ORIGIN` en el mismo cambio.
3. Desde `mmlab-contact-worker/`, redesplegar a mano con `npx wrangler deploy`.
   Este repo no lo hace. El token de GitHub no debería poder hacerlo.
4. Comprobar el preflight desde el origen real, no desde el marcador:

```bash
curl -i -sS \
  -H "Origin: https://SLUG.pages.dev" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  https://mmlab-contact-api.mattm2.workers.dev/contact
```

La respuesta tiene que incluir `access-control-allow-origin` con ese origen
exacto. Un origen distinto no debe recibirlo.

### Dominio propio, si se quiere

1. Pages → el proyecto → Custom domains → agregar el dominio.
2. En DNS, el registro que indique Pages (normalmente CNAME al target de Pages).
3. Agregar `https://<dominio>` a `ALLOWED_ORIGIN` y volver a desplegar el Worker.
4. Repetir la verificación de abajo contra ese origen.

## Verificación en vivo

Cuando el workflow termina, la URL de producción es
`https://<CLOUDFLARE_PAGES_PROJECT>.pages.dev`. El mismo workflow ya hace estas
comprobaciones, con cinco intentos. Para repetirlas a mano, con `URL` en ese
valor:

```bash
curl -fsSL "$URL/" | grep -q 'Crypto Risk Engine'
curl -fsSL "$URL/" | grep -q 'AF Intelligence'
curl -fsSL "$URL/" | grep -q 'assets/js/home-v3.js'
curl -fsSL "$URL/contact-config.js?v=20260813-v15" | grep -q 'home-v15.js'
curl -fsSL "$URL/assets/data/af-reliability.json?v=20260813-v15" | grep -q 'deterministic-regression'
curl -fsSL "$URL/assets/data/af-reliability.json?v=20260813-v15" | grep -q '"failed": 0'
curl -fsSL "$URL/assets/data/af-reliability.json?v=20260813-v15" | grep -q '"deterministicRegressionGate": true'
curl -fsSL "$URL/projects/crypto-risk-engine.html" | grep -q 'Redis Streams'
curl -fsS -o /dev/null "$URL/assets/css/home-v3.css"
curl -fsS -o /dev/null "$URL/assets/js/home-v3.js"
curl -fsS -o /dev/null "$URL/assets/js/home-v15.js?v=20260813-v15"
curl -fsS -o /dev/null "$URL/assets/css/home-v15.css?v=20260813-v15"
curl -fsS -o /dev/null "$URL/assets/brand/allfiction-software-hero-960.webp"
```

Además, en el navegador, desde esa URL:

- El formulario de contacto y AF Intelligence llaman a
  `mmlab-contact-api.mattm2.workers.dev`.
- Eso sólo responde al navegador después del redeploy del Worker con el origen
  real. Antes, el fallo esperado es de CORS.

Estas son las mismas afirmaciones que hacía el paso de verificación de
Lightsail. Cambia el host.

## Lightsail

`.github/workflows/deploy-lightsail.yml` se eliminó. El historial de git lo
conserva. El host `ubuntu@56.126.148.93` y
`https://allfiction.56-126-148-93.sslip.io` estaban caídos. Un push a `main`
ya no abre SSH ni despliega ahí.

Lightsail queda como legado pendiente de baja. Caddy en esa instancia deja de
ser el HTTPS del portfolio cuando Pages está verificado.

## Después del corte

Hacerlo sólo cuando la URL de Pages pasó la verificación de arriba y el Worker
ya acepta ese origen.

1. Crear un snapshot de la instancia Lightsail.
2. Confirmar que MollChef, Crypto Risk y Qivox/Ergo no siguen dependiendo de
   esta instancia. El sitio enlaza
   `mollchef.56-126-148-93.sslip.io`,
   `crypto-risk.56-126-148-93.sslip.io`,
   `ergo.56-126-148-93.sslip.io` y
   `api-ergo.56-126-148-93.sslip.io`. Un hostname sslip.io apunta a la IP que
   lleva escrita. Borrar la instancia o soltar la IP los corta si todavía
   salen de ahí. Este corte sólo mueve el frontend del portfolio.
3. Borrar la instancia.
4. Soltar la IP estática `56.126.148.93` sólo después de que Pages esté
   verificado en vivo.
5. Soltar esa IP rompe para siempre
   `https://allfiction.56-126-148-93.sslip.io` y cualquier otro nombre sslip
   de esa misma IP. No se puede recuperar el nombre cuando la IP vuelve al
   pool.
6. Las canónicas del repo siguen apuntando al sslip hasta un cambio posterior
   con el hostname definitivo. Liberar la IP las deja rotas aunque Pages
   funcione.
