import fs from "node:fs";
import assert from "node:assert/strict";

const analysis = fs.readFileSync("mmlab-contact-worker/src/automation-analysis.js", "utf8");
const worker = fs.readFileSync("mmlab-contact-worker/src/worker-v2.js", "utf8");
const tests = fs.readFileSync("mmlab-contact-worker/test/automation-analysis.test.js", "utf8");

assert.match(analysis, /responseJsonSchema: AUTOMATION_ANALYSIS_SCHEMA/);
assert.doesNotMatch(analysis, /responseSchema: AUTOMATION_ANALYSIS_SCHEMA/);
assert.match(worker, /runtimeVersion: "v15b2"/);
assert.match(tests, /generationConfig\.responseJsonSchema\.type/);

console.log("V15B.2 Gemini JSON Schema contracts: OK");
