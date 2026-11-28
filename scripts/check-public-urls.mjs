import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { test } from "node:test";

import { rootDirectories, rootFiles } from "./prepare-pages-output.mjs";

const root = process.cwd();
const productionOrigin = "https://mattarzu-portfolio.pages.dev";
const legacyHostPattern = /(?:sslip|lightsail|56\.126\.148\.93)/i;

const seoAttrPatternSource =
  String.raw`(?:rel=["']canonical["'][^>]*href=["']([^"']+)["']|href=["']([^"']+)["'][^>]*rel=["']canonical["']|property=["']og:url["'][^>]*content=["']([^"']+)["']|content=["']([^"']+)["'][^>]*property=["']og:url["']|property=["']og:image["'][^>]*content=["']([^"']+)["']|content=["']([^"']+)["'][^>]*property=["']og:image["']|name=["']twitter:image["'][^>]*content=["']([^"']+)["']|hreflang=["'][^"']+["'][^>]*href=["']([^"']+)["']|<loc>([^<]+)<\/loc>)`;

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

export function collectSeoUrls(text) {
  const urls = [];
  const attrPattern = new RegExp(seoAttrPatternSource, "gi");

  for (const match of text.matchAll(attrPattern)) {
    const url = match.slice(1).find(Boolean);
    if (url?.startsWith("http")) urls.push(url);
  }

  for (const match of text.matchAll(/^Sitemap:\s*(\S+)/gim)) {
    urls.push(match[1]);
  }

  return urls;
}

export function assertNoSslipInText(text, label) {
  assert.doesNotMatch(text, /sslip/i, `${label} must not reference sslip hostnames`);
}

export function assertPublicSeoUrl(url, label) {
  assert.match(
    url,
    /^https:\/\//,
    `${label}: public SEO URLs must use HTTPS, not legacy cleartext: ${url}`,
  );
  assert.doesNotMatch(
    url,
    legacyHostPattern,
    `${label}: public SEO URL still references a legacy host: ${url}`,
  );

  const origin = new URL(url).origin;
  assert.equal(
    origin,
    productionOrigin,
    `${label}: public SEO URL must use ${productionOrigin}, got ${origin} (${url})`,
  );
}

export function assertProductionSeoUrls(text, label) {
  for (const url of collectSeoUrls(text)) {
    assertPublicSeoUrl(url, label);
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

test("canonical, Open Graph, hreflang, sitemap and robots Sitemap use Pages production origin", () => {
  for (const path of siteFiles) {
    const text = readFileSync(path, "utf8");
    assertProductionSeoUrls(text, relative(root, path));
  }
});

test("SEO URL scan processes consecutive fixtures without global-regex carryover", () => {
  const firstFixture = [
    `<link rel="canonical" href="https://mattarzu-portfolio.pages.dev/" />`,
    `<meta property="og:url" content="https://mattarzu-portfolio.pages.dev/projects/" />`,
  ].join("\n");
  const secondFixture =
    `<link rel="canonical" href="https://other-example.pages.dev/skipped-if-bug" />`;

  assertProductionSeoUrls(firstFixture, "fixture-first");
  assert.throws(
    () => assertProductionSeoUrls(secondFixture, "fixture-second"),
    /fixture-second: public SEO URL must use https:\/\/mattarzu-portfolio\.pages\.dev/,
  );
});

test("legacy public URL guards reject synthetic SEO fixtures", () => {
  const cases = [
    {
      label: "sslip-canonical",
      text: `<link rel="canonical" href="https://allfiction.56-126-148-93.sslip.io/" />`,
      pattern: /legacy host: https:\/\/allfiction\.56-126-148-93\.sslip\.io\//,
    },
    {
      label: "lightsail-ip-robots-sitemap",
      text: "User-agent: *\nSitemap: https://56.126.148.93/sitemap.xml\n",
      pattern: /legacy host: https:\/\/56\.126\.148\.93\/sitemap\.xml/,
    },
    {
      label: "lightsail-hostname",
      text: `<meta property="og:url" content="https://portfolio.lightsail.aws.dev/" />`,
      pattern: /legacy host: https:\/\/portfolio\.lightsail\.aws\.dev\//,
    },
    {
      label: "http-scheme",
      text: `<link rel="canonical" href="http://mattarzu-portfolio.pages.dev/" />`,
      pattern: /must use HTTPS/,
    },
    {
      label: "foreign-pages-dev",
      text: `<link rel="canonical" href="https://foreign-project.pages.dev/" />`,
      pattern: /must use https:\/\/mattarzu-portfolio\.pages\.dev/,
    },
  ];

  for (const item of cases) {
    assert.throws(() => assertProductionSeoUrls(item.text, item.label), item.pattern);
  }
});