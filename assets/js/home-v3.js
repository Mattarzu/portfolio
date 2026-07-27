(() => {
  const root = document.documentElement;
  const languageKey = "allfiction_language";
  const languageButtons = Array.from(document.querySelectorAll("[data-language]"));
  const pageTitle = {
    "es-AR": root.dataset.titleEs,
    "en-GB": root.dataset.titleEn,
  };
  const pageDescription = {
    "es-AR": root.dataset.descriptionEs,
    "en-GB": root.dataset.descriptionEn,
  };

  function normalizeLanguage(value) {
    return String(value || "").toLowerCase().startsWith("en") ? "en-GB" : "es-AR";
  }

  function currentLanguage() {
    return normalizeLanguage(root.lang);
  }

  function setMeta(selector, value) {
    const node = document.querySelector(selector);
    if (node && value) node.setAttribute("content", value);
  }

  function syncAccessibleLanguage(language) {
    const english = language === "en-GB";
    const navToggleNode = document.querySelector("[data-nav-toggle]");
    const navOpen = navToggleNode?.getAttribute("aria-expanded") === "true";
    const localizedAttributes = [
      [".brand", "aria-label", "ALLFICTION Software — inicio", "ALLFICTION Software — home"],
      ["[data-nav]", "aria-label", "Navegación principal", "Main navigation"],
      [".language-switch", "aria-label", "Idioma", "Language"],
      ["[data-nav-toggle]", "aria-label", navOpen ? "Cerrar navegación" : "Abrir navegación", navOpen ? "Close navigation" : "Open navigation"],
      [".hero-stage", "aria-label", "Sistema visual de ALLFICTION", "ALLFICTION visual system"],
      [".risk-console", "aria-label", "Vista conceptual del motor de riesgo", "Conceptual risk-engine view"],
      [".product-preview", "aria-label", "Vistas de Qivox Gym", "Qivox Gym product views"],
      [".router-console", "aria-label", "Consola conceptual de PolyLLM Router", "Conceptual PolyLLM Router console"],
      [".evidence-panel", "aria-label", "Evidencia de entrega", "Delivery evidence"],
      [".contact-links", "aria-label", "Perfiles profesionales", "Professional profiles"],
      [".site-footer nav", "aria-label", "Enlaces externos", "External links"],
      ["[data-ai-launcher]", "aria-label", "Abrir AF Intelligence", "Open AF Intelligence"],
      ["[data-ai-panel]", "aria-label", "AF Intelligence", "AF Intelligence"],
      ["[data-ai-close]", "aria-label", "Cerrar AF Intelligence", "Close AF Intelligence"],
      ["[data-ai-submit]", "aria-label", "Enviar pregunta", "Send question"],
    ];

    localizedAttributes.forEach(([selector, attribute, es, en]) => {
      document.querySelectorAll(selector).forEach((node) => {
        node.setAttribute(attribute, english ? en : es);
      });
    });

    document.querySelectorAll("[data-placeholder-es][data-placeholder-en]").forEach((node) => {
      node.setAttribute(
        "placeholder",
        english ? node.dataset.placeholderEn : node.dataset.placeholderEs,
      );
    });
  }

  function setLanguage(value, syncUrl = true) {
    const language = normalizeLanguage(value);
    root.lang = language;

    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });

    if (pageTitle[language]) {
      document.title = pageTitle[language];
      setMeta("meta[property='og:title']", pageTitle[language]);
      setMeta("meta[name='twitter:title']", pageTitle[language]);
    }

    if (pageDescription[language]) {
      setMeta("meta[name='description']", pageDescription[language]);
      setMeta("meta[property='og:description']", pageDescription[language]);
      setMeta("meta[name='twitter:description']", pageDescription[language]);
    }

    localStorage.setItem(languageKey, language);

    if (syncUrl) {
      const url = new URL(window.location.href);
      if (language === "es-AR") url.searchParams.delete("lang");
      else url.searchParams.set("lang", "en");
      window.history.replaceState({}, "", url);
    }

    syncAccessibleLanguage(language);
    document.dispatchEvent(new CustomEvent("allfiction:language", { detail: { language } }));
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });

  const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
  const savedLanguage = localStorage.getItem(languageKey);
  setLanguage(requestedLanguage || savedLanguage || navigator.language, false);

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const header = document.querySelector("[data-header]");
  const syncHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 18);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  function closeNav() {
    if (!navToggle || !nav) return;
    navToggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    syncAccessibleLanguage(currentLanguage());
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      navToggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      syncAccessibleLanguage(currentLanguage());
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (!(event.target instanceof Node)) return;
      if (!nav.contains(event.target) && !navToggle.contains(event.target)) closeNav();
    });
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealNodes = Array.from(document.querySelectorAll(".reveal"));

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.08 },
    );
    revealNodes.forEach((node) => revealObserver.observe(node));
    window.setTimeout(() => {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
      revealObserver.disconnect();
    }, 900);
  }

  const navLinks = Array.from(document.querySelectorAll("[data-nav] a[href^='#']"));
  const observedSections = navLinks
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      const section = id ? document.getElementById(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && observedSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        observedSections.forEach((item) => {
          item.link.classList.toggle("is-active", item.section === visible.target);
        });
      },
      { rootMargin: "-24% 0px -62% 0px", threshold: [0.08, 0.3, 0.6] },
    );
    observedSections.forEach((item) => sectionObserver.observe(item.section));
  }

  const aiPanel = document.querySelector("[data-ai-panel]");
  const aiBackdrop = document.querySelector("[data-ai-backdrop]");
  const aiLauncher = document.querySelector("[data-ai-launcher]");
  const aiOpenButtons = Array.from(document.querySelectorAll("[data-ai-open]"));
  const aiClose = document.querySelector("[data-ai-close]");
  const aiClear = document.querySelector("[data-ai-clear]");
  const aiMessages = document.querySelector("[data-ai-messages]");
  const aiForm = document.querySelector("[data-ai-form]");
  const aiInput = document.querySelector("[data-ai-input]");
  const aiSubmit = document.querySelector("[data-ai-submit]");
  const aiModeLabel = document.querySelector("[data-ai-mode-label]");
  const questionButtons = Array.from(document.querySelectorAll("[data-ai-question]"));
  const configuredAiEndpoint = String(window.ALLFICTION_AI_ENDPOINT || "/api/ai").trim();
  const generativeAiEnabled = window.ALLFICTION_AI_ENABLED !== false;

  if (
    !aiPanel ||
    !aiBackdrop ||
    !aiLauncher ||
    !aiMessages ||
    !aiForm ||
    !aiInput ||
    !aiSubmit
  ) {
    return;
  }

  const conversation = [];
  let busy = false;
  let welcomedLanguage = null;

  function localized(es, en) {
    return currentLanguage() === "en-GB" ? en : es;
  }

  function welcomeCopy() {
    return localized(
      "Hola. Soy AF Intelligence. Conozco los proyectos públicos de ALLFICTION y puedo explicarte arquitectura, experiencia, decisiones técnicas o qué solución encaja con tu problema.",
      "Hi. I’m AF Intelligence. I know ALLFICTION’s public projects and can explain architecture, experience, engineering decisions or which solution fits your problem.",
    );
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s/$.-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const guidedTopics = [
    {
      keywords: [
        "backend",
        "api",
        "python",
        "fastapi",
        "redis",
        "postgresql",
        "idempotencia",
        "idempotency",
        "arquitectura",
        "architecture",
      ],
      es:
        "El caso más fuerte para backend es Crypto Risk Engine. Combina FastAPI, PostgreSQL y Redis Streams con procesamiento determinístico, recuperación de mensajes pendientes, liquidaciones idempotentes y un ledger auditable. Qivox agrega otra evidencia: Node/Express, Prisma, datos persistentes y operaciones en tiempo real.",
      en:
        "The strongest backend case is Crypto Risk Engine. It combines FastAPI, PostgreSQL and Redis Streams with deterministic processing, pending-message recovery, idempotent liquidations and an auditable ledger. Qivox adds further evidence through Node/Express, Prisma, persistent data and real-time operations.",
      cta: { es: "Ver Crypto Risk Engine", en: "View Crypto Risk Engine", href: "./projects/crypto-risk-engine.html" },
    },
    {
      keywords: [
        "ia",
        "ai",
        "llm",
        "modelo",
        "model",
        "qwen",
        "agente",
        "agent",
        "rag",
        "ocr",
        "inteligencia artificial",
      ],
      es:
        "ALLFICTION trabaja la IA como sistema, no como una llamada aislada. PolyLLM Router prioriza modelos locales y habilita cloud solo cuando hace falta, con rutas explícitas, presupuesto y trazabilidad. También hay experiencia en OCR, asistentes, entrenamiento LoRA y automatización con agentes.",
      en:
        "ALLFICTION treats AI as a system rather than an isolated API call. PolyLLM Router prioritises local models and enables cloud only when needed, with explicit routes, budget controls and traceability. The portfolio also covers OCR, assistants, LoRA training and agent automation.",
      cta: { es: "Ver PolyLLM Router", en: "View PolyLLM Router", href: "./projects/router-llm.html" },
    },
    {
      keywords: [
        "produccion",
        "production",
        "aws",
        "deploy",
        "desplegado",
        "publico",
        "public",
        "online",
        "cloud",
        "infraestructura",
      ],
      es:
        "Hoy hay evidencia pública de tres sistemas operados en AWS: el portfolio, Qivox Gym y Crypto Risk Engine. El despliegue usa HTTPS, reverse proxy, contenedores y CI/CD; Crypto Risk además expone healthchecks live/ready y mantiene sus servicios de datos dentro de redes internas.",
      en:
        "There is public evidence of three systems operated on AWS: this portfolio, Qivox Gym and Crypto Risk Engine. Deployment uses HTTPS, a reverse proxy, containers and CI/CD; Crypto Risk also exposes live/ready health checks and keeps data services inside private networks.",
      cta: { es: "Comprobar healthcheck", en: "Check health status", href: "https://crypto-risk.56-126-148-93.sslip.io/health/ready" },
    },
    {
      keywords: [
        "crypto",
        "risk",
        "riesgo",
        "defi",
        "liquidacion",
        "liquidation",
        "oracle",
        "btc",
        "eth",
      ],
      es:
        "Crypto Risk Engine monitorea posiciones colateralizadas con precios de mercado, calcula seguridad con Decimal, coordina liquidaciones y conserva decisiones auditables. Sus pruebas cubren concurrencia, idempotencia, recuperación PEL, flash crash y oráculo obsoleto.",
      en:
        "Crypto Risk Engine monitors collateralised positions with market prices, computes safety with Decimal, coordinates liquidations and keeps decisions auditable. Its tests cover concurrency, idempotency, PEL recovery, flash crashes and stale-oracle scenarios.",
      cta: { es: "Abrir caso técnico", en: "Open technical case", href: "./projects/crypto-risk-engine.html" },
    },
    {
      keywords: [
        "qivox",
        "ergo",
        "gimnasio",
        "gym",
        "club",
        "multi sede",
        "multisite",
        "membresia",
        "membership",
      ],
      es:
        "Qivox Gym / ERGO V2 es un producto full stack multi-sede para clubes y gimnasios. Integra experiencia pública, administración, membresías, PostgreSQL, Prisma y eventos en tiempo real con Socket.IO. Hay una demo pública desplegada en AWS.",
      en:
        "Qivox Gym / ERGO V2 is a multi-site full-stack product for clubs and gyms. It integrates a public experience, administration, memberships, PostgreSQL, Prisma and real-time events with Socket.IO. A public demo is deployed on AWS.",
      cta: { es: "Abrir demo de Qivox", en: "Open Qivox demo", href: "https://ergo.56-126-148-93.sslip.io" },
    },
    {
      keywords: [
        "proceso",
        "process",
        "metodo",
        "method",
        "trabaja",
        "work",
        "calidad",
        "quality",
        "test",
        "validacion",
        "validation",
      ],
      es:
        "El método parte del estado real: problema, usuario, restricciones y línea base. Después define contratos, arquitectura, riesgos y criterios de aceptación; construye en cortes verificables y cierra con tests, despliegue, healthchecks, observabilidad y rollback.",
      en:
        "The method starts from the real state: problem, user, constraints and baseline. It then defines contracts, architecture, risks and acceptance criteria; builds in verifiable slices and closes with tests, deployment, health checks, observability and rollback.",
      cta: { es: "Ver método de trabajo", en: "View working method", href: "#metodo" },
    },
    {
      keywords: [
        "automatizar",
        "automation",
        "automatic",
        "manual",
        "idea",
        "negocio",
        "business",
        "necesito",
        "problema",
        "solution",
        "solucion",
        "contratar",
        "hire",
      ],
      es:
        "Matt puede ayudarte a convertir un proceso manual o una idea ambigua en un sistema verificable. El primer paso sería identificar usuario, frecuencia, datos, integraciones, riesgo y una entrega mínima demostrable. Si compartís el contexto por email o LinkedIn, puede evaluarlo sin venderte una arquitectura antes de entender el problema.",
      en:
        "Matt can help turn a manual process or ambiguous idea into a verifiable system. The first step is identifying the user, frequency, data, integrations, risk and a minimum demonstrable delivery. Share the context by email or LinkedIn so it can be evaluated before prescribing an architecture.",
      cta: { es: "Contactar a Matt", en: "Contact Matt", href: "mailto:matiasezequielarzu@gmail.com" },
    },
  ];

  function guidedAnswer(message) {
    const normalized = normalizeText(message);
    let best = null;
    let bestScore = 0;

    guidedTopics.forEach((topic) => {
      const score = topic.keywords.reduce(
        (total, keyword) => total + (normalized.includes(normalizeText(keyword)) ? 1 : 0),
        0,
      );
      if (score > bestScore) {
        best = topic;
        bestScore = score;
      }
    });

    if (!best) {
      return {
        reply: localized(
          "Puedo responder sobre Crypto Risk Engine, Qivox/ERGO, PolyLLM Router, backend, IA aplicada, infraestructura, seguridad o la forma de trabajo. Probá preguntarme qué proyecto demuestra mejor una capacidad concreta.",
          "I can answer questions about Crypto Risk Engine, Qivox/ERGO, PolyLLM Router, backend, applied AI, infrastructure, security or the working method. Try asking which project best demonstrates a specific capability.",
        ),
        cta: { label: localized("Ver proyectos", "View projects"), href: "#trabajo" },
      };
    }

    return {
      reply: currentLanguage() === "en-GB" ? best.en : best.es,
      cta: {
        label: currentLanguage() === "en-GB" ? best.cta.en : best.cta.es,
        href: best.cta.href,
      },
    };
  }

  function safeHref(value) {
    if (!value) return null;
    if (value.startsWith("#") || value.startsWith("./") || value.startsWith("/")) return value;
    try {
      const url = new URL(value);
      if (["https:", "mailto:"].includes(url.protocol)) return value;
    } catch {
      return null;
    }
    return null;
  }

  function providerLabel(value) {
    if (value === "gemini") return "Gemini";
    if (value === "openai") return "OpenAI";
    return "AI";
  }

  function addMessage(role, text, options = {}) {
    const item = document.createElement("article");
    item.className = `ai-message ${role}`;
    if (options.thinking) item.classList.add("is-thinking");

    const label = document.createElement("small");
    label.textContent =
      role === "user"
        ? localized("Vos", "You")
        : options.mode === "ai"
          ? `AF Intelligence · ${providerLabel(options.provider)}`
          : "AF Intelligence";

    const bubble = document.createElement("div");
    bubble.className = "ai-bubble";

    if (options.thinking) {
      bubble.setAttribute("aria-label", localized("Pensando", "Thinking"));
      bubble.innerHTML = "<i></i><i></i><i></i>";
    } else {
      bubble.textContent = text;
    }

    item.append(label, bubble);

    const href = safeHref(options.cta?.href);
    if (href && options.cta?.label) {
      const link = document.createElement("a");
      link.className = "ai-message-link";
      link.href = href;
      link.textContent = `${options.cta.label} ↗`;
      if (href.startsWith("https://")) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      item.appendChild(link);
    }

    const sources = Array.isArray(options.sources) ? options.sources.slice(0, 3) : [];
    if (sources.length) {
      const sourceList = document.createElement("div");
      sourceList.className = "ai-message-sources";
      const sourceLabel = document.createElement("small");
      sourceLabel.textContent = localized("Evidencia", "Evidence");
      sourceList.appendChild(sourceLabel);

      sources.forEach((source, index) => {
        const sourceHref = safeHref(source?.href);
        if (!sourceHref || !source?.label) return;
        const link = document.createElement("a");
        link.href = sourceHref;
        link.textContent = `[${index + 1}] ${source.label}`;
        if (sourceHref.startsWith("https://")) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        sourceList.appendChild(link);
      });

      if (sourceList.childElementCount > 1) item.appendChild(sourceList);
    }

    aiMessages.appendChild(item);
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return item;
  }

  function addWelcome(force = false) {
    const language = currentLanguage();
    if (!force && welcomedLanguage === language && aiMessages.childElementCount) return;
    aiMessages.textContent = "";
    conversation.length = 0;
    addMessage("assistant", welcomeCopy(), {
      cta: { label: localized("Ver casos destacados", "View featured cases"), href: "#trabajo" },
    });
    welcomedLanguage = language;
  }

  function openAI() {
    closeNav();
    document.body.classList.add("ai-open");
    aiPanel.inert = false;
    aiPanel.classList.add("is-open");
    aiBackdrop.classList.add("is-visible");
    aiPanel.setAttribute("aria-hidden", "false");
    aiLauncher.setAttribute("aria-expanded", "true");
    addWelcome();
    window.setTimeout(() => aiInput.focus({ preventScroll: true }), 80);
  }

  function closeAI() {
    document.body.classList.remove("ai-open");
    aiPanel.classList.remove("is-open");
    aiBackdrop.classList.remove("is-visible");
    aiPanel.setAttribute("aria-hidden", "true");
    aiPanel.inert = true;
    aiLauncher.setAttribute("aria-expanded", "false");
  }

  function setBusy(nextBusy) {
    busy = nextBusy;
    aiSubmit.disabled = nextBusy;
    aiInput.disabled = nextBusy;
  }

  function sessionId() {
    const key = "allfiction_ai_session";
    const saved = sessionStorage.getItem(key);
    if (saved) return saved;
    const value =
      globalThis.crypto?.randomUUID?.() ||
      `af-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(key, value);
    return value;
  }

  async function askAI(rawQuestion) {
    const question = String(rawQuestion || "").trim();
    if (!question || busy) return;

    openAI();
    addMessage("user", question);
    conversation.push({ role: "user", content: question });
    aiInput.value = "";
    aiInput.style.height = "";
    setBusy(true);
    const thinking = addMessage("assistant", "", { thinking: true });

    let result = null;

    if (generativeAiEnabled && configuredAiEndpoint) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 14_000);

      try {
        const response = await fetch(configuredAiEndpoint, {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: question,
            locale: currentLanguage(),
            history: conversation.slice(-4),
            sessionId: sessionId(),
            website: "",
          }),
        });

        const payload = await response.json().catch(() => null);
        if (response.ok && payload && typeof payload.reply === "string") {
          result = {
            reply: payload.reply,
            mode: payload.mode === "ai" ? "ai" : "guided",
            provider:
              payload.provider === "gemini" || payload.provider === "openai"
                ? payload.provider
                : undefined,
            cta: payload.cta,
            sources: Array.isArray(payload.sources) ? payload.sources : [],
          };
        }
      } catch {
        result = null;
      } finally {
        window.clearTimeout(timeout);
      }
    }

    if (!result) {
      result = { ...guidedAnswer(question), mode: "guided" };
    }

    thinking.remove();
    setBusy(false);
    conversation.push({ role: "assistant", content: result.reply });
    addMessage("assistant", result.reply, {
      mode: result.mode,
      provider: result.provider,
      cta: result.cta,
      sources: result.sources,
    });

    aiModeLabel.textContent =
      result.mode === "ai"
        ? localized(
            `${providerLabel(result.provider)} · evidencia enlazada`,
            `${providerLabel(result.provider)} · linked evidence`,
          )
        : localized("Modo guiado · contexto verificado", "Guided mode · verified context");
    aiInput.focus({ preventScroll: true });
  }

  aiOpenButtons.forEach((button) => button.addEventListener("click", openAI));
  aiLauncher.addEventListener("click", () => {
    if (aiPanel.classList.contains("is-open")) closeAI();
    else openAI();
  });
  aiClose?.addEventListener("click", closeAI);
  aiBackdrop.addEventListener("click", closeAI);

  aiClear?.addEventListener("click", () => {
    addWelcome(true);
    aiModeLabel.textContent = localized(
      "Modo híbrido · Gemini + fallback",
      "Hybrid mode · Gemini + fallback",
    );
    aiInput.focus({ preventScroll: true });
  });

  questionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const question =
        currentLanguage() === "en-GB"
          ? button.textContent.trim()
          : button.dataset.aiQuestion || button.textContent.trim();
      askAI(question);
    });
  });

  aiForm.addEventListener("submit", (event) => {
    event.preventDefault();
    askAI(aiInput.value);
  });

  aiInput.addEventListener("input", () => {
    aiInput.style.height = "auto";
    aiInput.style.height = `${Math.min(aiInput.scrollHeight, 112)}px`;
  });

  aiInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    aiForm.requestSubmit();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
      closeAI();
    }
  });

  document.addEventListener("allfiction:language", () => {
    aiInput.placeholder = localized(
      "Preguntá por proyectos, arquitectura o experiencia…",
      "Ask about projects, architecture or experience…",
    );
    if (!conversation.length) {
      aiModeLabel.textContent = localized(
        "Modo híbrido · Gemini + fallback",
        "Hybrid mode · Gemini + fallback",
      );
    }
    if (!conversation.length && aiMessages.childElementCount) addWelcome(true);
  });

  aiInput.placeholder = localized(
    "Preguntá por proyectos, arquitectura o experiencia…",
    "Ask about projects, architecture or experience…",
  );
  aiModeLabel.textContent = localized(
    "Modo híbrido · Gemini + fallback",
    "Hybrid mode · Gemini + fallback",
  );
})();
