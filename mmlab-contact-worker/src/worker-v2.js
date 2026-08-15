import baseWorker from "./worker.js";
import {
  automationCorsHeaders,
  automationRuntimeLoggingEnabled,
  automationTimeoutMs,
  handleAutomationRequest,
} from "./automation-endpoint.js";
import { publicProviderState } from "./ai-provider.js";
import { agentCorsHeaders, handleAgentRequest } from "./agent-endpoint.js";
import { detectProjectIntent, projectHandoffCopy } from "./intent-router.js";

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

function automationHealth(request, env) {
  const cors = automationCorsHeaders(request.headers.get("Origin"), env);
  const provider = publicProviderState(env);
  const aiEnabled = ["1", "true", "yes", "on"].includes(String(env.AI_ENABLED || "").trim().toLowerCase());
  return json({
    ok: true,
    service: "allfiction-portfolio-api",
    capability: "automation-analysis-v1",
    runtimeVersion: "v15b4",
    structuredOutput: true,
    externalActions: false,
    ai: {
      enabled: aiEnabled,
      provider: provider.provider,
      model: provider.model,
      supported: provider.supported,
      configured: provider.configured,
    },
    diagnostics: {
      fallbackReasonExposed: true,
      transientRetryMaxAttempts: 2,
      automationTimeoutMs: automationTimeoutMs(env),
      providerUsageExposed: true,
      runtimeMetadataLogging: automationRuntimeLoggingEnabled(env),
      runtimeLogPayloads: false,
      promptLoggedByWorker: false,
      responseLoggedByWorker: false,
    },
  }, 200, cors);
}

function agentHealth(request, env) {
  const cors = agentCorsHeaders(request.headers.get("Origin"), env);
  return json({
    ok: true,
    service: "allfiction-portfolio-api",
    capability: "tool-calling-v1",
    toolsReadOnly: true,
    humanApproval: true,
    externalActions: false,
    approvalExecution: "browser-only",
    intentRouter: "project-intent-v1",
  }, 200, cors);
}

async function projectIntentHandoff(request, env) {
  if (request.method !== "POST") return null;

  let payload;
  try {
    payload = await request.clone().json();
  } catch {
    return null;
  }

  const message = typeof payload?.message === "string" ? payload.message.slice(0, 1200) : "";
  const intent = detectProjectIntent(message);
  if (!intent.matched) return null;

  const cors = agentCorsHeaders(request.headers.get("Origin"), env);
  if (!cors["Access-Control-Allow-Origin"]) return null;

  return json({
    ok: true,
    mode: "handoff",
    reason: "project-intent",
    target: "agent",
    reply: projectHandoffCopy(payload?.locale),
    handoff: {
      target: "agent",
      preserveMessage: true,
      intent: intent.reason,
    },
    sources: [],
  }, 200, cors);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/automation-health" && request.method === "GET") {
      return automationHealth(request, env);
    }
    if (url.pathname === "/automation-analyze") {
      return handleAutomationRequest(request, env);
    }
    if (url.pathname === "/agent-health" && request.method === "GET") {
      return agentHealth(request, env);
    }
    if (url.pathname === "/agent-run") {
      return handleAgentRequest(request, env);
    }
    if (url.pathname === "/ai-chat") {
      const handoff = await projectIntentHandoff(request, env);
      if (handoff) return handoff;
    }

    return baseWorker.fetch(request, env);
  },
};
