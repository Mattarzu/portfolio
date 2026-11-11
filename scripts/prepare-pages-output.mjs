// Copy the static site into dist/ for Cloudflare Pages.
// The repo root is not a safe publish directory: it also contains the Worker,
// legacy FastAPI app, docs, and tests.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const outputDirectory = "dist";

export const rootFiles = [
  "index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  "styles.css",
  "main.js",
  "contact-config.js",
  "favicon.svg",
  "preview.png",
];

export const rootDirectories = ["assets", "projects", "panels"];

export const projectNamePlaceholder = "PAGES_PROJECT_NAME";
export const pagesOriginPlaceholder = "https://PAGES_PROJECT_NAME.pages.dev";

export function preparePagesOutput(root = process.cwd()) {
  const destination = join(root, outputDirectory);
  const missing = [];

  for (const file of [...rootFiles, ...rootDirectories]) {
    if (!existsSync(join(root, file))) missing.push(file);
  }

  if (missing.length) {
    throw new Error(`Missing site files: ${missing.join(", ")}`);
  }

  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });

  for (const file of rootFiles) {
    cpSync(join(root, file), join(destination, file));
  }

  for (const directory of rootDirectories) {
    cpSync(join(root, directory), join(destination, directory), { recursive: true });
  }

  return destination;
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return fileURLToPath(import.meta.url) === resolve(entry);
}

if (isDirectRun()) {
  const destination = preparePagesOutput(process.cwd());
  console.log(`Pages output ready: ${destination}`);
}
