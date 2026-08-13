import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import { detectProjectIntent } from "../mmlab-contact-worker/src/intent-router.js";
import {
  containsSensitiveData,
  looksLikePromptInjection,
  retrievePortfolioContext,
} from "../mmlab-contact-worker/src/portfolio-context.js";
import { executeAgentTool } from "../mmlab-contact-worker/src/agent-tool-runtime.js";

const ROOT = process.cwd();
const CASES_PATH = path.join(ROOT, "evals/af-reliability-v15.json");
const OUTPUT_PATH = path.join(ROOT, "assets/data/af-reliability.json");
const mode = process.argv.includes("--write") ? "write" : "verify";

const suiteText = fs.readFileSync(CASES_PATH, "utf8");
const suite = JSON.parse(suiteText);

function matchExpected(actual, expected) {
  return Object.entries(expected || {}).every(([key, value]) => actual?.[key] === value);
}

function evaluate(testCase) {
  if (testCase.kind === "intent") {
    const actual = detectProjectIntent(testCase.input).matched;
    return { pass: actual === testCase.expected, actual };
  }

  if (testCase.kind === "injection") {
    const actual = looksLikePromptInjection(testCase.input);
    return { pass: actual === testCase.expected, actual };
  }

  if (testCase.kind === "sensitive") {
    const actual = containsSensitiveData(testCase.input);
    return { pass: actual === testCase.expected, actual };
  }

  if (testCase.kind === "retrieval") {
    const ids = retrievePortfolioContext(testCase.input, 3).map((item) => item.id);
    const expected = testCase.expectedIncludes || [];
    return { pass: expected.every((id) => ids.includes(id)), actual: ids };
  }

  if (testCase.kind === "tool") {
    const result = executeAgentTool(testCase.tool, testCase.args, "es-AR");
    return {
      pass: matchExpected(result, testCase.expected),
      actual: {
        ok: result.ok,
        requiresApproval: result.requiresApproval,
        approvalAction: result.approvalAction,
        reason: result.reason,
      },
    };
  }

  if (testCase.kind === "source-contract") {
    const source = fs.readFileSync(path.join(ROOT, testCase.file), "utf8");
    const actual = source.includes(testCase.includes);
    return { pass: actual, actual };
  }

  return { pass: false, actual: "unknown-kind" };
}

const labels = {
  routing: "Intent routing",
  bilingual: "Bilingual routing",
  "prompt-injection": "Prompt injection",
  "sensitive-data": "Sensitive data",
  retrieval: "Verified retrieval",
  approval: "Human approval",
  "tool-policy": "Tool policy",
};

const results = suite.cases.map((testCase) => ({
  id: testCase.id,
  category: testCase.category,
  ...evaluate(testCase),
}));

const failedCases = results.filter((item) => !item.pass);
const categories = {};

for (const result of results) {
  const bucket = categories[result.category] ||= {
    label: labels[result.category] || result.category,
    total: 0,
    passed: 0,
    failed: 0,
  };
  bucket.total += 1;
  if (result.pass) bucket.passed += 1;
  else bucket.failed += 1;
}

const fingerprintFiles = [
  "mmlab-contact-worker/src/intent-router.js",
  "mmlab-contact-worker/src/portfolio-context.js",
  "mmlab-contact-worker/src/agent-tool-runtime.js",
  "mmlab-contact-worker/src/agent-endpoint.js",
  "mmlab-contact-worker/src/agent-provider.js",
];

const hash = crypto.createHash("sha256");
hash.update(suiteText);
for (const file of fingerprintFiles) {
  hash.update(fs.readFileSync(path.join(ROOT, file)));
}
const fingerprint = hash.digest("hex").slice(0, 16);

const artifact = {
  schemaVersion: 1,
  suite: "AF Reliability",
  suiteVersion: "15.0",
  scope: "deterministic-regression",
  fingerprint,
  total: results.length,
  passed: results.length - failedCases.length,
  failed: failedCases.length,
  categories,
  gates: {
    approvalBypass: categories.approval?.failed || 0,
    toolPolicyViolations: categories["tool-policy"]?.failed || 0,
    safetyRegressions:
      (categories["prompt-injection"]?.failed || 0) +
      (categories["sensitive-data"]?.failed || 0),
  },
  claims: {
    liveModelAccuracyMeasured: false,
    liveUserPromptsInDataset: false,
    deterministicRegressionGate: true,
  },
  source: "evals/af-reliability-v15.json",
  note: "Deterministic regression checks. Live model quality is evaluated separately and is not represented as accuracy here.",
};

const serialized = `${JSON.stringify(artifact, null, 2)}\n`;

if (mode === "write") {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, serialized);
}

if (!fs.existsSync(OUTPUT_PATH)) {
  console.error("Missing reliability artifact. Run with --write.");
  process.exit(1);
}

if (fs.readFileSync(OUTPUT_PATH, "utf8") !== serialized) {
  console.error("Reliability artifact is stale. Run: node scripts/run-af-evals.mjs --write");
  process.exit(1);
}

console.log(`AF Reliability: ${artifact.passed}/${artifact.total} PASS`);
for (const [key, value] of Object.entries(categories)) {
  console.log(`- ${key}: ${value.passed}/${value.total}`);
}
console.log(`Fingerprint: ${fingerprint}`);

if (failedCases.length) {
  console.error("Failed evals:");
  for (const item of failedCases) {
    console.error(`- ${item.id}: ${JSON.stringify(item.actual)}`);
  }
  process.exit(1);
}
