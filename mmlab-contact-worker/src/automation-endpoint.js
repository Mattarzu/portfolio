import {
  containsSensitiveData,
  looksLikePromptInjection,
} from "./portfolio-context.js";
import { analyzeAutomationProcess } from "./automation-analysis.js";
import { publicProviderState } from "./ai-provider.js";

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

export function automationTimeoutMs(env = {}) {
  return boundedInteger(env.AI_AUTOMATION_TIMEOUT_MS, 24000, 8000, 30000);
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

export function automationCorsHeaders(origin, env) {
  const allowed = String(env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!origin || !allowed.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function clientKey(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function withinRateLimit(request, env) {
  const now = Date.now();
  const limit = boundedInteger(env.AI_RATE_LIMIT, 5, 1, 20);
  const windowSeconds = boundedInteger(env.AI_RATE_WINDOW_SECONDS, 900, 60, 86400);
  const key = clientKey(request);
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
  const limit = boundedInteger(env.AI_DAILY_LIMIT, 50, 1, 500);
  const key = `af-ai-usage:${new Date().toISOString().slice(0, 10)}`;

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

export function validateAutomationPayload(raw, env = {}) {
  const maxLength = boundedInteger(env.AUTOMATION_INPUT_LIMIT, 1200, 300, 2000);
  const payload = {
    process: cleanText(raw?.process),
    locale: cleanText(raw?.locale).slice(0, 20),
    sessionId: cleanText(raw?.sessionId).slice(0, 100),
    website: cleanText(raw?.website).slice(0, 200),
  };

  if (!payload.process) return { ok: false, error: "missing-process" };
  if (payload.process.length < 30) return { ok: false, error: "process-too-short" };
  if (payload.process.length > maxLength) return { ok: false, error: "process-too-long" };
  return { ok: true, payload };
}

async function safetyIdentifier(request, sessionId) {
  const raw = `${clientKey(request)}:${sessionId || "anonymous"}:automation`;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw),
  );
  const hex = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `af-${hex.slice(0, 32)}`;
}

function guidedAnalysis(locale) {
  const english = String(locale).toLowerCase().startsWith("en");
  return {
    title: english ? "Initial automation map" : "Mapa inicial de automatización",
    summary: english
      ? "The generative analyzer is temporarily unavailable. This fallback keeps the workflow safe and explicit."
      : "El analizador generativo no está disponible temporalmente. Esta plantilla mantiene el flujo seguro y explícito.",
    currentProcess: english
      ? ["Manual input", "Manual review", "Manual action"]
      : ["Entrada manual", "Revisión manual", "Acción manual"],
    workflow: [
      {
        label: english ? "Capture" : "Captura",
        kind: "input",
        detail: english ? "Receive structured input." : "Recibir la entrada de forma estructurada.",
        humanApproval: false,
      },
      {
        label: english ? "Validate" : "Validación",
        kind: "automation",
        detail: english ? "Apply deterministic checks first." : "Aplicar primero reglas determinísticas.",
        humanApproval: false,
      },
      {
        label: english ? "Review" : "Revisión",
        kind: "human",
        detail: english ? "Keep a person before sensitive actions." : "Mantener una persona antes de acciones sensibles.",
        humanApproval: true,
      },
      {
        label: english ? "Output" : "Salida",
        kind: "output",
        detail: english ? "Record and deliver the result." : "Registrar y entregar el resultado.",
        humanApproval: false,
      },
    ],
    opportunities: [
      {
        label: english ? "Reduce repetitive handling" : "Reducir tareas repetitivas",
        value: english
          ? "Standardise capture and validation before adding AI."
          : "Estandarizar captura y validación antes de agregar IA.",
        risk: "low",
      },
    ],
    humanControls: [
      english
        ? "Require approval before irreversible or customer-facing actions."
        : "Exigir aprobación antes de acciones irreversibles o visibles para clientes.",
    ],
    capabilities: ["AUTOMATION", "HUMAN_IN_LOOP"],
    nextStep: english
      ? "Retry the analysis or send the process context to ALLFICTION for an architecture review."
      : "Reintentá el análisis o enviá el contexto a ALLFICTION para una revisión de arquitectura.",
  };
}

function telemetryState(value) {
  if (!value || typeof value !== "object") return null;
  const usage = value.usage && typeof value.usage === "object" ? value.usage : {};
  return {
    finishReason: cleanText(value.finishReason).slice(0, 64) || null,
    usage: {
      inputTokens: boundedInteger(usage.inputTokens, 0, 0, 10_000_000),
      outputTokens: boundedInteger(usage.outputTokens, 0, 0, 10_000_000),
      thoughtsTokens: boundedInteger(usage.thoughtsTokens, 0, 0, 10_000_000),
      totalTokens: boundedInteger(usage.totalTokens, 0, 0, 10_000_000),
    },
  };
}

export function automationRuntimeLoggingEnabled(env = {}) {
  return ["1", "true", "yes", "on"].includes(
    cleanText(env.AI_RUNTIME_LOGS).toLowerCase(),
  );
}

function logAutomationRuntime(env, runtime) {
  if (!automationRuntimeLoggingEnabled(env)) return;
  const usage = runtime.telemetry?.usage || {};
  console.log({
    event: "af_automation_runtime",
    runtimeVersion: "v15b4",
    feature: runtime.feature,
    status: runtime.status,
    reason: runtime.reason,
    provider: runtime.provider,
    model: runtime.model,
    elapsedMs: runtime.elapsedMs,
    attempts: runtime.attempts,
    finishReason: runtime.telemetry?.finishReason || null,
    inputTokens: usage.inputTokens || 0,
    outputTokens: usage.outputTokens || 0,
    thoughtsTokens: usage.thoughtsTokens || 0,
    totalTokens: usage.totalTokens || 0,
    promptLogged: false,
    responseLogged: false,
  });
}

function runtimeState(env, status, reason, elapsedMs = 0, attempts = 0, telemetry = null) {
  const provider = publicProviderState(env);
  return {
    feature: "automation-lab",
    status,
    reason: reason || null,
    provider: provider.provider,
    model: provider.model,
    configured: provider.configured,
    elapsedMs: Math.max(0, Number(elapsedMs) || 0),
    attempts: Math.max(0, Number(attempts) || 0),
    telemetry: telemetryState(telemetry),
    promptLoggedByWorker: false,
    responseLoggedByWorker: false,
  };
}

function guided(
  locale,
  reason,
  cors,
  env,
  status = 200,
  elapsedMs = 0,
  attempts = 0,
  telemetry = null,
  logProviderRuntime = false,
) {
  const runtime = runtimeState(env, "fallback", reason, elapsedMs, attempts, telemetry);
  if (logProviderRuntime) logAutomationRuntime(env, runtime);
  return json(
    {
      ok: true,
      mode: "guided",
      reason,
      runtime,
      analysis: guidedAnalysis(locale),
      trace: [
        { id: "01", label: "INPUT", status: "validated" },
        { id: "02", label: "PRIVACY", status: "protected" },
        { id: "03", label: "MODEL", status: reason || "fallback" },
      ],
    },
    status,
    cors,
  );
}

export async function handleAutomationRequest(request, env) {
  const origin = request.headers.get("Origin");
  const cors = automationCorsHeaders(origin, env);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== "POST") return json({ detail: "not-found" }, 404, cors);
  if (!cors["Access-Control-Allow-Origin"]) {
    return json({ detail: "origin-not-allowed" }, 403);
  }
  if (!withinRateLimit(request, env)) {
    return guided("es-AR", "rate-limit-exceeded", cors, env, 429);
  }

  let raw;
  try {
    raw = await request.json();
  } catch {
    return json({ detail: "invalid-json" }, 400, cors);
  }

  const result = validateAutomationPayload(raw, env);
  if (!result.ok) return json({ detail: result.error }, 422, cors);
  const payload = result.payload;

  if (payload.website) return guided(payload.locale, "honeypot", cors, env);
  if (looksLikePromptInjection(payload.process)) {
    return guided(payload.locale, "prompt-injection", cors, env);
  }
  if (containsSensitiveData(payload.process)) {
    return guided(payload.locale, "sensitive-data-detected", cors, env);
  }
  if (!["1", "true", "yes", "on"].includes(cleanText(env.AI_ENABLED).toLowerCase())) {
    return guided(payload.locale, "ai-not-configured", cors, env);
  }
  if (!(await consumeDailyBudget(env))) {
    return guided(payload.locale, "daily-limit-reached", cors, env);
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutMs = automationTimeoutMs(env);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resultAi = await analyzeAutomationProcess({
      env,
      description: payload.process,
      locale: payload.locale,
      safetyIdentifier: await safetyIdentifier(request, payload.sessionId),
      signal: controller.signal,
    });

    const elapsedMs = Date.now() - startedAt;
    if (!resultAi.ok) {
      return guided(
        payload.locale,
        resultAi.reason,
        cors,
        env,
        200,
        elapsedMs,
        resultAi.attempts,
        resultAi.telemetry,
        true,
      );
    }

    const runtime = runtimeState(
      env,
      "ok",
      null,
      elapsedMs,
      resultAi.attempts,
      resultAi.telemetry,
    );
    logAutomationRuntime(env, runtime);

    return json(
      {
        ok: true,
        mode: "ai",
        provider: resultAi.provider,
        model: resultAi.model,
        requestId: resultAi.requestId,
        elapsedMs,
        runtime,
        analysis: resultAi.analysis,
        trace: [
          { id: "01", label: "INPUT", status: "validated" },
          { id: "02", label: "PRIVACY", status: "protected" },
          { id: "03", label: "MODEL", status: resultAi.provider },
          { id: "04", label: "SCHEMA", status: "validated" },
        ],
      },
      200,
      cors,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export function resetAutomationStateForTests() {
  buckets.clear();
  dailyUsage.clear();
}
