import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import {
  outputDirectory,
  preparePagesOutput,
  rootDirectories,
  rootFiles,
} from "./prepare-pages-output.mjs";

const root = process.cwd();
const errors = [];

function report(message) {
  errors.push(message);
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function workflowNames() {
  const directory = join(root, ".github/workflows");
  return readdirSync(directory).filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"));
}

function assertWorkflows() {
  if (existsSync(join(root, ".github/workflows/deploy-lightsail.yml"))) {
    report("deploy-lightsail.yml must stay deleted so main cannot deploy to Lightsail");
  }

  const names = workflowNames();
  if (!names.includes("deploy-pages.yml")) {
    report("deploy-pages.yml is missing");
  }
  if (!names.includes("static-checks.yml")) {
    report("static-checks.yml is missing");
  }

  for (const name of names) {
    const text = read(join(".github/workflows", name));
    if (text.includes("56.126.148.93") || text.includes("ubuntu@")) {
      report(`${name} still contains the Lightsail deploy target`);
    }
    const pushesOnPush = /^\s*push\s*:/m.test(text);
    if (pushesOnPush && name !== "static-checks.yml") {
      report(`${name} triggers on push; only static-checks.yml may do that`);
    }
  }

  if (!names.includes("deploy-pages.yml")) return;

  const pages = read(".github/workflows/deploy-pages.yml");
  const required = [
    "workflow_dispatch:",
    "refs/heads/main",
    "secrets.CLOUDFLARE_API_TOKEN",
    "secrets.CLOUDFLARE_ACCOUNT_ID",
    "vars.CLOUDFLARE_PAGES_PROJECT",
    "cloudflare/wrangler-action@v4",
    "pages deploy dist",
    "--branch=main",
    "node scripts/prepare-pages-output.mjs",
    "node scripts/check-pages-cutover.mjs",
  ];

  for (const marker of required) {
    if (!pages.includes(marker)) report(`deploy-pages.yml missing ${marker}`);
  }

  if (pages.includes("wrangler deploy") || pages.includes("command: deploy")) {
    report("deploy-pages.yml must publish Pages and must not deploy the Worker");
  }
}

function assertWorkerConfig() {
  const toml = read("mmlab-contact-worker/wrangler.toml");
  const match = toml.match(/^ALLOWED_ORIGIN = "([^"]*)"$/m);
  if (!match) {
    report("wrangler.toml is missing ALLOWED_ORIGIN");
    return;
  }

  const origins = match[1].split(",").map((origin) => origin.trim()).filter(Boolean);
  const expected = [
    "https://allfiction.56-126-148-93.sslip.io",
    "https://mattarzu.github.io",
    "http://127.0.0.1:8081",
    "http://localhost:8081",
    "https://mattarzu-portfolio.pages.dev",
  ];

  if (origins.join("\n") !== expected.join("\n")) {
    report(`ALLOWED_ORIGIN must stay an exact list ending in the Pages production origin.\n  actual: ${origins.join(", ")}`);
  }

  if (origins.some((origin) => origin.includes("*"))) {
    report("ALLOWED_ORIGIN must not use a wildcard");
  }

  if (!toml.includes("takes effect only after the next wrangler deploy")) {
    report("wrangler.toml must say the Pages origin takes effect only after the next wrangler deploy");
  }
}

function assertFrontendStillUsesWorker() {
  const config = read("contact-config.js");
  const endpoints = [
    'window.MMLAB_CONTACT_ENDPOINT = "https://mmlab-contact-api.mattm2.workers.dev/contact"',
    'window.MMLAB_AI_CHAT_ENDPOINT = "https://mmlab-contact-api.mattm2.workers.dev/ai-chat"',
    'window.MMLAB_AUTOMATION_ANALYZE_ENDPOINT = "https://mmlab-contact-api.mattm2.workers.dev/automation-analyze"',
    'window.MMLAB_AUTOMATION_HEALTH_ENDPOINT = "https://mmlab-contact-api.mattm2.workers.dev/automation-health"',
    'window.MMLAB_AGENT_RUN_ENDPOINT = "https://mmlab-contact-api.mattm2.workers.dev/agent-run"',
    'window.MMLAB_AGENT_HEALTH_ENDPOINT = "https://mmlab-contact-api.mattm2.workers.dev/agent-health"',
  ];

  for (const endpoint of endpoints) {
    if (!config.includes(endpoint)) report(`contact-config.js no longer points at the Worker: ${endpoint}`);
  }
}

