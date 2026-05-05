# M M LAB Portfolio Optimization V1

## Estado

Resumen público de mejoras aplicadas al portfolio M M LAB.

El objetivo fue mejorar SEO, metadata social, accesibilidad, responsive, experiencia del asistente Panda y orientación comercial inicial, manteniendo una arquitectura simple y segura.

## Arquitectura pública

```txt
GitHub Pages
  -> HTML/CSS/JS estático
  -> contact-config.js
  -> Cloudflare Worker /contact
  -> destino privado de contacto
```

## Principios

```txt
sin secretos en frontend
sin tokens en Git
sin datos privados en documentación pública
commits pequeños
validación antes de push
arquitectura simple
frontend estático
backend de contacto separado
```

## Frentes realizados

### Higiene de secretos

Se reforzó `.gitignore` para evitar commitear archivos locales sensibles o pesados:

```txt
.env
.env.*
!.env.example
.venv/
**/.venv/
*/.env
*/.venv/
```

### Sistema de contacto

Se documentó la arquitectura general del sistema de contacto sin incluir secretos reales.

Archivos relacionados:

```txt
docs/operations/mmlab-contact-system.md
docs/validation/mmlab-contact-system-v1.md
```

### SEO técnico

Se validó y mejoró:

```txt
title
description
canonical
robots.txt
sitemap.xml
favicon
manifest
theme-color
color-scheme
```

### Metadata estructurada

Se agregó JSON-LD en `index.html`.

Tipos usados:

```txt
Person
Organization
ProfessionalService
WebSite
```

### Metadata social

Se agregó Open Graph y Twitter Card en la página principal y páginas de proyectos.

Campos usados:

```txt
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

### Accesibilidad

Se mejoró:

```txt
skip link
focus-visible global
aria-label en controles principales
aria-expanded en paneles
role=status para mensajes dinámicos
aria-live polite
aria-atomic
aria-describedby en formulario
reduced motion
```

### Panda

Se mejoró:

```txt
formulario integrado
estado de envío
mensajes accesibles
panel mobile más estable
tap targets más cómodos
scroll interno en mobile
reduced motion respetado desde JS
```

### Copy comercial

Se ajustó la web para comunicar mejor servicios:

```txt
Servicios
Contacto
CTA principal orientado a consulta
GitHub como respaldo técnico
hero más orientado a soluciones
```

## Validaciones recomendadas

```bash
git status -sb
git diff --check
```

Escaneo de secretos en archivos trackeados:

```bash
git grep -nE '<secret-scan-patterns>' || true
```

Resultado esperado:

```txt
sin secretos reales hardcodeados
```

## Estado final

```txt
seo_base=ok
social_metadata=ok
structured_data=ok
manifest=ok
accessibility=ok
reduced_motion=ok
panda_mobile=ok
commercial_copy=ok
secret_hygiene=ok
```

## Próximo frente

Crear una segunda web profesional para un abogado usando arquitectura similar:

```txt
HTML/CSS/JS estático
deploy estático
backend de contacto separado
secretos fuera de Git
SEO local
schema.org LegalService
diseño sobrio y profesional
```
