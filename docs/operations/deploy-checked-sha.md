# Checked SHA deployment (sha-v1)

## Observed baseline and scope

Inspected 2026-10-15: canonical checkout `/home/msimatt/Proyectos/portfolio`,
origin `git@github-mattarzu:Mattarzu/portfolio.git`, clean local main
`8beb6ddba9fe8b5ddb7a17951b60f561fbfcbbeb`. Fetch resolved origin/main to
`d881d80964ac1bf9bddab095eeae09936d390d6b`, matching the audited baseline.
Implementation worktree: `/home/msimatt/Documents/Codex/2026-10-15/task-3/portfolio`,
branch `fix/deploy-checked-sha-20261015`. No AGENTS.md or .agents/skills were
present in this repository or its parent directories.

Previously deploy and static checks independently reacted to main pushes.
The SSH command was only `deploy`; neither the command nor the public smoke
proved which commit was deployed. The remote implementation is absent here.

## Versioned flow

The deploy workflow calls the existing static checks workflow at the same
commit, using a local reusable workflow reference, and requires its success.
Both automatic and manual deploys require main. Checkout explicitly selects
`github.sha`. Under the existing production concurrency group, a fresh fetch
rejects a candidate that is no longer main before SSH. Existing timeout,
strict host checking, restricted key and public content smoke remain intact.

SSH receives only `deploy <40-lowercase-hex-SHA>`. Nonzero SSH, unexpected
receipt, unavailable endpoint and wrong version fail closed. The public version
check precedes the existing content smoke. No artifact transfer is implemented:
the deployment identity is the immutable Git commit, not a runner build archive.

## Remote contract and activation — pending

`PORTFOLIO_DEPLOY_CONTRACT=sha-v1` is an explicit activation flag. It must remain
unset until an operator has inspected and adapted the actual restricted SSH
command and server implementation. An unset flag fails before key setup or SSH.
This change alone does not prove end-to-end deployment correctness.

The remote handler must:

1. Parse SSH_ORIGINAL_COMMAND strictly as `deploy <40-lowercase-hex-SHA>`;
   reject all other commands, missing arguments and extra arguments, without eval.
2. Serialize every publisher, including manual/server-side publishers, with one
   server lock. Fetch the allowed repository and resolve/check out the exact SHA;
   never substitute the branch tip or pull a mutable working directory.
3. Prepare a clean release from that commit. Write `deploy-version.txt` containing
   exactly the SHA and a newline into that release, never into the current release
   before completion. Publish the release atomically only after preparation succeeds.
4. Return zero and stdout exactly `DEPLOYED <SHA>` plus newline only after the
   active release is verified. Send diagnostics to stderr. A failure must not
   report success. Retrying the same SHA must safely converge to that release.
5. Serve `/deploy-version.txt` from the active release with cache disabled, and
   preserve existing application/server configuration. Avoid mutable shared
   release contents and keep rollback available under the same lock.

Before setting the flag, validate correct SHA, invalid input, concurrent requests,
failed preparation, identical-SHA retries, version endpoint and rollback in a safe
nonproduction environment. Review the restricted command configuration without
weakening permissions. Installation, server paths, ownership and permission
changes are outside this implementation. No production connection was made.

GitHub concurrency serializes this workflow but does not promise FIFO order.
The stale check rejects older queued reruns; main can still advance after the
check. The version check detects a different active release during verification,
but cannot prevent a later external publisher. Server locking and exact-checkout
implementation remain mandatory. Workflow and repository controls can still be
changed by authorized repository writers; branch protection is outside scope.

## Validation and rollback

`python -m unittest discover -s tests -p 'test_deploy*.py' -v` exercises an offline
SSH/curl transport: success, bad receipt, SSH failure, wrong public version,
HTTP failure and invalid SHA. Mocks ensure no production traffic.
`bash -n scripts/deploy-checked-sha.sh` validates syntax. Run the existing static
checks, inspect both YAML workflows and `git diff --check` before publication.
The local validation log is adjacent to the worktree at `../validation.log`.

Requirement → implementation → evidence:

- Same-commit gates → reusable `checks`, `needs: checks` → workflow graph inspection.
- Explicit identity → validated SHA command and strict receipt → offline tests.
- Public identity → bounded version polling → mismatch/HTTP failure tests.
- Safe reruns/failure → concurrency, main freshness check, fail-closed activation →
  workflow inspection; actual server idempotency remains pending.

Rollback before activation: revert the local change. After activation, disable
publishing first; reverting to the old ungated deploy workflow reintroduces the
original issue. Never use rollback to bypass failing checks.

### Local results (2026-10-15)

PASS: transport unit tests (3 methods, including negative subcases), bash syntax,
YAML parse and dependency/concurrency assertions, all existing JavaScript syntax
checks, all site contract checks, AF reliability verification, worker tests (6/6),
Markdown fences, V3 ownership and whitespace. Existing HTML command
`npx --yes html-validate@11.5.6 index.html projects/index.html projects/crypto-risk-engine.html 404.html`
passed with exit 0 after a retry with network access; the initial restricted run
failed while acquiring the tool. Local Node was v26.11.1; CI requests Node 24.
No dedicated actionlint or shellcheck binary was available; YAML parsing is not
a substitute for GitHub's workflow engine. No Actions run was triggered.
A separate final diff review confirmed only two workflows, the transport script,
its offline tests and this contract document changed. Canonical checkout stayed clean.
