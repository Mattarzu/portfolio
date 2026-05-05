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

  if (!toggle || !panel || !message) return;

  const states = {
    welcome: {
      mode: "Modo bienvenida",
      mood: "welcome",
      text: "Hola, soy M M Panda. Bienvenido a M M LAB. Te acompaño por los proyectos, el stack y el roadmap.",
      hint: "Tip: podés empezar por Proyectos para ver el laboratorio principal."
    },
    default: {
      mode: "Modo guía",
      mood: "idle",
      text: "Estoy acá para guiarte por M M LAB.",
      hint: "Tip: pasá el mouse por una tarjeta para ver contexto rápido."
    },
    hero: {
      mode: "Modo inicio",
      mood: "hero",
      text: "Este laboratorio reúne software, automatización, IA local y herramientas propias.",
      hint: "Tip: el objetivo es mostrar sistemas reales sin exponer infraestructura privada."
    },
    about: {
      mode: "Modo enfoque",
      mood: "focus",
      text: "Esta sección resume cómo construís: iteración, pruebas, documentación y Git.",
      hint: "Tip: esta parte le da identidad a la web sin convertirla en un CV clásico."
    },
    projects: {
      mode: "Modo proyectos",
      mood: "build",
      text: "Estos son los proyectos principales del laboratorio.",
      hint: "Tip: PolyLLM, Qwen y NeuroFleet forman el núcleo de IA y automatización."
    },
    stack: {
      mode: "Modo stack",
      mood: "stack",
      text: "Este bloque resume las tecnologías base del laboratorio.",
      hint: "Tip: mantené esta sección corta; sirve como lectura rápida para visitantes."
    },
    roadmap: {
      mode: "Modo roadmap",
      mood: "roadmap",
      text: "El roadmap ordena los próximos frentes de M M LAB.",
      hint: "Tip: un roadmap público ayuda a mostrar evolución y dirección técnica."
    },
    contact: {
      mode: "Modo repositorios",
      mood: "github",
      text: "GitHub es la base pública donde se organizan los proyectos.",
      hint: "Tip: los repos deberían mostrar README, validaciones y estado actual."
    }
  };

  const projectMessages = new Map([
    [
      "polyllm router",
      {
        mode: "Proyecto IA",
        mood: "build",
        text: "PolyLLM Router coordina modelos locales y externos con control de costo, planner y executor local.",
        hint: "Tip: agregale después una ficha técnica con arquitectura y flujo planner → executor."
      }
    ],
    [
      "qwen code core",
      {
        mode: "Proyecto Qwen",
        mood: "focus",
        text: "Qwen Code Core concentra el runtime local, chat de código, contexto de proyecto y validación.",
        hint: "Tip: conviene mostrar capturas o ejemplos de prompts de código."
      }
    ],
    [
      "neurofleet",
      {
        mode: "Proyecto infra",
        mood: "stack",
        text: "NeuroFleet organiza capacidades y flujos técnicos sin publicar datos sensibles de máquinas.",
        hint: "Tip: mantené la descripción pública abstracta, sin hostnames ni rutas internas."
      }
    ],
    [
      "gymcontrol",
      {
        mode: "Proyecto web",
        mood: "build",
        text: "GymControl muestra una app web con frontend, backend, persistencia y estados operativos.",
        hint: "Tip: este proyecto puede tener una demo visual o capturas del flujo."
      }
    ],
    [
      "antivirus / hardening linux",
      {
        mode: "Proyecto seguridad",
        mood: "roadmap",
        text: "El proyecto de antivirus/hardening apunta a auditoría local, escaneo y reportes de seguridad.",
        hint: "Tip: separá seguridad defensiva, hardening y monitoreo en módulos."
      }
    ],
    [
      "traductor ia",
      {
        mode: "Proyecto IA aplicada",
        mood: "github",
        text: "El Traductor IA puede servir para traducción técnica, documentación y adaptación de tono.",
        hint: "Tip: una demo con español ↔ inglés técnico puede hacerlo más claro."
      }
    ]
  ]);

  let userInteracted = false;
  let greetingShown = false;

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  }

  function applyState(state) {
    const next = typeof state === "string" ? states[state] : state;
    if (!next) return;

    message.textContent = next.text;

    if (mode) mode.textContent = next.mode;
    if (hint) hint.textContent = next.hint;

    document.body.dataset.pandaMood = next.mood || "idle";
  }

  toggle.addEventListener("click", () => {
    userInteracted = true;
    const open = panel.hidden;
    setOpen(open);
    if (open) applyState("default");
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      userInteracted = true;
      setOpen(false);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      userInteracted = true;
      setOpen(false);
    }
  });

  if (heroMascot) {
    heroMascot.addEventListener("click", () => {
      userInteracted = true;
      const target = document.getElementById("proyectos");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(true);
      applyState("projects");
    });

    heroMascot.addEventListener("mouseenter", () => {
      setOpen(true);
      applyState("hero");
    });
  }

  pandaLinks.forEach((link) => {
    link.addEventListener("click", () => {
      userInteracted = true;
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

    const projectState = projectMessages.get(title);
    if (!projectState) return;

    card.addEventListener("mouseenter", () => {
      setOpen(true);
      applyState(projectState);
    });
  });

  const sectionStates = new Map([
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

    if (greetingShown) return;

    setTimeout(() => {
      if (!sessionStorage.getItem("mm-panda-greeted")) {
        greetingShown = true;
        setOpen(true);
        applyState("welcome");
        sessionStorage.setItem("mm-panda-greeted", "1");

        setTimeout(() => {
          if (!userInteracted) setOpen(false);
        }, 6500);
      }
    }, 900);
  });
})();
