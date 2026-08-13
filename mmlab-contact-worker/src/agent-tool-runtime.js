import { publicSources, retrievePortfolioContext } from "./portfolio-context.js";
import { CAPABILITY_TOPICS, PROJECT_QUERIES } from "./agent-tools.js";

function cleanText(value, limit = 260) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function isEnglish(locale) {
  return String(locale || "").toLowerCase().startsWith("en");
}

function compactSources(sources, locale) {
  const english = isEnglish(locale);
  return sources.map((source) => ({
    ...publicSources([source])[0],
    summary: english ? source.en : source.es,
  }));
}

function normalizeCapabilities(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item, 60)).filter(Boolean).slice(0, 6);
}

function buildBrief(args, locale) {
  const goal = cleanText(args?.goal, 220);
  const currentProcess = cleanText(args?.currentProcess, 340);
  const desiredOutcome = cleanText(args?.desiredOutcome, 260);
  const capabilities = normalizeCapabilities(args?.capabilities);
  if (!goal || !desiredOutcome) return null;

  const lines = isEnglish(locale)
    ? [
        "PROJECT BRIEF — prepared with AF Agent",
        "",
        `Goal: ${goal}`,
        currentProcess ? `Current process: ${currentProcess}` : "",
        `Desired outcome: ${desiredOutcome}`,
        capabilities.length ? `Likely capabilities: ${capabilities.join(", ")}` : "",
      ]
    : [
        "BRIEF DE PROYECTO — preparado con AF Agent",
        "",
        `Objetivo: ${goal}`,
        currentProcess ? `Proceso actual: ${currentProcess}` : "",
        `Resultado buscado: ${desiredOutcome}`,
        capabilities.length ? `Capacidades probables: ${capabilities.join(", ")}` : "",
      ];

  return {
    goal,
    currentProcess,
    desiredOutcome,
    capabilities,
    text: lines.filter(Boolean).join("\n"),
  };
}

export function executeAgentTool(name, args, locale = "es-AR") {
  if (name === "search_portfolio") {
    const query = cleanText(args?.query, 180);
    if (!query) return { ok: false, reason: "invalid-tool-arguments" };
    const sources = retrievePortfolioContext(query, 3);
    return {
      ok: true,
      data: { query, matches: compactSources(sources, locale) },
      sources: publicSources(sources),
      requiresApproval: false,
    };
  }

  if (name === "get_project") {
    const projectId = cleanText(args?.projectId, 40);
    const query = PROJECT_QUERIES[projectId];
    if (!query) return { ok: false, reason: "unknown-project" };
    const source = retrievePortfolioContext(query, 3).find((item) => item.id === projectId);
    if (!source) return { ok: false, reason: "unknown-project" };
    return {
      ok: true,
      data: compactSources([source], locale)[0],
      sources: publicSources([source]),
      requiresApproval: false,
    };
  }

  if (name === "get_capability_evidence") {
    const topic = cleanText(args?.topic, 40).toLowerCase();
    if (!CAPABILITY_TOPICS.includes(topic)) {
      return { ok: false, reason: "unknown-capability" };
    }
    const queryMap = {
      ai: "ai llm agent rag ocr",
      automation: "automation agent workflow manual process",
      backend: "backend api fastapi redis postgresql",
      infrastructure: "infrastructure production aws docker cicd",
      vision: "vision ocr multimodal scanner",
      "3d": "3d three motoratlas",
      mobile: "mobile pwa qivox mollchef",
      data: "data postgresql redis audit",
    };
    const sources = retrievePortfolioContext(queryMap[topic], 3);
    return {
      ok: true,
      data: { topic, evidence: compactSources(sources, locale) },
      sources: publicSources(sources),
      requiresApproval: false,
    };
  }

  if (name === "draft_project_brief") {
    const brief = buildBrief(args, locale);
    if (!brief) return { ok: false, reason: "invalid-tool-arguments" };
    return {
      ok: true,
      data: { brief },
      sources: [],
      requiresApproval: true,
      approvalAction: "prefill_project_form",
    };
  }

  return { ok: false, reason: "unknown-tool" };
}
