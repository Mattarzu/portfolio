const mmLabPrefersReducedMotion = () =>
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const mmLabTranslate = (key) => {
  const api = window.MMLAB_I18N;
  if (api && typeof api.translate === "function") {
    const value = api.translate(key);
    if (value && value !== key) return value;
  }

  return key;
};

(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.querySelector(".panda-toggle");
  const panel = document.getElementById("panda-panel");
  const closeBtn = document.querySelector(".panda-close");
  const pauseBtn = document.querySelector(".panda-pause");
  const hideBtn = document.querySelector(".panda-hide");
  const message = document.getElementById("panda-message");
  const hint = document.getElementById("panda-hint");
  const mode = document.getElementById("panda-mode");
  const heroMascot = document.querySelector(".hero-mascot");
  const pandaLinks = document.querySelectorAll(".panda-actions a");
  const projectCards = document.querySelectorAll(".project-card");

  if (!toggle || !panel || !message || !heroMascot) return;

  const t = mmLabTranslate;

  function updateToggleLabel() {
    toggle.setAttribute(
      "aria-label",
      panel.hidden ? t("panda.toggleOpenAria") : t("panda.toggleCloseAria")
    );
  }

  function updatePauseLabel() {
    if (pauseBtn) pauseBtn.textContent = pandaPaused ? t("panda.resume") : t("panda.pause");
  }

  heroMascot.hidden = false;
  toggle.hidden = false;
  heroMascot.removeAttribute("hidden");
  toggle.removeAttribute("hidden");
  sessionStorage.removeItem("mm-panda-hidden");

  const states = {
    welcome: {
      modeKey: "panda.state.welcome.mode",
      mood: "welcome",
      section: "inicio",
      textKey: "panda.state.welcome.text",
      hintKey: "panda.state.welcome.hint"
    },
    default: {
      modeKey: "panda.state.default.mode",
      mood: "idle",
      section: "inicio",
      textKey: "panda.state.default.text",
      hintKey: "panda.state.default.hint"
    },
    hero: {
      modeKey: "panda.state.hero.mode",
      mood: "hero",
      section: "inicio",
      textKey: "panda.state.hero.text",
      hintKey: "panda.state.hero.hint"
    },
    about: {
      modeKey: "panda.state.about.mode",
      mood: "focus",
      section: "sobre-mi",
      textKey: "panda.state.about.text",
      hintKey: "panda.state.about.hint"
    },
    projects: {
      modeKey: "panda.state.projects.mode",
      mood: "build",
      section: "proyectos",
      textKey: "panda.state.projects.text",
      hintKey: "panda.state.projects.hint"
    },
    method: {
      modeKey: "panda.state.method.mode",
      mood: "focus",
      section: "metodo",
      textKey: "panda.state.method.text",
      hintKey: "panda.state.method.hint"
    },
    capabilities: {
      modeKey: "panda.state.capabilities.mode",
      mood: "stack",
      section: "capacidades",
      textKey: "panda.state.capabilities.text",
      hintKey: "panda.state.capabilities.hint"
    },
    stack: {
      modeKey: "panda.state.stack.mode",
      mood: "stack",
      section: "stack",
      textKey: "panda.state.stack.text",
      hintKey: "panda.state.stack.hint"
    },
    roadmap: {
      modeKey: "panda.state.roadmap.mode",
      mood: "roadmap",
      section: "roadmap",
      textKey: "panda.state.roadmap.text",
      hintKey: "panda.state.roadmap.hint"
    },
    contact: {
      modeKey: "panda.state.contact.mode",
      mood: "github",
      section: "contacto",
      textKey: "panda.state.contact.text",
      hintKey: "panda.state.contact.hint"
    }
  };

  const projectMessages = new Map([
    [
      "router",
      {
        modeKey: "panda.project.router.mode",
        mood: "build",
        section: "proyectos",
        textKey: "panda.project.router.text",
        hintKey: "panda.project.router.hint"
      }
    ],
    [
      "code",
      {
        modeKey: "panda.project.code.mode",
        mood: "focus",
        section: "proyectos",
        textKey: "panda.project.code.text",
        hintKey: "panda.project.code.hint"
      }
    ],
    [
      "environments",
      {
        modeKey: "panda.project.environments.mode",
        mood: "stack",
        section: "proyectos",
        textKey: "panda.project.environments.text",
        hintKey: "panda.project.environments.hint"
      }
    ],
    [
      "gymcontrol",
      {
        modeKey: "panda.project.gymcontrol.mode",
        mood: "build",
        section: "proyectos",
        textKey: "panda.project.gymcontrol.text",
        hintKey: "panda.project.gymcontrol.hint"
      }
    ],
    [
      "hardening",
      {
        modeKey: "panda.project.hardening.mode",
        mood: "roadmap",
        section: "proyectos",
        textKey: "panda.project.hardening.text",
        hintKey: "panda.project.hardening.hint"
      }
    ],
    [
      "translator",
      {
        modeKey: "panda.project.translator.mode",
        mood: "github",
        section: "proyectos",
        textKey: "panda.project.translator.text",
        hintKey: "panda.project.translator.hint"
      }
    ]
  ]);
  let currentState = states.default;
  let userClosedPanel = false;
  let pandaPaused = sessionStorage.getItem("mm-panda-paused") === "1";
  let pandaHidden = false;
  sessionStorage.removeItem("mm-panda-hidden");
  let animationFrame = null;
  let autoCloseTimer = null;

  function autoClosePanel(delay = 5200) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(() => {
      setOpen(false);
    }, delay);
  }

  function isSmallScreen() {
    return window.innerWidth <= 760;
  }

  function setOpen(open) {
    if (pandaHidden) open = false;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    updateToggleLabel();
  }

  function applyState(state) {
    const next = typeof state === "string" ? states[state] : state;
    if (!next) return;

    currentState = next;

    if (mode) mode.textContent = t(next.modeKey);
    if (message) message.textContent = t(next.textKey);
    if (hint) hint.textContent = t(next.hintKey);

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

    if (isSmall || pandaPaused) {
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

    if (pandaHidden) {
      pandaHidden = false;
      sessionStorage.removeItem("mm-panda-hidden");
    }

    heroMascot.hidden = false;
    toggle.hidden = false;

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

  
  function setPaused(nextPaused) {
    pandaPaused = nextPaused;
    sessionStorage.setItem("mm-panda-paused", nextPaused ? "1" : "0");

    updatePauseLabel();

    applyState({
      modeKey: nextPaused ? "panda.state.paused.mode" : "panda.state.resumed.mode",
      mood: "idle",
      section: currentState.section || "inicio",
      textKey: nextPaused ? "panda.state.paused.text" : "panda.state.resumed.text",
      hintKey: nextPaused ? "panda.state.paused.hint" : "panda.state.resumed.hint"
    });

    setOpen(true);
    autoClosePanel(4200);
    scheduleMove();
  }

  function hidePandaForSession() {
    userClosedPanel = true;
    setOpen(false);
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

  if (pauseBtn) {
    pauseBtn.textContent = pandaPaused ? "Reanudar" : "Pausar";
    pauseBtn.addEventListener("click", () => {
      setPaused(!pandaPaused);
    });
  }

  if (hideBtn) {
    hideBtn.addEventListener("click", hidePandaForSession);
  }

  window.addEventListener("mmlab:languagechange", () => {
    updateToggleLabel();
    updatePauseLabel();
    applyState(currentState);
  });

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
    const projectKey = card.dataset.pandaProject || "";
    if (!projectKey) return;

    const state = projectMessages.get(projectKey);
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

    if (pandaHidden) {
      scheduleMove();
      return;
    }

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

(() => {
  const t = mmLabTranslate;
  const openBtn = document.querySelector(".panda-contact-open");
  const form = document.querySelector(".panda-contact-form");
  const panel = document.getElementById("panda-panel");
  const message = document.getElementById("panda-message");
  const mode = document.getElementById("panda-mode");
  const hint = document.getElementById("panda-hint");
  const toggle = document.querySelector(".panda-toggle");
  const submitBtn = document.querySelector(".panda-contact-submit");
  const aiForm = document.querySelector(".panda-ai-form");

  const localContactEndpoint = "http://127.0.0.1:8000/contact";
  const isLocalHost = ["127.0.0.1", "localhost"].includes(window.location.hostname);
  const contactEndpoint =
    window.CHAT_ENDPOINT ||
    window.MMLAB_CONTACT_ENDPOINT ||
    (isLocalHost ? localContactEndpoint : "");

  if (!openBtn || !form || !panel || !message) return;

  function openPandaPanel() {
    panel.hidden = false;
    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Cerrar asistente Panda");
    }
  }

  function setPandaMessage(nextModeKey, nextMessageKey, nextHintKey) {
    if (mode) mode.textContent = t(nextModeKey);
    message.textContent = t(nextMessageKey);
    if (hint) hint.textContent = t(nextHintKey);
  }

  function buildMessage(data) {
    return [
      "Nuevo mensaje desde M M LAB",
      "",
      `Nombre: ${data.name}`,
      `Contacto: ${data.contact}`,
      "",
      "Mensaje:",
      data.message,
      "",
      `Página: ${location.href}`,
      `Fecha: ${new Date().toISOString()}`
    ].join("\n");
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? t("panda.submitSending") : t("panda.formSubmit");
  }

  async function sendContact(payload) {
    if (!contactEndpoint) {
      return { ok: false, reason: "missing-endpoint" };
    }

    try {
      const response = await fetch(contactEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        return { ok: false, reason: `http-${response.status}` };
      }

      const data = await response.json().catch(() => null);
      if (!data || data.ok !== true) {
        return { ok: false, reason: "invalid-response" };
      }

      return { ok: true };
    } catch {
      return { ok: false, reason: "network-error" };
    }
  }

  async function fallbackToClipboard(payload) {
    const prepared = buildMessage(payload);
    const copied = await copyToClipboard(prepared);

    if (copied) {
      setPandaMessage(
        "panda.form.preparedMode",
        "panda.form.noEndpointCopied",
        "panda.form.noEndpointCopiedHint"
      );
      form.reset();
      form.hidden = true;
      return;
    }

    setPandaMessage(
      "panda.form.preparedMode",
      "panda.form.clipboardBlocked",
      "panda.form.clipboardBlockedHint"
    );
  }

  openBtn.addEventListener("click", () => {
    openPandaPanel();
    form.hidden = false;

    setPandaMessage(
      "panda.form.contactMode",
      "panda.form.openMessage",
      contactEndpoint
        ? "panda.form.openBackendHint"
        : "panda.form.openFallbackHint"
    );

    form.scrollIntoView({ behavior: mmLabPrefersReducedMotion() ? "auto" : "smooth", block: "nearest" });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      contact: String(formData.get("contact") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      page: window.location.href,
      createdAt: new Date().toISOString(),
      website: String(formData.get("website") || "").trim()
    };

    if (!payload.name || !payload.contact || !payload.message) {
      setPandaMessage(
        "panda.form.contactMode",
        "panda.form.validationMessage",
        "panda.form.validationHint"
      );
      return;
    }

    setSubmitting(true);
    setPandaMessage(
      "panda.form.sendingMode",
      "panda.form.sendingMessage",
      "panda.form.sendingHint"
    );

    const result = await sendContact(payload);
    setSubmitting(false);

    if (result.ok) {
      setPandaMessage(
        "panda.form.successMode",
        "panda.form.successMessage",
        "panda.form.successHint"
      );
      form.reset();
      form.hidden = true;
      return;
    }

    if (result.reason === "missing-endpoint") {
      await fallbackToClipboard(payload);
      return;
    }

    setPandaMessage(
      "panda.form.failureMode",
      "panda.form.failureMessage",
      "panda.form.failureHint"
    );
  });
})();

/* panda-ai-chat-controller */
(() => {
  const openBtn = document.querySelector(".panda-ai-open");
  const form = document.querySelector(".panda-ai-form");
  const contactForm = document.querySelector(".panda-contact-form");
  const panel = document.getElementById("panda-panel");
  const message = document.getElementById("panda-message");
  const mode = document.getElementById("panda-mode");
  const hint = document.getElementById("panda-hint");
  const toggle = document.querySelector(".panda-toggle");
  const submitBtn = document.querySelector(".panda-ai-submit");
  const textarea = document.getElementById("panda-ai-message");

  const localAiEndpoint = "http://127.0.0.1:8787/ai-chat";
  const isLocalHost = ["127.0.0.1", "localhost"].includes(window.location.hostname);
  const aiEndpoint = isLocalHost
    ? localAiEndpoint
    : window.MMLAB_AI_CHAT_ENDPOINT || "";

  if (!openBtn || !form || !panel || !message || !textarea) return;

  function openPandaPanel() {
    panel.hidden = false;
    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Cerrar asistente Panda");
    }
  }

  function setRawPandaMessage(nextMode, nextMessage, nextHint) {
    if (mode) mode.textContent = nextMode;
    message.textContent = nextMessage;
    if (hint) hint.textContent = nextHint;
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? "Pensando..." : "Preguntar";
  }

  async function sendAiMessage(payload) {
    if (!aiEndpoint) {
      return { ok: false, reason: "missing-endpoint" };
    }

    try {
      const response = await fetch(aiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return { ok: false, reason: data?.detail || `http-${response.status}` };
      }

      if (!data || data.ok !== true || typeof data.reply !== "string") {
        return { ok: false, reason: "invalid-response" };
      }

      return { ok: true, reply: data.reply };
    } catch {
      return { ok: false, reason: "network-error" };
    }
  }

  openBtn.addEventListener("click", () => {
    openPandaPanel();
    if (contactForm) contactForm.hidden = true;
    form.hidden = false;

    setRawPandaMessage(
      "Panda IA",
      "Preguntame sobre desarrollo web, automatización, backend, IA aplicada o cómo trabajar con Matt.",
      aiEndpoint
        ? "La consulta pasa por el Worker, sin exponer credenciales en el navegador."
        : "Falta configurar el endpoint de IA."
    );

    form.scrollIntoView({ behavior: mmLabPrefersReducedMotion() ? "auto" : "smooth", block: "nearest" });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      message: String(formData.get("message") || "").trim(),
      page: window.location.href,
      locale: document.documentElement.lang || navigator.language || "es",
      website: String(formData.get("website") || "").trim()
    };

    if (!payload.message) {
      setRawPandaMessage(
        "Panda IA",
        "Escribí una pregunta para poder responder.",
        "Ejemplo: necesito una web para mi negocio, ¿por dónde empiezo?"
      );
      return;
    }

    setSubmitting(true);
    setRawPandaMessage(
      "Panda IA",
      "Estoy analizando tu consulta.",
      "Si querés contacto directo, usá Hablar con Matt."
    );

    const result = await sendAiMessage(payload);
    setSubmitting(false);

    if (result.ok) {
      setRawPandaMessage(
        "Panda IA",
        result.reply,
        "Para avanzar con una consulta real, usá Hablar con Matt y dejá tus datos."
      );
      textarea.value = "";
      return;
    }

    setRawPandaMessage(
      "Panda IA no disponible",
      "No pude responder con IA en este momento.",
      "El formulario Hablar con Matt sigue disponible."
    );
  });
})();
