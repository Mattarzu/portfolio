import fs from "node:fs";
import assert from "node:assert/strict";

const analysis = fs.readFileSync("mmlab-contact-worker/src/automation-analysis.js", "utf8");
const endpoint = fs.readFileSync("mmlab-contact-worker/src/automation-endpoint.js", "utf8");
const worker = fs.readFileSync("mmlab-contact-worker/src/worker-v2.js", "utf8");
const wrangler = fs.readFileSync("mmlab-contact-worker/wrangler.toml", "utf8");
const frontend = fs.readFileSync("assets/js/home-v9.js", "utf8");
const config = fs.readFileSync("contact-config.js", "utf8");
const benchmark = fs.readFileSync("scripts/benchmark-automation-v15b4.mjs", "utf8");

assert.match(analysis, /export function extractAutomationTelemetry/);
assert.match(analysis, /promptTokenCount/);
assert.match(analysis, /candidatesTokenCount/);
assert.match(analysis, /thoughtsTokenCount/);
assert.match(analysis, /totalTokenCount/);
assert.match(endpoint, /event: "af_automation_runtime"/);
assert.match(endpoint, /promptLogged: false/);
assert.match(endpoint, /responseLogged: false/);
assert.match(worker, /runtimeVersion: "v15b4"/);
assert.match(worker, /providerUsageExposed: true/);
assert.match(worker, /runtimeMetadataLogging: automationRuntimeLoggingEnabled\(env\)/);
assert.match(worker, /runtimeLogPayloads: false/);
assert.match(wrangler, /AI_RUNTIME_LOGS = "true"/);
assert.match(wrangler, /\[observability\]/);
assert.match(wrangler, /head_sampling_rate = 1/);
assert.match(frontend, /totalTokens/);
assert.match(frontend, /PROVIDER TIMEOUT/);
assert.match(config, /20260815-v15b4/);
assert.match(benchmark, /AF_BENCH_SAMPLES/);

console.log("V15B.4 runtime telemetry contracts: OK");
