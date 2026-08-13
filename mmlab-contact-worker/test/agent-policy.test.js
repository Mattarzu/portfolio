import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

import worker from "../src/worker-v2.js";
import { resetAgentStateForTests } from "../src/agent-endpoint.js";

const originalFetch = globalThis.fetch;
const allowedOrigin = "https://allfiction.56-126-148-93.sslip.io";

function environment(overrides = {}) {
  return {
    ALLOWED_ORIGIN: allowedOrigin,
    AI_ENABLED: "true",
    AI_PROVIDER: "gemini",
    AI_MODEL: "gemini-3.5-flash-lite",
    GEMINI_API_KEY: "test-key",
    AI_RATE_LIMIT: "20",
    AI_RATE_WINDOW_SECONDS: "900",
    AGENT_INPUT_LIMIT: "800",
    AI_AGENT_DAILY_LIMIT: "100",
    ...overrides,
  };
}

function request(message, extra = {}) {
  return new Request("https://worker.test/agent-run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: allowedOrigin,
      "CF-Connecting-IP": "203.0.113.92",
    },
    body: JSON.stringify({
      message,
      locale: "es-AR",
      sessionId: "policy-test",
      website: "",
      ...extra,
    }),
  });
}

function mockTool(name, args) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify({
      steps: [{
        type: "function_call",
        name,
        arguments: args,
        id: "policy-call",
      }],
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "x-request-id": "req_policy",
      },
    });
  };
  return calls;
}

beforeEach(() => resetAgentStateForTests());
afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("project-brief intent exposes only draft_project_brief to Gemini", async () => {
  const calls = mockTool("draft_project_brief", {
    goal: "Crear una web para un amigo",
    currentProcess: "Hoy no tiene un sitio propio.",
    desiredOutcome: "Mostrar servicios y recibir consultas.",
    capabilities: ["frontend", "backend"],
  });

  const response = await worker.fetch(
    request("necesito armar una pagina web", { intent: "project-brief" }),
    environment(),
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.toolCall.name, "draft_project_brief");
  assert.equal(body.toolPolicy, "brief-only");
  assert.equal(body.approvalRequest.action, "prefill_project_form");

  const providerBody = JSON.parse(calls[0].init.body);
  assert.deepEqual(providerBody.tools.map((tool) => tool.name), ["draft_project_brief"]);
  assert.deepEqual(
    providerBody.generation_config.tool_choice.allowed_tools.tools,
    ["draft_project_brief"],
  );
});

test("brief follow-up preserves prior context in model input", async () => {
  const calls = mockTool("draft_project_brief", {
    goal: "Crear una web para un amigo",
    currentProcess: "No tiene sitio propio.",
    desiredOutcome: "Mostrar servicios y recibir consultas.",
    capabilities: ["frontend"],
  });

  const response = await worker.fetch(
    request("para un amigo", {
      intent: "project-brief",
      context: "necesito armar una pagina web",
    }),
    environment(),
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.toolCall.name, "draft_project_brief");

  const providerBody = JSON.parse(calls[0].init.body);
  assert.match(providerBody.input, /necesito armar una pagina web/);
  assert.match(providerBody.input, /para un amigo/);
});

test("project-brief policy rejects a provider call to another tool", async () => {
  mockTool("search_portfolio", { query: "pagina web" });

  const response = await worker.fetch(
    request("necesito una pagina web", { intent: "project-brief" }),
    environment(),
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.mode, "guided");
  assert.equal(body.reason, "disallowed-tool-call");
});

test("general agent requests keep the full tool set", async () => {
  const calls = mockTool("search_portfolio", { query: "backend" });

  const response = await worker.fetch(
    request("Que proyecto demuestra experiencia backend?"),
    environment(),
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.toolPolicy, "general");
  assert.equal(body.toolCall.name, "search_portfolio");

  const providerBody = JSON.parse(calls[0].init.body);
  assert.ok(providerBody.tools.length > 1);
  assert.ok(providerBody.tools.some((tool) => tool.name === "search_portfolio"));
  assert.ok(providerBody.tools.some((tool) => tool.name === "draft_project_brief"));
});
