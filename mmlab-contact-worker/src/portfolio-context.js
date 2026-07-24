const SOURCES = [
  {
    id: "overview",
    title: "ALLFICTION Software",
    href: "https://allfiction.56-126-148-93.sslip.io/",
    keywords: [
      "allfiction",
      "matt",
      "matias",
      "perfil",
      "profile",
      "experiencia",
      "experience",
      "tecnologias",
      "technologies",
      "stack",
      "capacidades",
      "capabilities",
      "ingeniero",
      "engineer",
    ],
    es:
      "ALLFICTION Software es el estudio técnico de Matías Mercado. Diseña, construye y opera productos full stack, sistemas de IA e infraestructura, con foco en arquitectura, código, validación y operación real.",
    en:
      "ALLFICTION Software is Matías Mercado's engineering studio. It designs, builds and operates full-stack products, AI systems and infrastructure, focusing on architecture, code, validation and real operation.",
  },
  {
    id: "crypto-risk",
    title: "Crypto Risk Engine",
    href: "https://allfiction.56-126-148-93.sslip.io/projects/crypto-risk-engine.html",
    keywords: [
      "crypto",
      "risk",
      "riesgo",
      "defi",
      "fastapi",
      "redis",
      "streams",
      "postgresql",
      "idempotencia",
      "idempotency",
      "liquidacion",
      "liquidation",
      "oracle",
      "backend",
      "auditoria",
      "audit",
      "concurrencia",
      "concurrency",
    ],
    es:
      "Motor de riesgo en tiempo real para posiciones colateralizadas. Usa FastAPI, PostgreSQL y Redis Streams; realiza cálculos determinísticos con Decimal, liquidaciones idempotentes, recuperación PEL y auditoría mediante ledger. Sus pruebas cubren concurrencia, flash crash y oráculos obsoletos. Expone healthchecks live y ready en AWS.",
    en:
      "Real-time risk engine for collateralised positions. It uses FastAPI, PostgreSQL and Redis Streams, with deterministic Decimal calculations, idempotent liquidations, PEL recovery and ledger-based auditability. Tests cover concurrency, flash crashes and stale oracles. It exposes live and ready health checks on AWS.",
  },
  {
    id: "qivox",
    title: "Qivox Gym / ERGO V2",
    href: "https://allfiction.56-126-148-93.sslip.io/projects/ergo-v2.html",
    keywords: [
      "qivox",
      "ergo",
      "gym",
      "gimnasio",
      "club",
      "multi sede",
      "multisite",
      "membresia",
      "membership",
      "react",
      "node",
      "express",
      "prisma",
      "socket",
      "full stack",
      "fullstack",
    ],
    es:
      "Producto full stack multi-sede para clubes y gimnasios. Integra React, Node/Express, PostgreSQL, Prisma y Socket.IO para administración, membresías, persistencia y operaciones en tiempo real. Cuenta con una demo pública desplegada en AWS.",
    en:
      "Multi-site full-stack product for clubs and gyms. It combines React, Node/Express, PostgreSQL, Prisma and Socket.IO for administration, memberships, persistence and real-time operations. A public demo is deployed on AWS.",
  },
  {
    id: "polyllm",
    title: "PolyLLM Router",
    href: "https://allfiction.56-126-148-93.sslip.io/projects/router-llm.html",
    keywords: [
      "polyllm",
      "llm",
      "ia",
      "ai",
      "modelo",
      "model",
      "qwen",
      "deepseek",
      "kimi",
      "router",
      "routing",
      "local first",
      "privacidad",
      "privacy",
      "presupuesto",
      "budget",
      "agente",
      "agent",
      "lora",
      "ocr",
    ],
    es:
      "Orquestador local-first de modelos de lenguaje. Prioriza modelos locales y habilita proveedores cloud sólo cuando aportan valor, con rutas explícitas, control de presupuesto y trazabilidad. El trabajo relacionado incluye OCR, asistentes, entrenamiento LoRA y automatización con agentes.",
    en:
      "Local-first language-model orchestrator. It prioritises local models and enables cloud providers only when they add value, with explicit routes, budget control and traceability. Related work includes OCR, assistants, LoRA training and agent automation.",
  },
  {
    id: "production",
    title: "Infraestructura y producción",
    href: "https://allfiction.56-126-148-93.sslip.io/#capacidades",
    keywords: [
      "aws",
      "cloud",
      "linux",
      "produccion",
      "production",
      "deploy",
      "despliegue",
      "infraestructura",
      "infrastructure",
      "docker",
      "caddy",
      "https",
      "cicd",
      "ci cd",
      "github actions",
      "seguridad",
      "security",
      "healthcheck",
      "rollback",
    ],
    es:
      "ALLFICTION opera sistemas en AWS Lightsail con HTTPS, Caddy, contenedores y CI/CD. Mantiene servicios de datos en redes internas, usa healthchecks, validaciones posteriores al despliegue y rutas de rollback. El portfolio, Qivox y Crypto Risk ofrecen evidencia pública verificable.",
    en:
      "ALLFICTION operates systems on AWS Lightsail with HTTPS, Caddy, containers and CI/CD. Data services stay on internal networks, with health checks, post-deployment validation and rollback paths. The portfolio, Qivox and Crypto Risk provide verifiable public evidence.",
  },
  {
    id: "method",
    title: "Método de ingeniería",
    href: "https://allfiction.56-126-148-93.sslip.io/#metodo",
    keywords: [
      "proceso",
      "process",
      "metodo",
      "method",
      "trabajo",
      "work",
      "calidad",
      "quality",
      "test",
      "prueba",
      "validacion",
      "validation",
      "arquitectura",
      "architecture",
      "plan",
      "riesgos",
      "risks",
    ],
    es:
      "El método comienza por el problema, el usuario, las restricciones y una línea base reproducible. Luego define contratos, arquitectura, riesgos y criterios de aceptación; construye en cortes verificables y cierra con pruebas, despliegue, observabilidad y rollback.",
    en:
      "The method starts with the problem, user, constraints and a reproducible baseline. It then defines contracts, architecture, risks and acceptance criteria, builds in verifiable slices, and closes with tests, deployment, observability and rollback.",
  },
  {
    id: "contact",
    title: "Trabajar con Matt",
    href: "mailto:matiasezequielarzu@gmail.com",
    keywords: [
      "contratar",
      "hire",
      "contacto",
      "contact",
      "presupuesto",
      "quote",
      "proyecto",
      "project",
      "idea",
      "negocio",
      "business",
      "automatizar",
      "automate",
      "proceso manual",
      "manual process",
      "ayuda",
      "help",
    ],
    es:
      "Matt puede convertir un proceso manual o una idea ambigua en un sistema verificable. Para evaluar una necesidad hacen falta el objetivo, el usuario, la frecuencia, los datos, las integraciones, el riesgo y una entrega mínima demostrable. El contacto directo está disponible por email y LinkedIn.",
    en:
      "Matt can turn a manual process or ambiguous idea into a verifiable system. Evaluating a need starts with the goal, user, frequency, data, integrations, risk and a minimum demonstrable delivery. Direct contact is available by email and LinkedIn.",
  },
];

