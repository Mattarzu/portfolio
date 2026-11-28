import { spawnSync } from "node:child_process";

const files = [
  "scripts/check-dist-routes.mjs",
  "scripts/check-i18n-parity.mjs",
  "scripts/check-contact-form-local.mjs",
  "scripts/check-public-urls.mjs",
];

const result = spawnSync(process.execPath, ["--test", "--test-reporter=tap", ...files], {
  cwd: process.cwd(),
  encoding: "utf8",
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

const output = `${result.stdout || ""}\n${result.stderr || ""}`;
const count = Number(output.match(/(?:#|ℹ)\s*tests\s+(\d+)/iu)?.[1] || 0);

if (result.status !== 0) {
  console.error(`Portfolio local tests failed (${count} tests executed).`);
  process.exit(result.status ?? 1);
}

console.log(`Portfolio local test suite passed (${count} tests).`);