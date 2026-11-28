// Comportamiento de executeAgentTool (agent-tool-runtime.js:26-123).
import assert from "node:assert/strict";
import { test } from "node:test";

import { executeAgentTool } from "../src/agent-tool-runtime.js";

test("get_project returns exactly the requested project, not another match", () => {
  for (const id of ["mollchef", "motoratlas", "mattmesh", "crypto-risk", "qivox", "polyllm"]) {
    const result = executeAgentTool("get_project", { projectId: id });
    assert.equal(result.ok, true, id);
    assert.equal(result.data.id, id);
    assert.deepEqual(result.sources.map((s) => s.id), [id]);
    assert.equal(result.requiresApproval, false);
  }
});

test("get_project rejects unknown ids", () => {
  assert.deepEqual(executeAgentTool("get_project", { projectId: "nope" }), { ok: false, reason: "unknown-project" });
  assert.deepEqual(executeAgentTool("get_project", {}), { ok: false, reason: "unknown-project" });
});

test("get_capability_evidence: known topic returns evidence, unknown is rejected", () => {
  const ok = executeAgentTool("get_capability_evidence", { topic: " AI " });
  assert.equal(ok.ok, true);
  assert.equal(ok.data.topic, "ai");
  assert.ok(ok.data.evidence.length > 0);
  assert.deepEqual(executeAgentTool("get_capability_evidence", { topic: "cooking" }), { ok: false, reason: "unknown-capability" });
});

test("draft_project_brief requires BOTH goal and desiredOutcome and always asks approval", () => {
  const full = { goal: "Automatizar altas", currentProcess: "Planilla manual", desiredOutcome: "Menos errores", capabilities: ["ai", " ", "data"] };
  const ok = executeAgentTool("draft_project_brief", full, "es-AR");
  assert.equal(ok.ok, true);
  assert.equal(ok.requiresApproval, true);
  assert.equal(ok.approvalAction, "prefill_project_form");
  assert.deepEqual(ok.data.brief.capabilities, ["ai", "data"]);
  assert.match(ok.data.brief.text, /^BRIEF DE PROYECTO/);
  assert.match(ok.data.brief.text, /Objetivo: Automatizar altas\nProceso actual: Planilla manual\nResultado buscado: Menos errores\nCapacidades probables: ai, data$/);
  for (const missing of ["goal", "desiredOutcome"]) {
    const args = { ...full, [missing]: "  " };
    assert.deepEqual(executeAgentTool("draft_project_brief", args), { ok: false, reason: "invalid-tool-arguments" }, missing);
  }
});

test("draft_project_brief in English omits empty optional lines", () => {
  const ok = executeAgentTool("draft_project_brief", { goal: "G", desiredOutcome: "D" }, "en-US");
  assert.match(ok.data.brief.text, /^PROJECT BRIEF — prepared with AF Agent\nGoal: G\nDesired outcome: D$/);
  assert.equal(ok.data.brief.text.includes("Current process"), false);
  assert.equal(ok.data.brief.text.includes("Likely capabilities"), false);
});

test("search_portfolio needs a query; unknown tools are refused", () => {
  assert.deepEqual(executeAgentTool("search_portfolio", { query: "  " }), { ok: false, reason: "invalid-tool-arguments" });
  assert.equal(executeAgentTool("search_portfolio", { query: "crypto risk" }).ok, true);
  assert.deepEqual(executeAgentTool("delete_everything", {}), { ok: false, reason: "unknown-tool" });
});
