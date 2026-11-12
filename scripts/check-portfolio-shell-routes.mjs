import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

// Execute the shipped shell with a small DOM double: no network or dependencies.
const source = readFileSync(new URL("../assets/js/portfolio-shell.js", import.meta.url), "utf8");
function render(path, language = "en") {
  const elements = [];
  const listeners = new Map();
  const routerCalls = [];
  const text = { nodeValue: "Abrir demo", parentElement: { tagName: "P" } };
  const element = () => ({
    dataset: {}, innerHTML: "", classList: { add() {}, remove() {}, contains() { return false; } },
    setAttribute() {}, getAttribute() { return null; }, addEventListener() {},
    querySelector() { return element(); }, querySelectorAll() { return []; },
    prepend() {}, append() {}, before() {},
  });
  const root = element();
  const body = element();
  const location = new URL(`https://example.test${path}?lang=${language}`);
  runInNewContext(source, {
    URL, URLSearchParams, navigator: { language: "es-AR" },
    NodeFilter: { SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_REJECT: 2 },
    localStorage: { getItem() { return null; }, setItem() {} },
    window: {
      location, history: { replaceState() {} },
      addEventListener(name, callback) { listeners.set(name, callback); },
      MMLAB_I18N: { setLanguage(lang, options) { routerCalls.push({ lang, syncUrl: options.syncUrl }); } },
    },
    document: {
      documentElement: root, body,
      createElement() { const node = element(); elements.push(node); return node; },
      querySelector() { return element(); }, querySelectorAll() { return []; },
      createTreeWalker() {
        let visited = false;
        return { currentNode: text, nextNode() { if (visited) return false; visited = true; return true; } };
      },
    },
  });
  return { page: body.dataset.afPage, text, root, routerCalls, listeners,
    proof: elements.find(node => node.className === "af-proof-strip").innerHTML };
}

const projects = ["crypto-risk-engine", "ergo-v2", "router-llm", "local-translator", "contact-worker"];
for (const project of projects) {
  const legacy = render(`/projects/${project}.html`);
  const clean = render(`/projects/${project}`);
  assert.equal(clean.page, project);
  assert.equal(clean.proof, legacy.proof, `${project}: clean and legacy evidence must match`);
  assert.notEqual(clean.proof, render("/projects/").proof, `${project}: must not fall back to catalog evidence`);
  assert.equal(clean.text.nodeValue, legacy.text.nodeValue);
  assert.deepEqual(clean.routerCalls, legacy.routerCalls);
}
for (const path of ["/projects", "/projects/", "/projects/index", "/projects/index.html"]) {
  assert.equal(render(path).page, "catalog", path);
  assert.equal(render(path).proof, render("/projects/").proof, path);
}
for (const path of ["/projects/ergo-v2", "/projects/ergo-v2.html"]) {
  const result = render(path);
  assert.equal(result.text.nodeValue, "Open demo");
  result.listeners.get("mmlab:languagechange")({ detail: { language: "es-AR" } });
  assert.equal(result.text.nodeValue, "Abrir demo");
}
for (const path of ["/projects/router-llm", "/projects/router-llm.html"]) {
  assert.deepEqual(render(path).routerCalls, [{ lang: "en-GB", syncUrl: false }]);
}
assert.equal(render("/projects/unknown").proof, render("/projects/").proof);
console.log("Portfolio shell routing checks passed: 5 project pairs, 4 catalog aliases, ERGO translation round-trip, Router i18n, unknown fallback.");
