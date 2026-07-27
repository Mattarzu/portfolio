# Portfolio Cohesion & Conversion

## Goal

Bring the project catalogue and the three featured case studies into the visual, navigation and language system introduced by Portfolio V3, while adding a direct conversion path that reuses the existing contact Worker.

## Scope

- Shared V3 shell for the catalogue, Crypto Risk Engine, ERGO V2 and PolyLLM Router.
- Consistent header, bilingual navigation, proof strip and closing conversion panel.
- English translation bridge for the legacy ERGO page.
- Production-aligned canonical and social metadata for ERGO and PolyLLM.
- Direct contact form on the home page using the existing Cloudflare Worker and Telegram delivery.
- Language-aware placeholders and accessibility labels.
- Static checks that require the shared shell and enforce asset budgets.

## Operational boundaries

- No Worker code, secret or provider configuration changes.
- No production deployment from this branch.
- No analytics vendor or tracking cookie added.
- CV download is intentionally excluded until a verified ES/EN CV source is provided; the portfolio must not invent professional history.

## Validation

- JavaScript syntax parsed for `home-v3.js`, `contact-form.js` and `portfolio-shell.js`.
- CSS braces balanced for V3 and shared shell styles.
- No duplicate IDs in modified HTML pages.
- Every target page references both shared shell assets exactly once.
- Contact payload uses the existing Worker contract and field limits.
- Repository `static checks` remains the merge gate.
