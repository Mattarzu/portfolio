import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { runInNewContext } from "node:vm";
import { test } from "node:test";

const root = process.cwd();
const PRIMARY = ["es-AR", "en-GB"];

function loadTranslations() {
  const sandbox = { window: {} };
  sandbox.window = sandbox;
  runInNewContext(readFileSync(join(root, "assets/i18n/translations.js"), "utf8"), sandbox);
  runInNewContext(readFileSync(join(root, "assets/i18n/landing-translations.js"), "utf8"), sandbox);
  runInNewContext(readFileSync(join(root, "assets/i18n/project-pages-translations.js"), "utf8"), sandbox);
  return sandbox.window.MMLAB_TRANSLATIONS;
}

function readSupportedLanguages() {
  const source = readFileSync(join(root, "assets/js/i18n.js"), "utf8");
  const block = source.match(/const SUPPORTED_LANGUAGES = \[([\s\S]*?)\];/)?.[1] || "";
  return [...block.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

function collectHtmlFiles(directory) {
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.name === "dist" || entry.name === ".git" || entry.name === "node_modules") continue;
    if (entry.isDirectory()) result.push(...collectHtmlFiles(path));
    else if (entry.name.endsWith(".html")) result.push(path);
  }
  return result;
}

const translations = loadTranslations();
const supportedLanguages = readSupportedLanguages();

test("es-AR and en-GB dictionaries stay in sync", () => {
  const esKeys = Object.keys(translations["es-AR"]);
  const enKeys = Object.keys(translations["en-GB"]);
  const missingInEn = esKeys.filter((key) => !(key in translations["en-GB"]));
  const missingInEs = enKeys.filter((key) => !(key in translations["es-AR"]));
  assert.equal(
    missingInEn.length,
    0,
    `en-GB missing ${missingInEn.length} keys present in es-AR: ${missingInEn.slice(0, 8).join(", ")}`,
  );
  assert.equal(
    missingInEs.length,
    0,
    `es-AR missing ${missingInEs.length} keys present in en-GB: ${missingInEs.slice(0, 8).join(", ")}`,
  );
});

test("language selector contract exposes Spanish and English", () => {
  assert.ok(
    supportedLanguages.includes("es-AR") && supportedLanguages.includes("en-GB"),
    "assets/js/i18n.js must list es-AR and en-GB in SUPPORTED_LANGUAGES",
  );

  const indexHtml = readFileSync(join(root, "index.html"), "utf8");
  assert.ok(
    indexHtml.includes('data-language="es-AR"') && indexHtml.includes('data-language="en-GB"'),
    "index.html must expose ES/EN switch buttons",
  );
});

test("home bilingual markup and default lang stay aligned", () => {
  const indexHtml = readFileSync(join(root, "index.html"), "utf8");
  const esSpans = (indexHtml.match(/data-lang="es"/g) || []).length;
  const enSpans = (indexHtml.match(/data-lang="en"/g) || []).length;
  assert.equal(esSpans, enSpans, `index.html data-lang pairs must match (es=${esSpans}, en=${enSpans})`);

  const langOnIndex = indexHtml.match(/<html[^>]*\slang="([^"]+)"/i)?.[1];
  assert.match(langOnIndex, /^(es-AR|en-GB)$/, "index default lang must be es-AR or en-GB");
});

test("HTML lang attributes and data-lang spans stay valid on public pages", () => {
  let bilingualPages = 0;
  for (const htmlPath of collectHtmlFiles(root)) {
    const rel = relative(root, htmlPath);
    const html = readFileSync(htmlPath, "utf8");
    const lang = html.match(/<html[^>]*\slang="([^"]+)"/i)?.[1];
    if (lang) {
      assert.match(
        lang,
        /^(es-AR|en-GB|ca|es-ES|fr|it|pt|ru|zh-CN)$/,
        `${rel}: unsupported lang attribute ${lang}`,
      );
    }

    if (html.includes('data-lang="es"')) {
      const pageEs = (html.match(/data-lang="es"/g) || []).length;
      const pageEn = (html.match(/data-lang="en"/g) || []).length;
      assert.equal(pageEs, pageEn, `${rel}: data-lang es/en spans must match (${pageEs} vs ${pageEn})`);
      bilingualPages += 1;
    }
  }
  assert.ok(bilingualPages >= 1, "at least one page must expose bilingual data-lang spans");
});

test("project pages load i18n runtime and cover data-i18n keys in ES/EN", () => {
  let selectorPages = 0;
  for (const htmlPath of collectHtmlFiles(root)) {
    const rel = relative(root, htmlPath);
    if (rel === "index.html") continue;

    const html = readFileSync(htmlPath, "utf8");
    if (html.includes("data-language-selector")) {
      selectorPages += 1;
      assert.ok(
        html.includes("assets/js/i18n.js"),
        `${rel}: multi-language pages must load assets/js/i18n.js`,
      );
    }

    const i18nNodes = [...html.matchAll(/data-i18n="([^"]+)"/g)].map((item) => item[1]);
    for (const key of i18nNodes) {
      for (const language of PRIMARY) {
        assert.ok(
          translations[language]?.[key],
          `${rel}: missing ${language} translation for data-i18n="${key}"`,
        );
      }
    }
  }
  assert.ok(selectorPages >= 1, "at least one project page must expose a language selector");
});