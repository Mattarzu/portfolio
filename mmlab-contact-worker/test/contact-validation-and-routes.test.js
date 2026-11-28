// Validación exacta de /contact (worker.js:77-100) y guardas de ruta+método (worker.js:470-479).
// Sin red real: fetch de Telegram mockeado, token falso.
import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

import worker, { resetStateForTests } from "../src/worker.js";

const originalFetch = globalThis.fetch;
const origin = "https://mattarzu-portfolio.pages.dev";
const env = {
  ALLOWED_ORIGIN: origin,
  TELEGRAM_BOT_TOKEN: "telegram-test",
  TELEGRAM_CHAT_ID: "123",
  RATE_LIMIT_PER_MINUTE: "60",
};
const base = { name: "Matt", contact: "m@example.com", message: "Hola", page: origin, createdAt: "2026-07-24T18:00:00.000Z", website: "" };

function post(path, body, method = "POST") {
  return new Request(`https://worker.test${path}`, {
    method,
    headers: { "Content-Type": "application/json", Origin: origin, "CF-Connecting-IP": "203.0.113.20" },
    body: method === "GET" ? undefined : JSON.stringify(body),
  });
}

beforeEach(() => {
  resetStateForTests();
  globalThis.fetch = async () => new Response(JSON.stringify({ ok: true }), { status: 200 });
});
afterEach(() => {
  globalThis.fetch = originalFetch;
});

const LIMITS = { name: 80, contact: 160, message: 2000, page: 300, createdAt: 80, website: 200 };

for (const [field, max] of Object.entries(LIMITS)) {
  test(`contact ${field}: exactly ${max} chars is accepted`, async () => {
    const res = await worker.fetch(post("/contact", { ...base, [field]: "a".repeat(max) }), env);
    assert.equal(res.status, 200);
  });
  test(`contact ${field}: ${max + 1} chars is rejected as ${field}-too-long`, async () => {
    const res = await worker.fetch(post("/contact", { ...base, [field]: "a".repeat(max + 1) }), env);
    assert.equal(res.status, 422);
    assert.deepEqual(await res.json(), { detail: `${field}-too-long` });
  });
}

for (const field of ["name", "contact", "message"]) {
  test(`contact: missing or blank ${field} alone is rejected`, async () => {
    for (const value of [undefined, "", "   "]) {
      const res = await worker.fetch(post("/contact", { ...base, [field]: value }), env);
      assert.equal(res.status, 422, `${field}=${JSON.stringify(value)}`);
      assert.deepEqual(await res.json(), { detail: "missing-required-fields" });
    }
  });
}

test("routes: each endpoint answers only its own method", async () => {
  const cases = [
    ["GET", "/contact"], ["GET", "/ai-chat"], ["POST", "/health"], ["PUT", "/health"],
    ["POST", "/otra"], ["GET", "/otra"],
  ];
  for (const [method, path] of cases) {
    const res = await worker.fetch(post(path, base, method), env);
    assert.equal(res.status, 404, `${method} ${path}`);
  }
  assert.equal((await worker.fetch(post("/health", null, "GET"), env)).status, 200);
});
