// Tope diario exacto y ventana de rate limit (worker.js:140-195; automation-endpoint.js:58-95).
import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

import worker, { consumeDailyBudget, resetStateForTests } from "../src/worker.js";
import { handleAutomationRequest, resetAutomationStateForTests } from "../src/automation-endpoint.js";

const originalNow = Date.now;
const origin = "https://mattarzu-portfolio.pages.dev";

beforeEach(() => { resetStateForTests(); resetAutomationStateForTests(); });
afterEach(() => { Date.now = originalNow; });

function kv(initial) {
  const store = new Map(initial === undefined ? [] : [[`af-ai-usage:${new Date().toISOString().slice(0, 10)}`, String(initial)]]);
  return { store, get: async (k) => store.get(k) ?? null, put: async (k, v) => void store.set(k, v) };
}

test("daily budget (memory): exactly AI_DAILY_LIMIT calls pass, the next one is refused", async () => {
  const env = { AI_DAILY_LIMIT: "3" };
  const results = [];
  for (let i = 0; i < 4; i++) results.push(await consumeDailyBudget(env));
  assert.deepEqual(results, [true, true, true, false]);
});

test("daily budget (KV): refuses when stored == limit and never writes past the limit", async () => {
  const store = kv(2);
  assert.equal(await consumeDailyBudget({ AI_DAILY_LIMIT: "3", AI_USAGE_KV: store }), true);
  assert.equal([...store.store.values()][0], "3");
  assert.equal(await consumeDailyBudget({ AI_DAILY_LIMIT: "3", AI_USAGE_KV: store }), false);
  assert.equal([...store.store.values()][0], "3");
});

function aiRequest() {
  return new Request("https://worker.test/ai-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin, "CF-Connecting-IP": "203.0.113.99" },
    body: JSON.stringify({ message: "Hola", locale: "es-AR", sessionId: "s", history: [], website: "honeypot" }),
  });
}

test("rate limit window: a request exactly windowSeconds old no longer counts", async () => {
  const env = { ALLOWED_ORIGIN: origin, AI_RATE_LIMIT: "1", AI_RATE_WINDOW_SECONDS: "60" };
  let now = 1_800_000_000_000;
  Date.now = () => now;
  assert.equal((await worker.fetch(aiRequest(), env)).status, 200);   // honeypot: no gasta proveedor
  now += 59_999;
  assert.equal((await worker.fetch(aiRequest(), env)).status, 429);
  now += 1; // 60_000 ms exactos desde la primera
  assert.equal((await worker.fetch(aiRequest(), env)).status, 200);
});

function autoRequest() {
  return new Request("https://worker.test/automation-analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin, "CF-Connecting-IP": "203.0.113.98" },
    body: JSON.stringify({ process: "x".repeat(40), locale: "es-AR", sessionId: "s", website: "bot" }),
  });
}

test("automation rate limit: window edge is exclusive and the limit-th call is the last allowed", async () => {
  const env = { ALLOWED_ORIGIN: origin, AI_RATE_LIMIT: "2", AI_RATE_WINDOW_SECONDS: "60" };
  let now = 1_800_000_000_000;
  Date.now = () => now;
  const status = async () => (await handleAutomationRequest(autoRequest(), env)).status;
  assert.equal(await status(), 200);
  assert.equal(await status(), 200);
  assert.equal(await status(), 429);
  now += 60_000;
  assert.equal(await status(), 200);
});

// El tope diario de automation por llamadas al proveedor lo cubren MSI-93 / #35.
