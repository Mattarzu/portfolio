import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { test } from "node:test";

import { rootDirectories, rootFiles } from "./prepare-pages-output.mjs";

const root = process.cwd();
const productionOrigin = "https://mattarzu-portfolio.pages.dev";
const sslipPattern = /sslip/i;
const seoUrlPattern =
  /(?:rel=["']canonical["'][^>]*href=["']([^"']+)["']|href=["']([^"']+)["'][^>]*rel=["']canonical["']|property=["']og:url["'][^>]*content=["']([^"']+)["']|content=["']([^"']+)["'][^>]*property=["']og:url["']|property=["']og:image["'][^>]*content=["']([^"']+)["']|content=["']([^"']+)["'][^>]*property=["']og:image["']|name=["']twitter:image["'][^>]*content=["']([^"']+)["']|hreflang=["'][^"']+["'][^>]*href=["']([^"']+)["']|<loc>([^<]+)<\/loc>)/gi;

export function collectSiteSurfaceFiles() {
  const paths = [];
  for (const file of rootFiles) {
    const path = join(root, file);
    if (statSync(path).isFile()) paths.push(path);
  }
  for (const directory of rootDirectories) {
    function walk(current) {
      for (const entry of readdirSync(current, { withFileTypes: true })) {
        const path = join(current, entry.name);
        if (entry.isDirectory()) walk(path);
        else paths.push(path);
      }
    }
    walk(join(root, directory));
  }
  return paths;
}

export function assertNoSslipInText(text, label) {
  assert.doesNotMatch(text, sslipPattern, `${label} must not reference sslip hostnames`);
}

export function assertProductionSeoUrls(text, label) {
  let match;
  while ((match = seoUrlPattern.exec(text))) {
    const url = match.slice(1).find(Boolean);
    if (!url || !url.startsWith("http")) continue;
    assert.ok(
      url.startsWith(`${productionOrigin}/`) || url === `${productionOrigin}/`,
      `${label}: SEO URL must use ${productionOrigin}: ${url}`,
    );
    assert.doesNotMatch(url, sslipPattern, `${label}: SEO URL still references sslip: ${url}`);
  }
}

const siteFiles = collectSiteSurfaceFiles().filter((path) => {
  const extension = extname(path);
  return [".html", ".xml", ".txt", ".webmanifest", ".json"].includes(extension);
});

test("site surface contains no sslip hostnames", () => {
  for (const path of siteFiles) {
    const text = readFileSync(path, "utf8");
    assertNoSslipInText(text, relative(root, path));
  }
});

test("canonical, Open Graph, hreflang and sitemap URLs use Pages production origin", () => {
  for (const path of siteFiles) {
    const text = readFileSync(path, "utf8");
    assertProductionSeoUrls(text, relative(root, path));
  }
});

test("sslip guard rejects synthetic legacy SEO markup", () => {
  const legacy = `<link rel="canonical" href="https://allfiction.56-126-148-93.sslip.io/" />`;
  assert.throws(
    () => assertNoSslipInText(legacy, "mutation-fixture"),
    /mutation-fixture must not reference sslip hostnames/,
  );
});