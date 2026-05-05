(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.querySelector(".panda-toggle");
  const panel = document.getElementById("panda-panel");
  const closeBtn = document.querySelector(".panda-close");
  const message = document.getElementById("panda-message");
  const hint = document.getElementById("panda-hint");
  const mode = document.getElementById("panda-mode");
  const heroMascot = document.querySelector(".hero-mascot");
  const pandaLinks = document.querySelectorAll(".panda-actions a");
  const projectCards = document.querySelectorAll(".project-card");

  if (!toggle || !panel || !message || !heroMascot) return;

  const states = {
    welcome: {
      mode: "Modo bienvenida",
      mood: "welcome",
      section: "inicio",
      text: "Hola, soy M M Panda. Te acompaño por M M LAB: software, automatización e IA aplicada.",
      hint: "Tip: la web muestra capacidades, proyectos y método de trabajo sin exponer detalles privados."
    },
    default: {
      mode: "Modo guía",
      mood: "idle",
      section: "inicio",
      text: "Estoy recorriendo M M LAB con vos.",
      hint: "Tip: pasá por las tarjetas para ver contexto rápido."
    },
    hero: {
      mode: "Modo inicio",
      mood: "hero",
      section: "inicio",
      text: "Esta portada resume el enfoque: software, automatización e IA aplicada.",
      hint: "Tip: el hero queda limpio porque el panda no ocupa una columna fija."
    },
    about: {
      mode: "Modo sobre mí",
      mood: "focus",
      section: "sobre-mi",
      text: "Esta sección resume el enfoque técnico sin convertir la página en un CV clásico.",
      hint: "Tip: es mejor mostrar criterio, método y capacidades que datos privados."
    },
    projects: {
      mode: "Modo proyectos",
      mood: "build",
      section: "proyectos",
      text: "Acá están las soluciones, productos y prototipos principales.",
      hint: "Tip: la descripción pública debe explicar valor y función, no detalles internos."
    },
    method: {
      mode: "Modo método",
      mood: "focus",
      section: "metodo",
      text: "Esta sección muestra cómo trabajás: diseño, validación, automatización y documentación.",
      hint: "Tip: el método comunica criterio de ingeniería, no solo tecnologías."
    },
    capabilities: {
      mode: "Modo capacidades",
      mood: "stack",
      section: "capacidades",
      text: "Acá se resumen las áreas técnicas principales: software, automatización, IA aplicada y operaciones.",
      hint: "Tip: esta sección ayuda a entender qué podés construir sin revisar todos los proyectos."
    },
    stack: {
      mode: "Modo stack",
      mood: "stack",
      section: "stack",
      text: "Esta parte resume las tecnologías y áreas principales.",
      hint: "Tip: mantené el stack corto, legible y orientado a capacidades."
    },
    roadmap: {
      mode: "Modo roadmap",
      mood: "roadmap",
      section: "roadmap",
      text: "El roadmap muestra evolución y próximos pasos.",
      hint: "Tip: una hoja de ruta hace que el proyecto se perciba vivo."
    },
    contact: {
      mode: "Modo GitHub",
      mood: "github",
      section: "contacto",
      text: "GitHub es la base pública de los proyectos.",
      hint: "Tip: cada repo debería tener README claro, estado actual y comandos reproducibles."
    }
  };

  const projectMessages = new Map([
    [
      "router llm híbrido",
      {
        mode: "Proyecto IA",
        mood: "build",
        section: "proyectos",
        text: "Este proyecto coordina modelos, rutas híbridas y validación técnica.",
        hint: "Tip: describilo por función y arquitectura general, no por nombres internos."
      }
    ],
    [
      "asistente local de código",
      {
        mode: "Proyecto código",
        mood: "focus",
        section: "proyectos",
        text: "Esta herramienta se enfoca en ayuda técnica, contexto y validación.",
        hint: "Tip: podés mostrar ejemplos de uso sin rutas locales ni tokens."
      }
    ],
    [
      "orquestador de entornos técnicos",
      {
        mode: "Proyecto entornos",
        mood: "stack",
        section: "proyectos",
        text: "Este proyecto organiza configuraciones, validaciones y automatización.",
        hint: "Tip: mantenelo abstracto y público, sin hostnames ni detalles internos."
      }
    ],
    [
      "gymcontrol",
      {
        mode: "Proyecto web",
        mood: "build",
        section: "proyectos",
        text: "GymControl representa una aplicación web operativa.",
        hint: "Tip: una demo visual o capturas del flujo lo harían más fuerte."
      }
    ],
    [
      "antivirus / hardening linux",
      {
        mode: "Proyecto seguridad",
        mood: "roadmap",
        section: "proyectos",
        text: "Este frente apunta a seguridad, hardening y auditoría básica.",
        hint: "Tip: separá seguridad defensiva, hardening y monitoreo en módulos."
      }
    ],
    [
      "traductor ia",
      {
        mode: "Proyecto IA aplicada",
        mood: "github",
        section: "proyectos",
        text: "Este proyecto puede convertirse en una utilidad clara para usuarios finales.",
        hint: "Tip: una mini demo español ↔ inglés técnico lo haría más tangible."
      }
    ]
  ]);

  let currentState = states.default;
  let userClosedPanel = false;
  let animationFrame = null;
  let autoCloseTimer = null;

  function autoClosePanel(delay = 5200) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(() => {
      setOpen(false);
    }, delay);
  }

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  }

  function applyState(state) {
    const next = typeof state === "string" ? states[state] : state;
    if (!next) return;

    currentState = next;

    if (mode) mode.textContent = next.mode;
    if (message) message.textContent = next.text;
    if (hint) hint.textContent = next.hint;

    document.body.dataset.pandaMood = next.mood || "idle";
    document.body.dataset.pandaSection = next.section || "inicio";

    scheduleMove();
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getSectionProgress() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
    return scrollTop / maxScroll;
  }

  function getSectionPosition(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return null;

    const rect = section.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      height: rect.height,
      center: rect.top + rect.height / 2
    };
  }

  function getMascotTarget() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const section = currentState.section || "inicio";
    const sectionPos = getSectionPosition(section);
    const progress = getSectionProgress();

    const isSmall = vw <= 760;

    if (isSmall) {
      return {
        x: vw - 132,
        y: vh - 210,
        side: "right"
      };
    }

    const sideBySection = {
      inicio: "right",
      "sobre-mi": "right",
      capacidades: "left",
      proyectos: "right",
      stack: "left",
      roadmap: "right",
      contacto: "left"
    };

    const side = sideBySection[section] || "right";

    const margin = 42;
    const safeTop = 96;
    const safeBottom = 34;
    const mascotWidth = 170;
    const mascotHeight = 230;

    const x =
      side === "left"
        ? margin
        : vw - mascotWidth - margin;

    let y;

    if (sectionPos && sectionPos.top < vh && sectionPos.bottom > 0) {
      y = clamp(sectionPos.center - mascotHeight * 0.5, safeTop, vh - mascotHeight - safeBottom);
    } else {
      const wave = Math.sin(progress * Math.PI * 2) * 42;
      y = clamp(120 + progress * (vh - 330) + wave, safeTop, vh - mascotHeight - safeBottom);
    }

    return { x, y, side };
  }

  function moveMascot() {
    animationFrame = null;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const target = getMascotTarget();

    heroMascot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
    heroMascot.dataset.side = target.side;

    toggle.style.position = "fixed";
    toggle.style.left = "0";
    toggle.style.top = "0";
    toggle.style.transform = `translate3d(${target.x + 102}px, ${target.y + 156}px, 0)`;

    const panelWidth = Math.min(340, vw - 32);
    const panelHeight = 275;

    let panelX =
      target.side === "left"
        ? target.x + 150
        : target.x - panelWidth + 20;

    let panelY = target.y + 30;

    panelX = clamp(panelX, 16, vw - panelWidth - 16);
    panelY = clamp(panelY, 16, vh - panelHeight - 16);

    panel.style.setProperty("--panda-panel-side", target.side);
    panel.style.width = `${panelWidth}px`;
    panel.style.transform = `translate3d(${panelX}px, ${panelY}px, 0)`;
  }

  function scheduleMove() {
    if (animationFrame) return;
    animationFrame = requestAnimationFrame(moveMascot);
  }

  window.addEventListener("scroll", scheduleMove, { passive: true });
  window.addEventListener("resize", scheduleMove);

  toggle.addEventListener("click", () => {
    userClosedPanel = false;
    const open = panel.hidden;
    setOpen(open);
    if (open) {
      applyState("default");
      autoClosePanel();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      userClosedPanel = true;
      setOpen(false);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      userClosedPanel = true;
      setOpen(false);
    }
  });

  heroMascot.addEventListener("click", () => {
    userClosedPanel = false;
    const target = document.getElementById("proyectos");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(true);
    applyState("projects");
    autoClosePanel();
  });

  heroMascot.addEventListener("mouseenter", () => {
    if (!userClosedPanel) {
      setOpen(true);
      applyState("hero");
      autoClosePanel(4200);
    }
  });

  pandaLinks.forEach((link) => {
    link.addEventListener("click", () => {
      userClosedPanel = false;
      const href = (link.getAttribute("href") || "").replace("#", "");

      if (href === "proyectos") applyState("projects");
      else if (href === "stack") applyState("stack");
      else if (href === "roadmap") applyState("roadmap");
      else applyState("default");
    });
  });

  projectCards.forEach((card) => {
    const title = card.querySelector("h3")?.textContent?.trim().toLowerCase();
    if (!title) return;

    const state = projectMessages.get(title);
    if (!state) return;

    card.addEventListener("mouseenter", () => {
      if (!userClosedPanel) {
        setOpen(true);
        applyState(state);
        autoClosePanel(4800);
      }
    });
  });

  const sectionStates = new Map([
    ["inicio", "hero"],
    ["sobre-mi", "about"],
    ["proyectos", "projects"],
    ["metodo", "method"],
    ["capacidades", "capabilities"],
    ["stack", "stack"],
    ["roadmap", "roadmap"],
    ["contacto", "contact"]
  ]);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      const key = sectionStates.get(visible.target.id);
      if (key) applyState(key);
    },
    { threshold: [0.28, 0.45, 0.7] }
  );

  sectionStates.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });

  window.addEventListener("load", () => {
    applyState("default");
    scheduleMove();

    setTimeout(() => {
      if (!sessionStorage.getItem("mm-panda-greeted")) {
        userClosedPanel = false;
        setOpen(true);
        applyState("welcome");
        sessionStorage.setItem("mm-panda-greeted", "1");

        autoClosePanel(5200);
      }
    }, 700);
  });
})();

(() => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");
  const links = Array.from(document.querySelectorAll(".nav-links a"));

  if (!nav) return;

  function closeMenu() {
    if (!toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      const nextOpen = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", nextOpen);
      toggle.setAttribute("aria-expanded", String(nextOpen));
    });
  }

  links.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!toggle || !nav.classList.contains("is-open")) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    if (!nav.contains(target) && !toggle.contains(target)) {
      closeMenu();
    }
  });

  const sections = links
    .map((link) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return null;

      const id = href.replace("#", "");
      const section = id ? document.getElementById(id) : null;
      return section ? { id, section, link } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      const active = sections.find((item) => item.section === visible.target);
      if (!active) return;

      sections.forEach((item) => {
        item.link.classList.toggle("is-active", item.id === active.id);
      });
    },
    {
      rootMargin: "-22% 0px -58% 0px",
      threshold: [0.15, 0.35, 0.6]
    }
  );

  sections.forEach((item) => observer.observe(item.section));
})();
