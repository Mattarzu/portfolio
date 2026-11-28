// Mínimos exactos de normalizeAutomationAnalysis (automation-analysis.js:185-206) y safeTokenCount.
import assert from "node:assert/strict";
import { test } from "node:test";

import { extractAutomationTelemetry, normalizeAutomationAnalysis } from "../src/automation-analysis.js";

const valid = () => ({
  title: "T", summary: "S",
  currentProcess: ["a", "b"],
  workflow: [
    { label: "1", kind: "input", detail: "d", humanApproval: false },
    { label: "2", kind: "ai", detail: "d", humanApproval: false },
    { label: "3", kind: "human", detail: "d", humanApproval: true },
  ],
  opportunities: [{ label: "o", value: "v", risk: "low" }],
  humanControls: ["h"],
  capabilities: ["AI"],
  nextStep: "n",
});

test("exact minimums are accepted", () => {
  assert.notEqual(normalizeAutomationAnalysis(valid()), null);
});

test("one below each minimum is rejected", () => {
  const cut = (mutate) => { const v = valid(); mutate(v); return normalizeAutomationAnalysis(v); };
  assert.equal(cut((v) => v.currentProcess.pop()), null, "currentProcess < 2");
  assert.equal(cut((v) => v.workflow.pop()), null, "workflow < 3");
  assert.equal(cut((v) => { v.opportunities = []; }), null, "opportunities < 1");
  assert.equal(cut((v) => { v.humanControls = []; }), null, "humanControls < 1");
  assert.equal(cut((v) => { v.capabilities = []; }), null, "capabilities < 1");
  assert.equal(cut((v) => { v.nextStep = ""; }), null, "nextStep");
});

test("non-object input is rejected", () => {
  for (const v of [null, undefined, "x", 3, []]) assert.equal(normalizeAutomationAnalysis(v), null);
});

test("telemetry token counts: negatives and junk become 0, zero stays 0", () => {
  const t = (n) => extractAutomationTelemetry("openai", { usage: { input_tokens: n, output_tokens: 0, total_tokens: 0 } }).usage.inputTokens;
  assert.equal(t(-1), 0);
  assert.equal(t("abc"), 0);
  assert.equal(t(0), 0);
  assert.equal(t(7), 7);
});