const INJECTION_PATTERNS = [
  /ignore (all|any|the|previous) instructions?/i,
  /ignora (todas?|las|cualquier|anteriores?) instrucciones?/i,
  /reveal (the )?(system|developer) prompt/i,
  /mostra(me)? (el )?(prompt|mensaje) (del )?(sistema|desarrollador)/i,
  /actua como si no tuvieras/i,
  /jailbreak/i,
];

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s/.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function queryTokens(value) {
  return new Set(
    normalize(value)
      .split(" ")
      .filter((token) => token.length >= 3),
  );
}

function sourceScore(source, normalizedQuery, tokens) {
  const keywordScore = source.keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalize(keyword);
    if (normalizedKeyword.includes(" ")) {
      return score + (normalizedQuery.includes(normalizedKeyword) ? 4 : 0);
    }
    return score + (tokens.has(normalizedKeyword) ? 4 : 0);
  }, 0);

  if (!keywordScore) return 0;
  return keywordScore + (source.id === "overview" ? 0 : 1);
}

export function looksLikePromptInjection(message) {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(String(message || "")));
}

export function retrievePortfolioContext(query, limit = 3) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const tokens = queryTokens(normalizedQuery);
  const ranked = SOURCES.map((source) => ({
    source,
    score: sourceScore(source, normalizedQuery, tokens),
  }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  const boundedLimit = Math.max(1, Math.min(limit, 3));
  const includesOverview = ranked
    .slice(0, boundedLimit)
    .some((item) => item.source.id === "overview");
  const projectSlots = includesOverview || boundedLimit === 1 ? boundedLimit : boundedLimit - 1;
  const selected = ranked.slice(0, projectSlots).map((item) => item.source);

  if (
    boundedLimit > 1 &&
    selected.length &&
    !selected.some((source) => source.id === "overview")
  ) {
    selected.push(SOURCES[0]);
  }

  return selected.slice(0, boundedLimit);
}

export function formatVerifiedContext(sources, locale) {
  const english = String(locale || "").toLowerCase().startsWith("en");
  return sources
    .map((source, index) => {
      const summary = english ? source.en : source.es;
      return `[${index + 1}] ${source.title}\nURL: ${source.href}\n${summary}`;
    })
    .join("\n\n");
}

export function publicSources(sources) {
  return sources.map(({ id, title, href }) => ({ id, label: title, href }));
}

export function guidedFallback(locale, reason = "unavailable") {
  const english = String(locale || "").toLowerCase().startsWith("en");

  if (reason === "out-of-scope" || reason === "prompt-injection") {
    return {
      reply: english
        ? "I can only answer questions about ALLFICTION, its engineering projects, technical decisions and working method. Try asking which case best demonstrates a capability."
        : "Sólo puedo responder sobre ALLFICTION, sus proyectos de ingeniería, decisiones técnicas y forma de trabajo. Probá preguntarme qué caso demuestra mejor una capacidad.",
      cta: {
        label: english ? "View engineering cases" : "Ver casos de ingeniería",
        href: "https://allfiction.56-126-148-93.sslip.io/#trabajo",
      },
    };
  }

  return {
    reply: english
      ? "Generative mode is temporarily unavailable, so I switched to verified guided mode. I can still help with Crypto Risk, Qivox, PolyLLM, infrastructure, applied AI or the engineering method."
      : "El modo generativo no está disponible temporalmente, así que pasé al modo guiado verificado. Igual puedo ayudarte con Crypto Risk, Qivox, PolyLLM, infraestructura, IA aplicada o el método de ingeniería.",
    cta: {
      label: english ? "View projects" : "Ver proyectos",
      href: "https://allfiction.56-126-148-93.sslip.io/#trabajo",
    },
  };
}
