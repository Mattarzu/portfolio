import { spawnSync } from "node:child_process";

const files = [
  "scripts/check-dist-routes.mjs",
  "scripts/check-i18n-parity.mjs",
  "scripts/check-contact-form-local.mjs",
];

const result = spawnSync(process.execPath, ["--test", ...files], {
  cwd: process.cwd(),
  encoding: "utf8",
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

const count = Number(result.stdout.match(/# tests (\d+)/)?.[1] || 0);

if (result.status !== 0) {
  console.error(`Portfolio local tests failed (${count} tests executed).`);
  process.exit(result.status ?? 1);
}

console.log(`Portfolio local test suite passed (${count} tests).`);