function assertDocs() {
  const cutover = read("docs/operations/cloudflare-pages-cutover.md");
  const readme = read("README.md");
  const checklist = read("docs/operations/current-architecture-checklist.md");
  const phrases = [
    "Cloudflare Pages",
    "PAGES_PROJECT_NAME",
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_PAGES_PROJECT",
    "takes effect only after the next wrangler deploy",
    "56.126.148.93",
    "workflow_dispatch",
  ];

  for (const phrase of phrases) {
    if (!cutover.includes(phrase)) report(`cloudflare-pages-cutover.md missing ${phrase}`);
  }

  for (const [path, text] of [
    ["README.md", readme],
    ["docs/operations/current-architecture-checklist.md", checklist],
  ]) {
    if (!text.includes("Cloudflare Pages") || !text.includes("legado")) {
      report(`${path} must name Cloudflare Pages and mark Lightsail as legado`);
    }
  }
}

function walk(directory, visit) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path, visit);
    else visit(path);
  }
}

function assertPublishedOutput() {
  const destination = preparePagesOutput(root);
  const topLevel = new Set(readdirSync(destination));
  const expected = new Set([...rootFiles, ...rootDirectories]);

  for (const name of topLevel) {
    if (!expected.has(name)) report(`dist contains unexpected entry ${name}`);
  }
  for (const name of expected) {
    if (!topLevel.has(name)) report(`dist is missing ${name}`);
  }

  const forbiddenSegments = new Set([
    "mmlab-contact-worker",
    "mmlab-contact-api",
    "docs",
    "scripts",
    "evals",
    ".github",
    ".git",
    ".vscode",
    "node_modules",
  ]);

  walk(destination, (path) => {
    const parts = relative(destination, path).split("/");
    if (parts.some((part) => forbiddenSegments.has(part))) {
      report(`published path escapes the site allowlist: ${relative(root, path)}`);
    }
    if (path.endsWith(".py") || path.endsWith("wrangler.toml") || path.endsWith(".dev.vars")) {
      report(`published file is not part of the static site: ${relative(root, path)}`);
    }

    const textExtensions = new Set([".html", ".js", ".css", ".json", ".txt", ".xml", ".svg", ".webmanifest", ".md"]);
    const extension = path.slice(path.lastIndexOf("."));
    if (!textExtensions.has(extension)) return;
    const text = readFileSync(path, "utf8");
    if (text.includes("TELEGRAM_CHAT_ID") || text.includes("1463839709") || text.includes("GEMINI_API_KEY")) {
      report(`published file contains Worker configuration: ${relative(root, path)}`);
    }
  });

  const home = readFileSync(join(destination, "index.html"), "utf8");
  const project = readFileSync(join(destination, "projects/crypto-risk-engine.html"), "utf8");
  const config = readFileSync(join(destination, "contact-config.js"), "utf8");
  const reliability = readFileSync(join(destination, "assets/data/af-reliability.json"), "utf8");
  const markers = [
    [home, "Crypto Risk Engine"],
    [home, "AF Intelligence"],
    [home, "assets/js/home-v3.js"],
    [config, "home-v15.js"],
    [reliability, "deterministic-regression"],
    [reliability, '"failed": 0'],
    [reliability, '"deterministicRegressionGate": true'],
    [project, "Redis Streams"],
  ];

  for (const [source, marker] of markers) {
    if (!source.includes(marker)) report(`published output is missing live-verify marker ${marker}`);
  }

  for (const asset of [
    "assets/css/home-v3.css",
    "assets/js/home-v3.js",
    "assets/js/home-v15.js",
    "assets/css/home-v15.css",
    "assets/brand/allfiction-software-hero-960.webp",
  ]) {
    if (!statSync(join(destination, asset), { throwIfNoEntry: false })?.isFile()) {
      report(`published output is missing ${asset}`);
    }
  }
}

assertWorkflows();
assertWorkerConfig();
assertFrontendStillUsesWorker();
assertDocs();
assertPublishedOutput();

if (errors.length) {
  console.error("Pages cutover checks failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Pages cutover checks passed.");
console.log(`Publish directory: ${outputDirectory}`);
