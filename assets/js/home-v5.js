(() => {
  const root = document.documentElement;
  root.classList.add("design-v5");

  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  ready(() => {
    if (document.querySelector("[data-v5-root]")) return;

    const recentWork = document.getElementById("ingenieria-reciente");
    const selectedWork = document.getElementById("trabajo");
    const capabilities = document.getElementById("capacidades");
    const contact = document.getElementById("contacto");

    const languageMarkup = (es, en) =>
      `<span data-lang="es">${es}</span><span data-lang="en">${en}</span>`;

    if (recentWork) {
      recentWork.classList.add("v5-scene-boundary");
    }

    if (selectedWork && capabilities) {
      const cinema = document.createElement("section");
      cinema.className = "v5-cinema v5-scene";
      cinema.dataset.v5Root = "cinema";
      cinema.dataset.v5ScrollScene = "";
      cinema.innerHTML = `
        <div class="shell v5-cinema-head reveal">
          <p class="overline">02.5 / ${languageMarkup("Producto en uso", "Product in use")}</p>
          <div class="v5-cinema-title-row">
            <h2>${languageMarkup("La interfaz también<br><em>es ingeniería.</em>", "The interface is<br><em>engineering too.</em>")}</h2>
            <p>${languageMarkup(
              "No mostramos renders genéricos cuando existe producto real. Esta escena usa capturas reales de Qivox y las presenta a escala de producto, no como miniaturas.",
              "When real product exists, we do not hide it behind generic renders. This scene uses real Qivox captures and presents them at product scale, not as thumbnails.",
            )}</p>
          </div>
        </div>
        <div class="v5-cinema-track">
          <div class="shell v5-cinema-sticky">
            <div class="v5-cinema-copy" data-v5-parallax="-18">
              <span class="v5-kicker">QIVOX / ERGO V2</span>
              <h3>${languageMarkup("Una plataforma.<br>Dos superficies reales.", "One platform.<br>Two real surfaces.")}</h3>
              <p>${languageMarkup(
                "Web y experiencia móvil dentro de la misma arquitectura multi-sede, con datos persistentes y operaciones en tiempo real.",
                "Web and mobile experience within the same multi-site architecture, with persistent data and real-time operations.",
              )}</p>
              <a class="text-link v5-magnetic" href="./projects/ergo-v2.html">${languageMarkup("Explorar el caso", "Explore the case")} <span>↗</span></a>
            </div>
            <div class="v5-cinema-visual v5-spotlight" data-v5-tilt data-v5-parallax="18">
              <div class="v5-browser-frame">
                <div class="v5-browser-bar"><span><i></i><i></i><i></i></span><small>qivox / club experience</small><b>LIVE PRODUCT</b></div>
                <img src="./assets/projects/ergo-v2/ergo-club-web.webp" width="1440" height="1200" loading="lazy" decoding="async" fetchpriority="low" alt="Interfaz web real de Qivox Gym" />
              </div>
              <div class="v5-phone-frame">
                <span aria-hidden="true"></span>
                <img src="./assets/projects/ergo-v2/ergo-club-app.webp" width="430" height="932" loading="lazy" decoding="async" fetchpriority="low" alt="Interfaz móvil real de Qivox Gym" />
              </div>
              <div class="v5-cinema-badge"><i></i><span>REAL UI / RESPONSIVE / PRODUCTION</span></div>
            </div>
          </div>
        </div>
      `;

      const build = document.createElement("section");
      build.id = "what-we-build";
      build.className = "section v5-build-section v5-scene";
      build.dataset.v5Root = "build";
      build.innerHTML = `
        <div class="shell v5-build-layout">
          <header class="v5-build-intro reveal">
            <p class="overline">03 / ${languageMarkup("What we build", "What we build")}</p>
            <h2>${languageMarkup("Capacidades que<br><em>terminan en sistemas.</em>", "Capabilities that<br><em>end in systems.</em>")}</h2>
            <p>${languageMarkup(
              "No es una lista de tecnologías. Cada capacidad representa una clase de problema que podemos llevar desde la idea hasta una solución operable.",
              "This is not a technology checklist. Each capability represents a class of problem we can take from an idea to an operable solution.",
            )}</p>
            <div class="v5-build-index"><span>01—08</span><i></i><small>${languageMarkup("disciplinas conectadas", "connected disciplines")}</small></div>
          </header>
          <div class="v5-build-grid">
            ${[
              ["01", "AI Systems", "Agents · RAG · multimodal · routing", "MotorAtlas · MollChef · PolyLLM"],
              ["02", "Full Stack Platforms", "Product · APIs · realtime · auth", "Qivox · MollChef"],
              ["03", "Computer Vision", "OCR · image understanding · extraction", "Recipe scanning · document flows"],
              ["04", "3D Experiences", "Three.js · technical visualization · guided UX", "MotorAtlas 3D"],
              ["05", "Automation", "Agents · workflows · queues · orchestration", "MattMesh · AgentBridge"],
              ["06", "Data Systems", "PostgreSQL · Redis · modelling · audit", "Crypto Risk · MotorAtlas"],
              ["07", "Infrastructure", "Linux · containers · networking · CI/CD", "AWS · Tailscale · observability"],
              ["08", "Mobile / PWA", "Touch-first · offline-aware · responsive", "MollChef · Qivox"],
            ].map(([number, title, stack, projects], index) => `
              <article class="v5-build-card reveal ${index % 3 === 1 ? "v5-build-card-offset" : ""}" data-v5-tilt>
                <span class="v5-build-number">${number}</span>
                <div class="v5-build-card-body">
                  <h3>${title}</h3>
                  <p>${stack}</p>
                  <small>${projects}</small>
                </div>
                <span class="v5-build-arrow" aria-hidden="true">↗</span>
              </article>
            `).join("")}
          </div>
        </div>
      `;

      const statement = document.createElement("section");
      statement.className = "v5-statement v5-scene";
      statement.dataset.v5Root = "statement";
      statement.dataset.v5ScrollScene = "";
      statement.innerHTML = `
        <div class="shell v5-statement-inner">
          <p class="overline">ALLFICTION / PRINCIPLE</p>
          <h2 data-v5-parallax="-26">${languageMarkup(
            "El software no debería<br><em>sentirse genérico.</em>",
            "Software should not<br><em>feel generic.</em>",
          )}</h2>
          <p data-v5-parallax="16">${languageMarkup(
            "Cada sistema tiene dominio, restricciones, usuarios y decisiones propias. El diseño tiene que hacerlo visible.",
            "Every system has its own domain, constraints, users and decisions. The design should make that visible.",
          )}</p>
        </div>
      `;

      selectedWork.insertAdjacentElement("afterend", cinema);
      cinema.insertAdjacentElement("afterend", build);
      build.insertAdjacentElement("afterend", statement);
    }

    if (capabilities) {
      capabilities.classList.add("v5-depth-section");
      const heading = capabilities.querySelector(".section-heading h2");
      if (heading) {
        const es = heading.querySelector("[data-lang='es']");
        const en = heading.querySelector("[data-lang='en']");
        if (es) es.innerHTML = "Profundidad técnica.<br><em>Sin silos.</em>";
        if (en) en.innerHTML = "Technical depth.<br><em>Without silos.</em>";
      }
    }

    if (contact) {
      contact.classList.add("v5-contact");
      const heading = contact.querySelector("h2");
      if (heading) {
        const es = heading.querySelector("[data-lang='es']");
        const en = heading.querySelector("[data-lang='en']");
        if (es) es.innerHTML = "¿Tenés algo difícil<br><em>para construir?</em>";
        if (en) en.innerHTML = "Have something difficult<br><em>to build?</em>";
      }

      const sideCopy = contact.querySelector(".contact-side > p");
      if (sideCopy) {
        const es = sideCopy.querySelector("[data-lang='es']");
        const en = sideCopy.querySelector("[data-lang='en']");
        if (es) es.textContent = "Contame el objetivo y la restricción principal. Lo convertimos en arquitectura, producto y una ruta verificable a producción.";
        if (en) en.textContent = "Share the goal and the main constraint. We turn it into architecture, product and a verifiable path to production.";
      }
    }

    const meter = document.createElement("div");
    meter.className = "v5-scroll-meter";
    meter.setAttribute("aria-hidden", "true");
    meter.innerHTML = "<i></i>";
    document.body.appendChild(meter);

    const desktopMotion = window.matchMedia("(min-width: 901px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scrollScenes = Array.from(document.querySelectorAll("[data-v5-scroll-scene]"));
    const parallaxNodes = Array.from(document.querySelectorAll("[data-v5-parallax]"));
    let rafId = 0;

    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

    const updateScrollEffects = () => {
      rafId = 0;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pageProgress = clamp(scrollTop / maxScroll);
      meter.style.setProperty("--v5-page-progress", pageProgress.toFixed(4));

      if (!desktopMotion.matches) return;

      scrollScenes.forEach((scene) => {
        const rect = scene.getBoundingClientRect();
        if (rect.bottom < -window.innerHeight || rect.top > window.innerHeight * 2) return;
        const range = Math.max(1, rect.height + window.innerHeight);
        const progress = clamp((window.innerHeight - rect.top) / range);
        scene.style.setProperty("--v5-progress", progress.toFixed(4));
      });

      parallaxNodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;
        const intensity = Number(node.dataset.v5Parallax || 0);
        const centerDelta = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        const shift = clamp(centerDelta, -1.2, 1.2) * intensity;
        node.style.setProperty("--v5-parallax-y", `${shift.toFixed(2)}px`);
      });
    };

    const requestScrollUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateScrollEffects);
    };

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate, { passive: true });
    desktopMotion.addEventListener?.("change", requestScrollUpdate);
    requestScrollUpdate();

    const revealNewNodes = Array.from(document.querySelectorAll("[data-v5-root] .reveal:not(.is-visible)"));
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      revealNewNodes.forEach((node) => node.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
      );
      revealNewNodes.forEach((node) => revealObserver.observe(node));
    }

    const sceneNodes = Array.from(document.querySelectorAll(".v5-scene"));
    if ("IntersectionObserver" in window) {
      const sceneObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => entry.target.classList.toggle("is-active", entry.isIntersecting));
        },
        { rootMargin: "-12% 0px -12% 0px", threshold: 0.04 },
      );
      sceneNodes.forEach((node) => sceneObserver.observe(node));
    }

    const pointerFine = () => desktopMotion.matches;

    document.querySelectorAll("[data-v5-tilt]").forEach((card) => {
      let pointerRaf = 0;
      let nextX = 0;
      let nextY = 0;

      const renderTilt = () => {
        pointerRaf = 0;
        card.style.setProperty("--v5-tilt-x", `${nextY.toFixed(2)}deg`);
        card.style.setProperty("--v5-tilt-y", `${nextX.toFixed(2)}deg`);
      };

      card.addEventListener("pointermove", (event) => {
        if (!pointerFine()) return;
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        nextX = px * 4.5;
        nextY = py * -4.5;
        if (!pointerRaf) pointerRaf = window.requestAnimationFrame(renderTilt);
      });

      card.addEventListener("pointerleave", () => {
        nextX = 0;
        nextY = 0;
        if (!pointerRaf) pointerRaf = window.requestAnimationFrame(renderTilt);
      });
    });

    document.querySelectorAll(".v5-magnetic").forEach((node) => {
      let magneticRaf = 0;
      let tx = 0;
      let ty = 0;

      const render = () => {
        magneticRaf = 0;
        node.style.setProperty("--v5-magnetic-x", `${tx.toFixed(1)}px`);
        node.style.setProperty("--v5-magnetic-y", `${ty.toFixed(1)}px`);
      };

      node.addEventListener("pointermove", (event) => {
        if (!pointerFine()) return;
        const rect = node.getBoundingClientRect();
        tx = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
        ty = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
        if (!magneticRaf) magneticRaf = window.requestAnimationFrame(render);
      });

      node.addEventListener("pointerleave", () => {
        tx = 0;
        ty = 0;
        if (!magneticRaf) magneticRaf = window.requestAnimationFrame(render);
      });
    });

    document.querySelectorAll(".v5-spotlight").forEach((node) => {
      node.addEventListener("pointermove", (event) => {
        if (!pointerFine()) return;
        const rect = node.getBoundingClientRect();
        node.style.setProperty("--v5-pointer-x", `${event.clientX - rect.left}px`);
        node.style.setProperty("--v5-pointer-y", `${event.clientY - rect.top}px`);
      });
    });

    const syncLanguageAccessibility = () => {
      const english = String(root.lang || "").toLowerCase().startsWith("en");
      const cinemaVisual = document.querySelector(".v5-cinema-visual");
      if (cinemaVisual) {
        cinemaVisual.setAttribute(
          "aria-label",
          english ? "Real responsive Qivox product interfaces" : "Interfaces reales y responsivas del producto Qivox",
        );
      }
    };

    syncLanguageAccessibility();
    document.addEventListener("allfiction:language", syncLanguageAccessibility);
  });
})();
