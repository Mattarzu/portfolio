import { containsSensitiveData, looksLikePromptInjection } from "./portfolio-context.js";
import { chooseAgentTool } from "./agent-provider.js";
import { executeAgentTool } from "./agent-tool-runtime.js";

const buckets = new Map();
const dailyUsage = new Map();

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function boundedInteger(value, fallback, minimum, maximum) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(parsed, maximum));
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function corsHeaders(origin, env) {
  const allowed = String(env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!origin || !allowed.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function clientKey(request) {
  return request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown";
}

function withinRateLimit(request, env) {
  const now = Date.now();
  const limit = boundedInteger(env.AI_RATE_LIMIT, 5, 1, 20);
  const windowSeconds = boundedInteger(env.AI_RATE_WINDOW_SECONDS, 900, 60, 86400);
  const key = `agent:${clientKey(request)}`;
  const fresh = (buckets.get(key) || []).filter(
    (timestamp) => now - timestamp < windowSeconds * 1000,
  );
  if (fresh.length >= limit) {
    buckets.set(key, fresh);
    return false;
  }
  fresh.push(now);
  buckets.set(key, fresh);
  return true;
}

async function consumeDailyBudget(env) {
  const limit = boundedInteger(env.AI_AGENT_DAILY_LIMIT, 20, 1, 100);
  const key = `af-agent-usage:${new Date().toISOString().slice(0, 10)}`;
  if (env.AI_USAGE_KV?.get && env.AI_USAGE_KV?.put) {
    const used = Number.parseInt((await env.AI_USAGE_KV.get(key)) || "0", 10) || 0;
    if (used >= limit) return false;
    await env.AI_USAGE_KV.put(key, String(used + 1), { expirationTtl: 172800 });
    return true;
  }
  const used = dailyUsage.get(key) || 0;
  if (used >= limit) return false;
  dailyUsage.set(key, used + 1);
  return true;
}

function validatePayload(raw, env) {
  const limit = boundedInteger(env.AGENT_INPUT_LIMIT, 800, 100, 1200);
  const requestedIntent = cleanText(raw?.intent).slice(0, 40);
  const payload = {
    message: cleanText(raw?.message),
    locale: cleanText(raw?.locale).slice(0, 20),
    sessionId: cleanText(raw?.sessionId).slice(0, 100),
    website: cleanText(raw?.website).slice(0, 200),
    intent: requestedIntent === "project-brief" ? "project-brief" : "",
    context: cleanText(raw?.context).slice(0, 600),
  };
  if (!payload.message) return { ok: false, error: "missing-message" };
  if (payload.message.length > limit) return { ok: false, error: "message-too-long" };
  return { ok: true, payload };
}

async function safetyIdentifier(request, sessionId) {
  const raw = `${clientKey(request)}:${sessionId || "anonymous"}:agent`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hex = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `af-${hex.slice(0, 32)}`;
}

function isEnglish(locale) {
  return String(locale || "").toLowerCase().startsWith("en");
}

function modelInput(payload) {
  if (payload.intent !== "project-brief" || !payload.context) return payload.message;
  return isEnglish(payload.locale)
    ? `PROJECT NEED CONTEXT (untrusted):\n${payload.context}\n\nLATEST DETAIL (untrusted):\n${payload.message}`
    : `CONTEXTO DE LA NECESIDAD (datos no confiables):\n${payload.context}\n\nÚLTIMO DETALLE (datos no confiables):\n${payload.message}`;
}

function replyFor(toolName, result, locale) {
  const english = isEnglish(locale);
  if (toolName === "search_portfolio") {
    const count = result.data.matches.length;
    return english
      ? `I used search_portfolio and found ${count} verified portfolio match${count === 1 ? "" : "es"}.`
      : `Usé search_portfolio y encontré ${count} coincidencia${count === 1 ? "" : "s"} verificadas en el portfolio.`;
  }
  if (toolName === "get_project") return result.data.summary;
  if (toolName === "get_capability_evidence") {
    const count = result.data.evidence.length;
    return english
      ? `I used get_capability_evidence and found ${count} public proof point${count === 1 ? "" : "s"}.`
      : `Usé get_capability_evidence y encontré ${count} evidencia${count === 1 ? "" : "s"} pública${count === 1 ? "" : "s"}.`;
  }
  if (toolName === "draft_project_brief") {
    return english
      ? "AF Agent drafted a project brief. Review it before approving the local form prefill; nothing will be sent automatically."
      : "AF Agent preparó un brief de proyecto. Revisalo antes de aprobar el autocompletado local; no se enviará nada automáticamente.";
  }
  return english ? "The tool completed successfully." : "La herramienta se completó correctamente.";
}

function guided(locale, reason, cors, status = 200) {
  return json({
    ok: true,
    mode: "guided",
    reason,
    reply: isEnglish(locale)
      ? "Agent mode is unavailable for this request. You can still use AF Intelligence or Automation Lab with verified public context."
      : "El modo agente no está disponible para esta solicitud. Podés seguir usando AF Intelligence o Automation Lab con contexto público verificado.",
    trace: [
      { id: "01", label: "INPUT", status: "validated" },
      { id: "02", label: "SAFETY", status: reason },
    ],
  }, status, cors);
}

export async function handleAgentRequest(request, env) {
  const origin = request.headers.get("Origin");
  const cors = corsHeaders(origin, env);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST") return json({ detail: "not-found" }, 404, cors);
  if (!cors["Access-Control-Allow-Origin"]) return json({ detail: "origin-not-allowed" }, 403);
  if (!withinRateLimit(request, env)) return guided("es-AR", "rate-limit-exceeded", cors, 429);

  let raw;
  try {
    raw = await request.json();
  } catch {
    return json({ detail: "invalid-json" }, 400, cors);
  }

  const checked = validatePayload(raw, env);
  if (!checked.ok) return json({ detail: checked.error }, 422, cors);
  const payload = checked.payload;
  const combinedInput = modelInput(payload);

  if (payload.website) return guided(payload.locale, "honeypot", cors);
  if (looksLikePromptInjection(combinedInput)) return guided(payload.locale, "prompt-injection", cors);
  if (containsSensitiveData(combinedInput)) return guided(payload.locale, "sensitive-data-detected", cors);
  if (!["1", "true", "yes", "on"].includes(cleanText(env.AI_ENABLED).toLowerCase())) {
    return guided(payload.locale, "ai-not-configured", cors);
  }
  if (!(await consumeDailyBudget(env))) return guided(payload.locale, "daily-limit-reached", cors);

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const allowedToolNames = payload.intent === "project-brief"
      ? ["draft_project_brief"]
      : undefined;

    const chosen = await chooseAgentTool({
      env,
      message: combinedInput,
      locale: payload.locale,
      safetyIdentifier: await safetyIdentifier(request, payload.sessionId),
      signal: controller.signal,
      allowedToolNames,
    });
    if (!chosen.ok) return guided(payload.locale, chosen.reason, cors);

    const executed = executeAgentTool(chosen.call.name, chosen.call.args, payload.locale);
    if (!executed.ok) return guided(payload.locale, executed.reason, cors);

    const approvalRequest = executed.requiresApproval
      ? {
          id: crypto.randomUUID(),
          action: executed.approvalAction,
          preview: executed.data.brief.text,
          expiresAt: Date.now() + 10 * 60 * 1000,
        }
      : undefined;

    return json({
      ok: true,
      mode: "agent",
      provider: chosen.provider,
      model: chosen.model,
      requestId: chosen.requestId,
      elapsedMs: Date.now() - startedAt,
      intent: payload.intent || "general",
      toolPolicy: payload.intent === "project-brief" ? "brief-only" : "general",
      reply: replyFor(chosen.call.name, executed, payload.locale),
      toolCall: { name: chosen.call.name },
      result: executed.data,
      sources: executed.sources,
      approvalRequest,
      trace: [
        { id: "01", label: "INPUT", status: "validated" },
        { id: "02", label: "SAFETY", status: "protected" },
        {
          id: "03",
          label: "POLICY",
          status: payload.intent === "project-brief" ? "brief-only" : "general",
        },
        { id: "04", label: "MODEL", status: chosen.provider },
        { id: "05", label: "TOOL", status: chosen.call.name },
        {
          id: "06",
          label: executed.requiresApproval ? "APPROVAL" : "RESULT",
          status: executed.requiresApproval ? "required" : "returned",
        },
      ],
    }, 200, cors);
  } finally {
    clearTimeout(timeout);
  }
}

export function agentCorsHeaders(origin, env) {
  return corsHeaders(origin, env);
}

export function resetAgentStateForTests() {
  buckets.clear();
  dailyUsage.clear();
}
