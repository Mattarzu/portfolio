import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { test } from "node:test";

import { preparePagesOutput } from "./prepare-pages-output.mjs";

const root = process.cwd();
const dist = preparePagesOutput(root);
const forbiddenHostPattern =
  /(?:sslip\.io|56-126-148-93\.sslip\.io|mollchef\.56-126|crypto-risk\.56-126|ergo\.56-126|api-ergo\.56-126|allfiction\.56-126)/i;
const deprecatedLightsailPattern = /56\.126\.148\.93/;

function collectHtmlFiles(directory) {
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...collectHtmlFiles(path));
    else if (extname(entry.name) === ".html") result.push(path);
  }
  return result;
}

function pagesCleanRoute(filePath) {
  const rel = relative(dist, filePath).replace(/\\/g, "/");
  if (rel === "index.html") return ["/", "/index.html"];
  if (rel.endsWith("/index.html")) {
    const dir = `/${rel.slice(0, -"/index.html".length)}`;
    return [dir, `${dir}/`, `${dir}/index.html`, `${dir}/index`];
  }
  const withoutHtml = rel.slice(0, -".html".length);
  return [`/${withoutHtml}`, `/${rel}`];
}

function publicPathToFile(urlPath, htmlPath) {
  const clean = decodeURIComponent(urlPath.split("#")[0].split("?")[0]);
  if (!clean) return null;

  const absolute = clean.startsWith("/")
    ? resolve(dist, `.${clean}`)
    : resolve(dirname(htmlPath), clean);

  if (clean.endsWith("/")) {
    const indexPath = join(absolute, "index.html");
    if (existsSync(indexPath)) return indexPath;
    return join(absolute, "index.html");
  }

  if (existsSync(absolute)) return absolute;

  if (!extname(absolute) && existsSync(`${absolute}.html`)) return `${absolute}.html`;
  return existsSync(`${absolute}.html`) ? `${absolute}.html` : absolute;
}

function loadSitemapPaths() {
  const xml = readFileSync(join(dist, "sitemap.xml"), "utf8");
  const paths = [];
  const pattern = /<loc>https:\/\/[^/]+([^<]*)<\/loc>/g;
  let match;
  while ((match = pattern.exec(xml))) {
    paths.push(match[1] || "/");
  }
  return paths;
}

const htmlFiles = collectHtmlFiles(dist);

test("published Pages output includes every public HTML route", () => {
  assert.ok(htmlFiles.length >= 10, "dist must include the public HTML surface");
  for (const file of htmlFiles) {
    for (const route of pagesCleanRoute(file)) {
      const target =
        route === "/" || route.endsWith("/")
          ? join(dist, route === "/" ? "index.html" : `${route.slice(1)}index.html`)
          : publicPathToFile(route, file);
      assert.ok(
        existsSync(target),
        `${route} must resolve to a file in dist (${relative(root, target)})`,
      );
    }
  }
});

test("sitemap paths resolve inside the dist build", () => {
  for (const urlPath of loadSitemapPaths()) {
    const target = publicPathToFile(urlPath, join(dist, "index.html"));
    assert.ok(existsSync(target), `sitemap path ${urlPath} must resolve in dist`);
  }
});

test("dist HTML keeps internal href targets inside the build", () => {
  const ignoredProtocols = /^(?:https?:|mailto:|tel:|data:|javascript:)/i;
  for (const htmlPath of htmlFiles) {
    const html = readFileSync(htmlPath, "utf8");
    const linkPattern = /\bhref=["']([^"']+)["']/g;
    let match;
    while ((match = linkPattern.exec(html))) {
      const value = match[1];
      if (!value || value.startsWith("#") || ignoredProtocols.test(value)) continue;
      const target = publicPathToFile(value, htmlPath);
      assert.ok(
        existsSync(target),
        `${relative(dist, htmlPath)}: broken local link ${value}`,
      );
    }
  }
});

test("published assets contain no sslip or retired Lightsail demo links", () => {
  for (const htmlPath of htmlFiles) {
    const html = readFileSync(htmlPath, "utf8");
    assert.doesNotMatch(
      html,
      forbiddenHostPattern,
      `${relative(dist, htmlPath)} must not reference deprecated sslip demos`,
    );
    assert.doesNotMatch(
      html,
      deprecatedLightsailPattern,
      `${relative(dist, htmlPath)} must not reference the retired Lightsail IP`,
    );
  }

  const textExtensions = new Set([".js", ".css", ".json", ".xml", ".webmanifest"]);
  function walkPublished(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walkPublished(path);
      else if (textExtensions.has(extname(entry.name))) {
        const text = readFileSync(path, "utf8");
        assert.doesNotMatch(
          text,
          forbiddenHostPattern,
          `${relative(dist, path)} must not reference deprecated sslip demos`,
        );
      }
    }
  }
  walkPublished(dist);
});