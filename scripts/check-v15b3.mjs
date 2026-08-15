import fs from "node:fs";
import assert from "node:assert/strict";

const endpoint = fs.readFileSync("mmlab-contact-worker/src/automation-endpoint.js", "utf8");
const analysis = fs.readFileSync("mmlab-contact-worker/src/automation-analysis.js", "utf8");
const worker = fs.readFileSync("mmlab-contact-worker/src/worker-v2.js", "utf8");
const wrangler = fs.readFileSync("mmlab-contact-worker/wrangler.toml", "utf8");
const tests = fs.readFileSync("mmlab-contact-worker/test/automation-analysis.test.js", "utf8");

assert.match(endpoint, /AI_AUTOMATION_TIMEOUT_MS, 24000, 8000, 30000/);
assert.doesNotMatch(endpoint, /controller\.abort\(\), 14000/);
assert.match(analysis, /reason: "provider-timeout"/);
assert.match(worker, /runtimeVersion: "[^"]+"/);
assert.match(worker, /automationTimeoutMs: automationTimeoutMs\(env\)/);
assert.match(wrangler, /AI_AUTOMATION_TIMEOUT_MS = "24000"/);
assert.match(tests, /automation provider abort is reported as provider-timeout/);

console.log("V15B.3 timeout control contracts: OK");
