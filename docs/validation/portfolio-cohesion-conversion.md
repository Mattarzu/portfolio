# Validation — Portfolio Cohesion & Conversion

Date: 2026-07-27
Branch: `agent/portfolio-cohesion-conversion`
Base: `67c82e7af440c467ad6ac8a69724c0c1ca8db040`

## Pre-PR checks

- Branch is ahead of and not behind the validated base.
- Modified HTML: no duplicate IDs.
- `assets/js/home-v3.js`: syntax parsed.
- `assets/js/contact-form.js`: syntax parsed.
- `assets/js/portfolio-shell.js`: syntax parsed.
- `assets/css/home-v3.css`: balanced blocks.
- `assets/css/portfolio-shell.css`: balanced blocks.
- Catalogue and three featured cases load both shared shell assets.
- Home includes one direct contact form and one modular delivery script.
- V3 JavaScript remains below its 30 KB budget; new assets have explicit budgets.

## Merge gates

- GitHub `static checks` must pass.
- Visual review must cover desktop and mobile, ES and EN.
- Contact smoke test must confirm a successful Worker response without exposing secrets.
- Merge remains squash-only after review.
