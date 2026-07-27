# ALLFICTION Software Portfolio

Portfolio estático orientado a evidencia técnica: productos full stack, IA aplicada,
automatización, infraestructura y sistemas reales en producción.

La portada V3 incorpora AF Intelligence, un asistente híbrido con recuperación de
contexto verificado, IA generativa real, enlaces de evidencia y fallback guiado.
La credencial del proveedor existe únicamente en el Worker; nunca se expone al navegador.

## Producción

- URL: <https://allfiction.56-126-148-93.sslip.io/>
- Hosting: AWS Lightsail
- HTTPS y reverse proxy: Caddy
- Despliegue: GitHub Actions desde `main`
- API dinámica: Cloudflare Worker
- IA: adaptador multi-proveedor, Gemini Free Tier por defecto y fallback

## Ejecutar localmente

Desde la raíz del repositorio:

```bash
python3 -m http.server 8081
```

Abrir <http://127.0.0.1:8081/>.

## Validar

```bash
node --check assets/js/home-v3.js
npm test --prefix mmlab-contact-worker
node scripts/check-site.mjs
git diff --check
```

La validación comprueba enlaces y assets locales, IDs duplicados, URL canónica,
branding, manifest y presupuestos básicos de tamaño.

## Estructura principal

- `index.html`: portada V3.
- `projects/index.html`: catálogo filtrable.
- `projects/crypto-risk-engine.html`: caso de estudio principal.
- `assets/css/home-v3.css`: sistema visual negro/dorado de la portada V3.
- `assets/js/home-v3.js`: navegación, idioma, microinteracciones y AF Intelligence.
- `mmlab-contact-worker/src/worker.js`: contacto y endpoint protegido de IA.
- `mmlab-contact-worker/src/portfolio-context.js`: conocimiento verificable y recuperación.
- `docs/operations/af-intelligence.md`: contrato operativo y control de costo.
- `.github/workflows/static-checks.yml`: quality gate.
- `.github/workflows/deploy-lightsail.yml`: despliegue y smoke tests públicos.

## Publicación

Los cambios en `main` activan el despliegue a Lightsail. Antes de integrar:

1. Ejecutar las validaciones locales.
2. Revisar el diff y los enlaces externos.
3. Confirmar que la portada y los casos de estudio funcionen en desktop y mobile.
4. Integrar a `main` sólo cuando la versión esté aprobada para producción.
