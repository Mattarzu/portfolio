import baseWorker from "./worker.js";
import { handleAutomationRequest } from "./automation-endpoint.js";
import { agentCorsHeaders, handleAgentRequest } from "./agent-endpoint.js";

function automationHealth() {
  return new Response(
    JSON.stringify({
      ok: true,
      service: "allfiction-portfolio-api",
      capability: "automation-analysis-v1",
      structuredOutput: true,
      externalActions: false,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}

function agentHealth(request, env) {
  const cors = agentCorsHeaders(request.headers.get("Origin"), env);
  return new Response(
    JSON.stringify({
      ok: true,
      service: "allfiction-portfolio-api",
      capability: "tool-calling-v1",
      toolsReadOnly: true,
      humanApproval: true,
      externalActions: false,
      approvalExecution: "browser-only",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...cors,
      },
    },
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/automation-health" && request.method === "GET") {
      return automationHealth();
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
    return baseWorker.fetch(request, env);
  },
};
