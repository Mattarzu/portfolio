# M M LAB Portfolio Optimization Validation V1

## Objetivo

Validar los frentes de optimización aplicados al portfolio M M LAB:

```txt
SEO técnico
Open Graph
Twitter Card
schema.org
manifest
accesibilidad
reduced motion
responsive Panda
copy comercial inicial
higiene de secretos
```

## Commits validados

```txt
614b76b Ignore local env and virtualenv files
17904e7 Document M M LAB contact system
de772e6 Add site manifest and structured metadata
1996e9d Add social metadata to project pages
8b7dbe5 Clean project metadata whitespace
c1d2115 Improve Panda accessibility and motion handling
b952fe7 Improve Panda mobile panel layout
15fc76e Improve commercial copy and contact CTA
```

## Validación de Git

Resultado esperado:

```txt
main sincronizada con origin/main
working tree limpio
```

Comando:

```bash
git status -sb
```

Resultado esperado:

```txt
## main...origin/main
```

## Validación de secretos

Comando:

```bash
git grep -nE '<secret-scan-patterns>' || true
```

Resultado esperado:

```txt
sin tokens reales hardcodeados
```

## Validación SEO base

Archivos esperados:

```txt
robots.txt
sitemap.xml
site.webmanifest
favicon.svg
preview.png
```

Head principal esperado en `index.html`:

```txt
title
description
canonical
Open Graph
Twitter Card
theme-color
color-scheme
manifest
schema.org JSON-LD
```

## Validación páginas de proyectos

Páginas esperadas con metadata social:

```txt
projects/index.html
projects/router-llm.html
projects/asistente-codigo.html
projects/orquestador-entornos.html
projects/gymcontrol.html
projects/hardening-linux.html
projects/traductor-ia.html
```

Cada página debe incluir:

```txt
title
description
canonical
og:title
og:description
og:type
og:url
og:image
og:locale
twitter:card
twitter:title
twitter:description
twitter:image
```

## Validación accesibilidad

Puntos esperados:

```txt
skip-link presente
nav con aria-label
nav-toggle con aria-expanded
Panda toggle con aria-label
Panda panel con aria-controls
panda-message con role=status
panda-message con aria-live=polite
panda-message con aria-atomic=true
formulario Panda con aria-describedby
botones Panda con aria-label donde corresponde
focus-visible global
```

## Validación motion

Puntos esperados:

```txt
prefers-reduced-motion en CSS
scrollIntoView respeta reduced motion desde JS
animaciones del Panda reducibles
scroll-behavior auto cuando reduced motion está activo
```

## Validación mobile Panda

Puntos esperados:

```txt
panel Panda mobile estable
bottom sheet en pantallas chicas
max-height con 100dvh
scroll interno
overscroll-behavior contain
tap targets de botones ampliados
textarea más usable
```

## Validación comercial

Cambios esperados:

```txt
Nav incluye Servicios
Nav incluye Contacto
Hero comunica soluciones web, automatización e IA
CTA principal: Consultar una solución
Sección Servicios orientada a cliente
Sección Contacto orientada a consulta concreta
GitHub como CTA secundario
```

## Resultado final

```txt
mmlab_portfolio_optimization_v1=passed
seo_base=passed
social_metadata=passed
structured_data=passed
manifest=passed
accessibility=passed
reduced_motion=passed
mobile_panda=passed
commercial_copy=passed
secret_scan=passed
git_sync=passed
```
