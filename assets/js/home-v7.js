(() => {
  const root = document.documentElement;
  root.classList.add("design-v7");

  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  const bilingual = (es, en) =>
    `<span data-lang="es">${es}</span><span data-lang="en">${en}</span>`;

  ready(() => {
    if (document.querySelector("[data-af-v7-root]")) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    const setMotionTier = () => {
      const cores = Number(navigator.hardwareConcurrency || 4);
      const memory = Number(navigator.deviceMemory || 4);
      const compact = window.innerWidth < 901;

      let tier = "lite";
      if (reduceMotion.matches || coarsePointer.matches || compact) {
        tier = "static";
      } else if (cores >= 8 && memory >= 8) {
        tier = "full";
      }

      root.dataset.afMotion = tier;
    };

    setMotionTier();
    window.addEventListener("resize", setMotionTier, { passive: true });
    reduceMotion.addEventListener?.("change", setMotionTier);
    coarsePointer.addEventListener?.("change", setMotionTier);

    // Make the existing top navigation read like the rest of V6.
    const navCopy = [
      ["Proyectos", "Projects"],
      ["Qué hacemos", "What we do"],
      ["Cómo trabajamos", "How we work"],
      ["Contacto", "Contact"],
    ];
    document.querySelectorAll(".main-nav > a").forEach((link, index) => {
      const copy = navCopy[index];
      if (!copy) return;
      const es = link.querySelector("[data-lang='es']");
      const en = link.querySelector("[data-lang='en']");
      if (es) es.textContent = copy[0];
      if (en) en.textContent = copy[1];
    });

    const headerInner = document.querySelector(".header-inner");
    if (headerInner && !headerInner.querySelector(".af-section-readout")) {
      const readout = document.createElement("div");
      readout.className = "af-section-readout";
      readout.dataset.afV7Root = "readout";
      readout.setAttribute("aria-live", "polite");
      readout.innerHTML = `<strong>01</strong><span>${bilingual("Inicio", "Home")}</span>`;
      const navCluster = headerInner.querySelector(".nav-cluster");
      headerInner.insertBefore(readout, navCluster || null);
    }

    const hero = document.getElementById("inicio");
    const recent = document.getElementById("ingenieria-reciente");

    if (hero && recent && !document.querySelector(".af-system-map-section")) {
      const section = document.createElement("section");
      section.className = "af-system-map-section";
      section.id = "sistema";
      section.dataset.afV7Root = "system-map";
      section.innerHTML = `
        <div class="shell">
          <div class="af-system-map-head">
            <div>
              <p class="overline">01.5 / ${bilingual("Mapa del sistema", "System map")}</p>
              <h2>${bilingual("Lo que se ve<br><em>es una parte.</em>", "What you see<br><em>is one part.</em>")}</h2>
            </div>
            <p>${bilingual(
              "En estos proyectos, interfaz, APIs, modelos, datos, trabajos en segundo plano y despliegue se diseñan como partes del mismo sistema.",
              "Across these projects, interface, APIs, models, data, background jobs and deployment are designed as parts of the same system.",
            )}</p>
          </div>

          <div class="af-system-map" role="img" aria-label="Mapa de capas técnicas conectadas en los sistemas de ALLFICTION">
            <svg viewBox="0 0 1000 510" aria-hidden="true" focusable="false">
              <path d="M500 255 C410 190 320 120 165 72" />
              <path d="M500 255 C590 185 690 118 835 76" />
              <path d="M500 255 C650 250 790 247 927 248" />
              <path d="M500 255 C590 330 690 397 818 444" />
              <path d="M500 255 C410 330 310 400 178 444" />
              <path d="M500 255 C350 252 205 249 70 248" />
            </svg>
            <div class="af-system-core">AF</div>
            <div class="af-system-node af-node-ui"><b>UI</b><small>web · mobile · 3D</small></div>
            <div class="af-system-node af-node-api"><b>API</b><small>HTTP · realtime · auth</small></div>
            <div class="af-system-node af-node-ai"><b>AI</b><small>models · RAG · vision</small></div>
            <div class="af-system-node af-node-data"><b>DATA</b><small>PostgreSQL · Redis · audit</small></div>
            <div class="af-system-node af-node-jobs"><b>JOBS</b><small>queues · workers · automation</small></div>
            <div class="af-system-node af-node-deploy"><b>DEPLOY</b><small>Linux · containers · CI/CD</small></div>
          </div>
          <div class="af-system-map-foot"><i></i><span>${bilingual("una sola arquitectura, varias superficies", "one architecture, several surfaces")}</span></div>
        </div>
      `;
      recent.insertAdjacentElement("beforebegin", section);
    }

    const sections = [
      { id: "inicio", number: "01", es: "Inicio", en: "Home" },
      { id: "ingenieria-reciente", number: "02", es: "Proyectos", en: "Projects" },
      { id: "trabajo", number: "03", es: "Casos", en: "Cases" },
      { id: "what-we-build", number: "04", es: "Qué hacemos", en: "What we do" },
      { id: "metodo", number: "05", es: "Cómo trabajamos", en: "How we work" },
      { id: "contacto", number: "06", es: "Contacto", en: "Contact" },
    ].filter((item) => document.getElementById(item.id));

    if (sections.length && !document.querySelector(".af-context-rail")) {
      const rail = document.createElement("aside");
      rail.className = "af-context-rail";
      rail.dataset.afV7Root = "rail";
      rail.setAttribute("aria-label", "Navegación por secciones");
      rail.innerHTML = sections
        .map(
          (item) => `<a class="af-context-link" href="#${item.id}" data-af-section="${item.id}" aria-label="${item.number} ${item.es}"><i></i><span>${item.number} · ${item.es}</span></a>`,
        )
        .join("");
      document.body.appendChild(rail);
    }

    const readout = document.querySelector(".af-section-readout");
    const railLinks = Array.from(document.querySelectorAll(".af-context-link"));

    const updateSection = (item) => {
      if (!item) return;
      railLinks.forEach((link) => {
        const active = link.dataset.afSection === item.id;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });

      if (readout) {
        readout.innerHTML = `<strong>${item.number}</strong><span>${bilingual(item.es, item.en)}</span>`;
      }
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!visible) return;
          const item = sections.find((section) => section.id === visible.target.id);
          updateSection(item);
        },
        { rootMargin: "-28% 0px -54% 0px", threshold: [0.01, 0.08, 0.18, 0.35] },
      );
      sections.forEach((item) => observer.observe(document.getElementById(item.id)));
    } else {
      updateSection(sections[0]);
    }

    // Lightweight custom cursor: only on the strongest desktop tier.
    const cursor = document.createElement("div");
    cursor.className = "af-cursor";
    cursor.dataset.afV7Root = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);

    let cursorFrame = 0;
    let cursorX = -100;
    let cursorY = -100;

    const renderCursor = () => {
      cursorFrame = 0;
      cursor.style.transform = `translate3d(${(cursorX - cursor.offsetWidth / 2).toFixed(1)}px, ${(cursorY - cursor.offsetHeight / 2).toFixed(1)}px, 0)`;
    };

    document.addEventListener("pointermove", (event) => {
      if (root.dataset.afMotion !== "full") return;
      cursorX = event.clientX;
      cursorY = event.clientY;
      cursor.classList.add("is-visible");
      if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);
    });

    document.addEventListener("pointerover", (event) => {
      if (root.dataset.afMotion !== "full") return;
      const interactive = event.target.closest?.("a, button, [role='button'], input, textarea, select");
      cursor.classList.toggle("is-interactive", Boolean(interactive));
    });

    document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));

    const syncLanguageLabels = () => {
      const english = String(root.lang || "").toLowerCase().startsWith("en");
      railLinks.forEach((link) => {
        const item = sections.find((section) => section.id === link.dataset.afSection);
        if (!item) return;
        const label = english ? item.en : item.es;
        const span = link.querySelector("span");
        if (span) span.textContent = `${item.number} · ${label}`;
        link.setAttribute("aria-label", `${item.number} ${label}`);
      });
    };

    syncLanguageLabels();
    document.addEventListener("allfiction:language", syncLanguageLabels);
  });
})();
