import assert from "node:assert/strict";
import { test } from "node:test";

import { automationCorsHeaders, validateAutomationPayload } from "../src/automation-endpoint.js";

const origin = "https://mattarzu-portfolio.pages.dev";

test("CORS: origin outside the allowlist gets no CORS headers at all", () => {
  assert.deepEqual(automationCorsHeaders("https://evil.example", { ALLOWED_ORIGIN: origin }), {});
});

test("CORS: missing Origin or empty allowlist yields no CORS headers", () => {
  assert.deepEqual(automationCorsHeaders(null, { ALLOWED_ORIGIN: origin }), {});
  assert.deepEqual(automationCorsHeaders(origin, { ALLOWED_ORIGIN: "" }), {});
  assert.deepEqual(automationCorsHeaders(origin, {}), {});
});

test("CORS: allowed origin is echoed with Vary: Origin and POST/OPTIONS only", () => {
  const h = automationCorsHeaders(origin, { ALLOWED_ORIGIN: `https://otro.example, ${origin}` });
  assert.equal(h["Access-Control-Allow-Origin"], origin);
  assert.equal(h.Vary, "Origin");
  assert.equal(h["Access-Control-Allow-Methods"], "POST, OPTIONS");
});

test("input length: 29 chars too short, 30 accepted", () => {
  assert.deepEqual(validateAutomationPayload({ process: "a".repeat(29) }), { ok: false, error: "process-too-short" });
  assert.equal(validateAutomationPayload({ process: "a".repeat(30) }).ok, true);
});

test("input length: exactly AUTOMATION_INPUT_LIMIT accepted, one more rejected", () => {
  const env = { AUTOMATION_INPUT_LIMIT: "500" };
  assert.equal(validateAutomationPayload({ process: "a".repeat(500) }, env).ok, true);
  assert.deepEqual(validateAutomationPayload({ process: "a".repeat(501) }, env), { ok: false, error: "process-too-long" });
});

test("input limit env is clamped to [300, 2000]", () => {
  assert.equal(validateAutomationPayload({ process: "a".repeat(300) }, { AUTOMATION_INPUT_LIMIT: "1" }).ok, true);
  assert.equal(validateAutomationPayload({ process: "a".repeat(301) }, { AUTOMATION_INPUT_LIMIT: "1" }).ok, false);
  assert.equal(validateAutomationPayload({ process: "a".repeat(2000) }, { AUTOMATION_INPUT_LIMIT: "99999" }).ok, true);
  assert.equal(validateAutomationPayload({ process: "a".repeat(2001) }, { AUTOMATION_INPUT_LIMIT: "99999" }).ok, false);
});

test("blank or missing process is missing-process", () => {
  assert.deepEqual(validateAutomationPayload({ process: "   " }), { ok: false, error: "missing-process" });
  assert.deepEqual(validateAutomationPayload({}), { ok: false, error: "missing-process" });
});
