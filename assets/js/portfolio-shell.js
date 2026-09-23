(() => {
  const root = document.documentElement;
  const body = document.body;
  const languageKey = "allfiction_language";
  const legacyLanguageKey = "mmlab_language";
  const pageName = window.location.pathname.split("/").pop() || "index.html";
  const isCatalog = /\/projects\/?$/.test(window.location.pathname) || pageName === "index.html";
  const isErgo = pageName === "ergo-v2.html";
  const isRouter = pageName === "router-llm.html";

  const normalizeLanguage = (value) =>
    String(value || "").toLowerCase().startsWith("en") ? "en-GB" : "es-AR";

  const localized = (es, en) => (normalizeLanguage(root.lang) === "en-GB" ? en : es);

  const proofByPage = {
    "crypto-risk-engine.html": [
      ["Producción", "Production", "AWS · public healthchecks", "AWS · public health checks"],
      ["12 + 2", "12 + 2", "tests de integración y E2E", "integration and E2E tests"],
      ["≈320 MiB", "≈320 MiB", "stack observado en reposo", "observed idle stack"],
      ["Auditable", "Auditable", "idempotencia + ledger", "idempotency + ledger"],
    ],
    "ergo-v2.html": [
      ["Demo pública", "Public demo", "producto desplegado", "deployed product"],
      ["Multi-sede", "Multi-site", "operación para gimnasios", "gym operations"],
      ["Full stack", "Full stack", "React · Express · PostgreSQL", "React · Express · PostgreSQL"],
      ["Realtime", "Realtime", "Socket.IO + Prisma", "Socket.IO + Prisma"],
    ],
    "router-llm.html": [
      ["Local-first", "Local-first", "sin API por defecto", "no API by default"],
      ["5 rutas", "5 routes", "local · dqwen · kqwen · cloud · auto", "local · dqwen · kqwen · cloud · auto"],
      ["Budget", "Budget", "control diario explícito", "explicit daily control"],
      ["Trace", "Trace", "routing verificable", "verifiable routing"],
    ],
    "index.html": [
      ["9", "9", "proyectos documentados", "documented projects"],
      ["3", "3", "casos destacados", "featured case studies"],
      ["ES / EN", "ES / EN", "navegación consistente", "consistent navigation"],
      ["Evidencia", "Evidence", "estado explícito por proyecto", "explicit status per project"],
    ],
  };

  const ergoTranslations = new Map(Object.entries({
    "← Volver a proyectos": "← Back to projects",
    "ALLFICTION Software · Proyecto publicado": "ALLFICTION Software · Published project",
    "ERGO CLUB / ERGO V2": "ERGO CLUB / ERGO V2",
    "Gestión integral para gimnasios.": "End-to-end gym management.",
    "Plataforma web/PWA para administrar socios, membresías, pagos, staff, sedes, actividades y operaciones en tiempo real. La aplicación integra experiencia mobile para socios, panel de gestión para staff y flujos operativos multi-sede.": "A web/PWA platform for managing members, memberships, payments, staff, locations, activities and real-time operations. The application integrates a member mobile experience, a staff management panel and multi-site operational flows.",
    "Abrir demo": "Open demo",
    "Producto": "Product",
    "Experiencia de socios + staff/admin + flujos multi-sede.": "Member experience + staff/admin + multi-site flows.",
    "Backend": "Backend",
    "API Node/Express para socios, planes, actividades, sedes, pagos y operaciones.": "Node/Express API for members, plans, activities, locations, payments and operations.",
    "Deploy": "Deployment",
    "Frontend y API desplegados bajo infraestructura ALLFICTION con HTTPS y reverse proxy. El frontend se sirve con nginx y la API Node/Express opera bajo un endpoint independiente.": "Frontend and API deployed under ALLFICTION infrastructure with HTTPS and reverse proxy. The frontend is served with nginx and the Node/Express API runs on an independent endpoint.",
    "Vista del producto": "Product preview",
    "Captura real del despliegue público de ERGO CLUB, integrado como proyecto dentro de ALLFICTION Software.": "Real capture of the public ERGO CLUB deployment, integrated into the ALLFICTION Software portfolio.",
    "Qué resuelve": "What it solves",
    "Experiencia de socios": "Member experience",
    "Acceso para socios desde celular vía PWA con consulta de planes, actividades y navegación responsive.": "Mobile access for members via PWA with plan details, activities and responsive navigation.",
    "Gestión de staff": "Staff management",
    "Panel operativo para administración interna de socios, membresías, asistencias y roles de equipo.": "Operations panel for internal management of members, memberships, attendance and staff roles.",
    "Operación multi-sede": "Multi-site operations",
    "Control centralizado de múltiples sedes, actividades, pagos y sincronización en tiempo real.": "Centralised control of multiple locations, activities, payments and real-time synchronisation.",
    "Superficies del producto": "Product surfaces",
    "Interfaz adaptada para socios desde celular vía PWA con consulta de actividades, planes vigentes y acceso rápido a su estado de membresía.": "Mobile-adapted interface for members via PWA with activity schedules, active plans and quick access to membership status.",
    "Socios": "Members",
    "PWA": "PWA",
    "Mobile": "Mobile",
    "Gestión de staff y administración": "Staff management and administration",
    "Panel operativo para gestión de personal, control de socios, cobros, seguimiento de membresías y administración del gimnasio.": "Operations panel for personnel management, member records, billing, membership tracking and gym administration.",
    "Staff": "Staff",
    "Admin": "Admin",
    "Operaciones": "Operations",
    "Flujos operativos multi-sede": "Multi-site operational flows",
    "Módulos para coordinar actividades, sedes, membresías y métricas operativas centralizadas en tiempo real sobre la misma plataforma.": "Modules for coordinating activities, locations, memberships and centralised operational metrics in real time on the same platform.",
    "Multi-sede": "Multi-site",
    "Sincronización": "Synchronisation",
    "Tiempo real": "Real-time",
    "Estado del producto": "Product status",
    "Online": "Online",
    "Demo pública": "Public demo",
    "Aplicación online desplegada y accesible en ergo.56-126-148-93.sslip.io con HTTPS.": "Online application deployed and accessible at ergo.56-126-148-93.sslip.io with HTTPS.",
    "Activo": "Active",
    "Backend / API": "Backend / API",
    "API Node/Express activa bajo endpoint independiente en api-ergo.56-126-148-93.sslip.io.": "Node/Express API active under an independent endpoint at api-ergo.56-126-148-93.sslip.io.",
    "Disponible": "Available",
    "Healthcheck API": "API healthcheck",
    "Verificación de salud disponible en": "Health verification available at",
    "con respuesta JSON de estado operativo.": "with operational JSON response.",
    "nginx": "nginx",
    "Frontend runtime": "Frontend runtime",
    "Bundle SPA servido mediante nginx detrás de reverse proxy con terminación TLS.": "SPA bundle served via nginx behind a reverse proxy with TLS termination.",
    "Node / Express": "Node / Express",
    "Backend runtime": "Backend runtime",
    "Servicio backend en Node.js y Express con PostgreSQL, Prisma y comunicación en tiempo real.": "Backend service in Node.js and Express with PostgreSQL, Prisma and real-time communication.",
    "Caddy · HTTPS": "Caddy · HTTPS",
    "Infraestructura": "Infrastructure",
    "Reverse proxy Caddy con certificados HTTPS sobre infraestructura ALLFICTION.": "Caddy reverse proxy with HTTPS certificates over ALLFICTION infrastructure.",
    "Arquitectura técnica": "Technical architecture",
    "ERGO CLUB organiza superficies de producto y capas técnicas para mantener experiencia de socios, administración, API y persistencia desacopladas.": "ERGO CLUB organises product surfaces and technical layers to keep member experience, administration, API and persistence decoupled.",
    "Experiencia mobile": "Mobile experience",
    "Acceso para socios y experiencia PWA desde dispositivos móviles.": "Member access and PWA experience from mobile devices.",
    "Admin / staff": "Admin / staff",
    "Panel operativo para gestión interna y administración del gimnasio.": "Operations panel for internal gym management and administration.",
    "Operación": "Operations",
    "Flujos multi-sede": "Multi-site flows",
    "Coordinación centralizada de actividades, membresías y sedes.": "Centralised coordination of activities, memberships and locations.",
    "Endpoints para auth, socios, planes, staff y operaciones.": "Endpoints for auth, members, plans, staff and operations.",
    "Data": "Data",
    "PostgreSQL / Prisma": "PostgreSQL / Prisma",
    "Persistencia relacional de usuarios, membresías, pagos y sedes.": "Relational persistence for users, memberships, payments and locations.",
    "Reverse proxy Caddy con HTTPS y frontend servido por nginx.": "Caddy reverse proxy with HTTPS and frontend served by nginx.",
    "Separación de superficies": "Surface separation",
    "La plataforma organiza la experiencia de socios, la administración de staff y la operación multi-sede como roles dentro de una arquitectura modular desacoplada de la API y los datos.": "The platform organises the member experience, staff administration and multi-site operations as roles within a modular architecture decoupled from API and data.",
    "Evolución del producto": "Product evolution",
    "El sistema está preparado para seguir creciendo con más módulos de gestión, reportes, automatizaciones, métricas y administración multi-sede.": "The system is prepared to grow with more management modules, reports, automation, metrics and multi-site administration.",
    "Stack técnico": "Technical stack",
    "Proyecto full stack desarrollado como producto independiente dentro del ecosistema ALLFICTION Software.": "A full-stack project developed as an independent product within the ALLFICTION Software ecosystem.",
    "Tecnologías": "Technologies",
    "ERGO CLUB se mantiene aislado del portfolio para conservar deploy, base de datos, backend, secretos y evolución técnica independientes.": "ERGO CLUB remains isolated from the portfolio so deployment, database, backend, secrets and technical evolution stay independent.",
    "Resumen técnico": "Technical summary",
    "Vista previa de ERGO CLUB": "ERGO CLUB preview",
    "Superficies del producto ERGO CLUB": "ERGO CLUB product surfaces",
    "Estado del producto ERGO CLUB": "ERGO CLUB product status",
    "Arquitectura técnica de ERGO CLUB": "ERGO CLUB technical architecture",
  }));


  const accessibleTranslations = new Map([
    ["Navegación principal", "Main navigation"],
    ["Idioma", "Language"],
    ["Abrir navegación", "Open navigation"],
    ["Cerrar navegación", "Close navigation"],
    ["Filtrar proyectos", "Filter projects"],
    ["Enlaces", "Links"],
    ["Visualización conceptual del health factor", "Conceptual health-factor visualisation"],
    ["Serie de riesgo con recuperación", "Risk series with recovery"],
    ["Navegación", "Navigation"],
    ["Resumen técnico", "Technical summary"],
    ["Vista previa de ERGO CLUB", "ERGO CLUB preview"],
    ["Captura de la web pública de ERGO CLUB", "Public ERGO CLUB website screenshot"],
    ["Superficies del producto ERGO CLUB", "ERGO CLUB product surfaces"],
    ["Estado del producto ERGO CLUB", "ERGO CLUB product status"],
    ["Arquitectura técnica de ERGO CLUB", "ERGO CLUB technical architecture"],
    ["Tecnologías", "Technologies"],
    ["Seleccionar idioma", "Select language"],
    ["Estado público del proyecto", "Public project status"],
    ["Navegación entre proyectos", "Project navigation"],
    ["Evidencia del proyecto", "Project evidence"],
  ]);
  const accessibleTranslationsReverse = new Map(
    Array.from(accessibleTranslations, ([es, en]) => [en, es]),
  );

  const originalText = new WeakMap();

  function translateErgo(language) {
    if (!isErgo) return;
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      if (!originalText.has(node)) originalText.set(node, node.nodeValue);
      const source = originalText.get(node);
      const trimmed = source.trim();
      const translationKey = trimmed.replace(/\s+/g, " ");
      if (language === "en-GB" && ergoTranslations.has(translationKey)) {
        node.nodeValue = source.replace(trimmed, ergoTranslations.get(translationKey));
      } else {
        node.nodeValue = source;
      }
    });
  }

  function updateMetadata(language) {
    const title = language === "en-GB" ? root.dataset.titleEn : root.dataset.titleEs;
    const description =
      language === "en-GB" ? root.dataset.descriptionEn : root.dataset.descriptionEs;
    const setMeta = (selector, value) => {
      if (value) document.querySelector(selector)?.setAttribute("content", value);
    };

    if (title) document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[property="og:locale"]', language === "en-GB" ? "en_GB" : "es_AR");
  }

  function syncLanguageButtons(language) {
    document.querySelectorAll("[data-af-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.afLanguage === language));
    });
  }

  function setLanguage(value, syncUrl = true) {
    const language = normalizeLanguage(value);
    root.lang = language;
    localStorage.setItem(languageKey, language);
    localStorage.setItem(legacyLanguageKey, language);

    if (isRouter && window.MMLAB_I18N?.setLanguage) {
      window.MMLAB_I18N.setLanguage(language, { syncUrl });
    } else if (syncUrl) {
      const url = new URL(window.location.href);
      if (language === "es-AR") url.searchParams.delete("lang");
      else url.searchParams.set("lang", "en");
      window.history.replaceState({}, "", url);
    }

    updateMetadata(language);
    translateErgo(language);
    syncLanguageButtons(language);
    updateAccessibleCopy(language);
  }

  function updateAccessibleCopy(language) {
    const english = language === "en-GB";
    const attributeMap = english ? accessibleTranslations : accessibleTranslationsReverse;
    document.querySelectorAll("[aria-label], [alt], [title], [placeholder]").forEach((node) => {
      ["aria-label", "alt", "title", "placeholder"].forEach((attribute) => {
        const current = node.getAttribute(attribute);
        const translated = current ? attributeMap.get(current) : null;
        if (translated) node.setAttribute(attribute, translated);
      });
    });

    const header = document.querySelector("[data-af-shell-header]");
    const nav = document.querySelector("[data-af-shell-nav]");
    const languageGroup = document.querySelector("[data-af-language-group]");
    const toggle = document.querySelector("[data-af-shell-toggle]");
    const menu = document.querySelector("[data-af-shell-actions]");
    header?.querySelector(".af-shell-brand")?.setAttribute(
      "aria-label",
      english ? "ALLFICTION Software — home" : "ALLFICTION Software — inicio",
    );
    nav?.setAttribute("aria-label", english ? "Main navigation" : "Navegación principal");
    languageGroup?.setAttribute("aria-label", english ? "Language" : "Idioma");
    if (toggle) {
      const open = menu?.classList.contains("is-open");
      toggle.setAttribute(
        "aria-label",
        english
          ? open
            ? "Close navigation"
            : "Open navigation"
          : open
            ? "Cerrar navegación"
            : "Abrir navegación",
      );
    }
  }

  function buildHeader() {
    const header = document.createElement("header");
    header.className = "af-shell-header";
    header.dataset.afShellHeader = "";
    header.innerHTML = `
      <div class="af-shell-inner">
        <a class="af-shell-brand" href="../index.html">
          <img src="../favicon.svg" width="38" height="38" alt="" aria-hidden="true" />
          <span><strong>ALLFICTION</strong><small>SOFTWARE</small></span>
        </a>
        <button class="af-shell-toggle" type="button" aria-expanded="false" data-af-shell-toggle>☰</button>
        <div class="af-shell-actions" data-af-shell-actions>
          <nav class="af-shell-nav" data-af-shell-nav>
            <a href="../index.html"><span data-lang="es">Inicio</span><span data-lang="en">Home</span></a>
            <a href="./index.html" aria-current="page"><span data-lang="es">Proyectos</span><span data-lang="en">Projects</span></a>
            <a href="../index.html#metodo"><span data-lang="es">Método</span><span data-lang="en">Method</span></a>
            <a href="../index.html#contacto"><span data-lang="es">Contacto</span><span data-lang="en">Contact</span></a>
          </nav>
          <div class="af-shell-language" role="group" data-af-language-group>
            <button type="button" data-af-language="es-AR" aria-pressed="true">ES</button>
            <button type="button" data-af-language="en-GB" aria-pressed="false">EN</button>
          </div>
          <a class="af-shell-cta" href="../index.html#contacto">
            <span data-lang="es">Trabajemos juntos</span><span data-lang="en">Let’s work together</span>
          </a>
        </div>
      </div>`;
    body.prepend(header);

    const toggle = header.querySelector("[data-af-shell-toggle]");
    const menu = header.querySelector("[data-af-shell-actions]");
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      toggle.textContent = open ? "×" : "☰";
      updateAccessibleCopy(normalizeLanguage(root.lang));
    });

    header.querySelectorAll("[data-af-language]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.afLanguage));
    });

    header.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
      });
    });
  }

  function buildProofStrip() {
    const items = proofByPage[pageName] || proofByPage["index.html"];
    const strip = document.createElement("section");
    strip.className = "af-proof-strip";
    strip.setAttribute("aria-label", localized("Evidencia del proyecto", "Project evidence"));
    strip.innerHTML = items
      .map(
        ([valueEs, valueEn, labelEs, labelEn]) => `
          <div class="af-proof-item">
            <strong><span data-lang="es">${valueEs}</span><span data-lang="en">${valueEn}</span></strong>
            <span><span data-lang="es">${labelEs}</span><span data-lang="en">${labelEn}</span></span>
          </div>`,
      )
      .join("");
    const main = document.querySelector("main");
    main?.before(strip);
  }

  function buildConversion() {
    const conversion = document.createElement("section");
    conversion.className = "af-conversion";
    conversion.innerHTML = `
      <div>
        <small>ALLFICTION / NEXT STEP</small>
        <h2><span data-lang="es">De evidencia técnica a una conversación concreta.</span><span data-lang="en">From technical evidence to a concrete conversation.</span></h2>
        <p><span data-lang="es">Contame el objetivo, el contexto y la restricción principal. La primera respuesta convierte ambigüedad en un plan verificable.</span><span data-lang="en">Share the goal, context and main constraint. The first response turns ambiguity into a verifiable plan.</span></p>
      </div>
      <div class="af-conversion-actions">
        <a href="../index.html#contacto"><span data-lang="es">Enviar una consulta</span><span data-lang="en">Send an enquiry</span><b aria-hidden="true">↗</b></a>
        <a href="https://www.linkedin.com/in/mattmercado77/" target="_blank" rel="noopener noreferrer">LinkedIn <b aria-hidden="true">↗</b></a>
        <a href="https://github.com/Mattarzu" target="_blank" rel="noopener noreferrer">GitHub <b aria-hidden="true">↗</b></a>
      </div>`;
    const main = document.querySelector("main");
    main?.append(conversion);

    const note = document.createElement("p");
    note.className = "af-shell-footer-note";
    note.innerHTML = `<span data-lang="es">Estado y métricas declarados según validaciones públicas documentadas.</span><span data-lang="en">Status and metrics are based on documented public validations.</span>`;
    main?.append(note);
  }

  function improveExistingAccessibility() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const rel = new Set(String(link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      link.setAttribute("rel", Array.from(rel).join(" "));
    });

    document.querySelectorAll("img:not([alt])").forEach((image) => image.setAttribute("alt", ""));
    document.querySelectorAll("[data-current-year]").forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  window.addEventListener("mmlab:languagechange", (event) => {
    const language = normalizeLanguage(event.detail?.language || root.lang);
    root.lang = language;
    localStorage.setItem(languageKey, language);
    localStorage.setItem(legacyLanguageKey, language);
    updateMetadata(language);
    translateErgo(language);
    syncLanguageButtons(language);
    updateAccessibleCopy(language);
  });

  buildHeader();
  buildProofStrip();
  buildConversion();
  improveExistingAccessibility();
  body.classList.add("af-shell-ready");
  body.dataset.afPage = isCatalog ? "catalog" : pageName.replace(/\.html$/, "");

  const requested = new URLSearchParams(window.location.search).get("lang");
  const saved = localStorage.getItem(languageKey) || localStorage.getItem(legacyLanguageKey);
  setLanguage(requested || saved || navigator.language, false);
})();
