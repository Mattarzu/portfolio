import baseWorker from "./worker.js";
import { handleAutomationRequest } from "./automation-endpoint.js";

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/automation-health" && request.method === "GET") {
      return automationHealth();
    }
    if (url.pathname === "/automation-analyze") {
      return handleAutomationRequest(request, env);
    }
    return baseWorker.fetch(request, env);
  },
};
