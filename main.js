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
      text: "Hola, soy M M Panda. Bienvenido a M M LAB.",
      hint: "Tip: recorré proyectos, stack y roadmap para entender rápido el perfil técnico."
    },
    default: {
      mode: "Modo guía",
      mood: "idle",
      text: "Estoy recorriendo M M LAB con vos.",
      hint: "Tip: podés seguirme mientras navego por distintas secciones."
    },
    hero: {
      mode: "Modo inicio",
      mood: "hero",
      text: "Esta portada resume software, automatización y herramientas técnicas.",
      hint: "Tip: el hero ahora usa todo el ancho porque quitamos el panel derecho fijo."
    },
    about: {
      mode: "Modo sobre mí",
      mood: "focus",
      text: "Esta sección explica tu enfoque técnico sin convertir la página en un CV tradicional.",
      hint: "Tip: conviene hablar de capacidades, no de infraestructura interna."
    },
    projects: {
      mode: "Modo proyectos",
      mood: "build",
      text: "Acá están las soluciones y proyectos técnicos principales.",
      hint: "Tip: los nombres públicos venden mejor que los nombres internos."
    },
    stack: {
      mode: "Modo stack",
      mood: "stack",
      text: "Esta parte resume las tecnologías y áreas principales.",
      hint: "Tip: mantené esta sección compacta y clara."
    },
    roadmap: {
      mode: "Modo roadmap",
      mood: "roadmap",
      text: "El roadmap muestra evolución y próximos pasos.",
      hint: "Tip: una hoja de ruta da sensación de proyecto vivo."
    },
    contact: {
      mode: "Modo GitHub",
      mood: "github",
      text: "GitHub es la base pública de tus proyectos.",
      hint: "Tip: siempre conviene acompañar con README claros."
    }
  };

  const projectMessages = new Map([
    [
      "router llm híbrido",
      {
        mode: "Proyecto IA",
        mood: "build",
        text: "Este proyecto coordina modelos, rutas híbridas y validación técnica.",
        hint: "Tip: describilo por función, no por nombre interno."
      }
    ],
    [
      "asistente local de código",
      {
        mode: "Proyecto código",
        mood: "focus",
        text: "Esta herramienta se enfoca en ayuda técnica, contexto y validación.",
        hint: "Tip: podés mostrar ejemplos de uso o capturas."
      }
    ],
    [
      "orquestador de entornos técnicos",
      {
        mode: "Proyecto entornos",
        mood: "stack",
        text: "Este proyecto organiza configuraciones, validaciones y automatización.",
        hint: "Tip: mantenelo abstracto y público, sin detalles internos."
      }
    ],
    [
      "gymcontrol",
      {
        mode: "Proyecto web",
        mood: "build",
        text: "GymControl representa una línea más de aplicación web operativa.",
        hint: "Tip: una demo o flujo visual lo haría más fuerte."
      }
    ],
    [
      "antivirus / hardening linux",
      {
        mode: "Proyecto seguridad",
        mood: "roadmap",
        text: "Este frente apunta a seguridad, hardening y auditoría básica.",
        hint: "Tip: separar módulos defensivos ayuda mucho."
      }
    ],
    [
      "traductor ia",
      {
        mode: "Proyecto IA aplicada",
        mood: "github",
        text: "Este proyecto puede convertirse en una utilidad muy clara para usuarios finales.",
        hint: "Tip: una mini demo español ↔ inglés técnico lo haría más tangible."
      }
    ]
  ]);

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  }

  function applyState(state) {
    const next = typeof state === "string" ? states[state] : state;
    if (!next) return;

    if (mode) mode.textContent = next.mode;
    if (message) message.textContent = next.text;
    if (hint) hint.textContent = next.hint;

    document.body.dataset.pandaMood = next.mood || "idle";
  }

  // === Movimiento del panda ===
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function movePanda() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const progress = scrollTop / maxScroll;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const pandaX = clamp(40 + (vw - 240) * (0.15 + 0.7 * Math.abs(Math.sin(progress * Math.PI * 1.35))), 24, vw - 200);
    const pandaY = clamp(110 + (vh - 300) * (0.1 + 0.75 * progress), 90, vh - 250);

    heroMascot.style.transform = `translate3d(${pandaX}px, ${pandaY}px, 0)`;

    const panelOffsetX = pandaX + 120;
    const panelOffsetY = pandaY + 40;

    const panelX = clamp(panelOffsetX, 16, vw - 340);
    const panelY = clamp(panelOffsetY, 16, vh - 260);

    panel.style.transform = `translate3d(${panelX}px, ${panelY}px, 0)`;

    const toggleX = clamp(pandaX + 112, 8, vw - 76);
    const toggleY = clamp(pandaY + 150, 8, vh - 76);

    toggle.style.transform = `translate3d(${toggleX}px, ${toggleY}px, 0)`;
    toggle.style.position = "fixed";
  }

  window.addEventListener("scroll", movePanda, { passive: true });
  window.addEventListener("resize", movePanda);

  toggle.addEventListener("click", () => {
    const open = panel.hidden;
    setOpen(open);
    if (open) applyState("default");
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      setOpen(false);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false);
    }
  });

  heroMascot.addEventListener("click", () => {
    const target = document.getElementById("proyectos");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(true);
    applyState("projects");
  });

  heroMascot.addEventListener("mouseenter", () => {
    setOpen(true);
    applyState("hero");
  });

  pandaLinks.forEach((link) => {
    link.addEventListener("click", () => {
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
      setOpen(true);
      applyState(state);
    });
  });

  const sectionStates = new Map([
    ["inicio", "hero"],
    ["sobre-mi", "about"],
    ["proyectos", "projects"],
    ["stack", "stack"],
    ["roadmap", "roadmap"],
    ["contacto", "contact"]
  ]);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible || panel.hidden) return;

      const key = sectionStates.get(visible.target.id);
      if (key) applyState(key);
    },
    { threshold: [0.25, 0.45, 0.7] }
  );

  sectionStates.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });

  window.addEventListener("load", () => {
    applyState("default");
    movePanda();

    setTimeout(() => {
      if (!sessionStorage.getItem("mm-panda-greeted")) {
        setOpen(true);
        applyState("welcome");
        sessionStorage.setItem("mm-panda-greeted", "1");

        setTimeout(() => {
          setOpen(false);
        }, 5000);
      }
    }, 700);
  });
})();
