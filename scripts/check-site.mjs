import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";

const root = process.cwd();
const canonicalOrigin = "https://allfiction.56-126-148-93.sslip.io";
const errors = [];

function collectFiles(directory, extension, result = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(path, extension, result);
    else if (extname(entry.name) === extension) result.push(path);
  }
  return result;
}

function report(message) {
  errors.push(message);
}

function publicPathToFile(urlPath, htmlPath) {
  const clean = decodeURIComponent(urlPath.split("#")[0].split("?")[0]);
  if (!clean) return null;

  const absolute = clean.startsWith("/")
    ? resolve(root, `.${clean}`)
    : resolve(dirname(htmlPath), clean);

  if (clean.endsWith("/")) return join(absolute, "index.html");
  return absolute;
}

function checkLocalReferences(htmlPath, html) {
  const referencePattern = /\b(?:href|src)=["']([^"']+)["']/g;
  const ignoredProtocols = /^(?:https?:|mailto:|tel:|data:|javascript:)/i;
  let match;

  while ((match = referencePattern.exec(html))) {
    const value = match[1];
    if (!value || value.startsWith("#") || ignoredProtocols.test(value)) continue;
    const target = publicPathToFile(value, htmlPath);
    if (target && !existsSync(target)) {
      report(`${relative(root, htmlPath)}: referencia local inexistente: ${value}`);
    }
  }
}

function checkDuplicateIds(htmlPath, html) {
  const ids = new Map();
  const idPattern = /\bid=["']([^"']+)["']/g;
  let match;

  while ((match = idPattern.exec(html))) {
    ids.set(match[1], (ids.get(match[1]) || 0) + 1);
  }

  for (const [id, count] of ids) {
    if (count > 1) report(`${relative(root, htmlPath)}: id duplicado "${id}" (${count})`);
  }
}

function checkCanonical(htmlPath, html) {
  const match = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (!match) return;
  if (!match[1].startsWith(canonicalOrigin)) {
    report(`${relative(root, htmlPath)}: canonical fuera del origen oficial: ${match[1]}`);
  }
}

for (const htmlPath of collectFiles(root, ".html")) {
  const html = readFileSync(htmlPath, "utf8");
  checkLocalReferences(htmlPath, html);
  checkDuplicateIds(htmlPath, html);
  checkCanonical(htmlPath, html);

  if (/\bM M LAB\b|\bMM LAB PANDA\b|\bM M PANDA\b/.test(html)) {
    report(`${relative(root, htmlPath)}: referencia visible a la marca anterior`);
  }
}

const home = readFileSync(join(root, "index.html"), "utf8");
for (const marker of [
  "Crypto Risk Engine",
  "Qivox Gym",
  "PolyLLM Router",
  "AF Intelligence",
  "data-contact-form",
  "contact-config.js",
  "contact-form.js",
  "home-v3.js"
]) {
  if (!home.includes(marker)) report(`index.html: falta marcador requerido "${marker}"`);
}

const cohesivePages = [
  "projects/index.html",
  "projects/crypto-risk-engine.html",
  "projects/ergo-v2.html",
  "projects/router-llm.html"
];

for (const path of cohesivePages) {
  const html = readFileSync(join(root, path), "utf8");
  for (const marker of ["portfolio-shell.css", "portfolio-shell.js"]) {
    if (!html.includes(marker)) report(\`scripts/check-site.mjs: falta capa V3 compartida "\${marker}"\`);
  }
}

const manifest = JSON.parse(readFileSync(join(root, "site.webmanifest"), "utf8"));
if (manifest.start_url !== "/" || manifest.scope !== "/") {
  report("site.webmanifest: start_url y scope deben apuntar a /");
}

const budgets = [
  ["index.html", 80_000],
  ["assets/css/home-v3.css", 60_000],
  ["assets/js/home-v3.js", 30_000],
  ["assets/js/contact-form.js", 8_000],
  ["assets/css/portfolio-shell.css", 20_000],
  ["assets/js/portfolio-shell.js", 28_000],
  ["assets/brand/allfiction-software-hero-960.webp", 100_000],
  ["assets/brand/allfiction-icon-512.png", 120_000],
  ["preview.png", 250_000]
];

for (const [path, maximum] of budgets) {
  const size = statSync(join(root, path)).size;
  if (size > maximum) report(`${path}: ${size} bytes supera el presupuesto de ${maximum}`);
}

if (errors.length) {
  console.error("Site checks failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Site checks passed.");
console.log(`HTML files checked: ${collectFiles(root, ".html").length}`);
for (const [path] of budgets) {
  console.log(`${path}: ${statSync(join(root, path)).size} bytes`);
}
