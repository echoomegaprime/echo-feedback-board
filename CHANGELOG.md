# Changelog

## Unreleased -- consolidation pass (2026-08-11)

### Fixed
- Constant-time `timingSafeEqual` for both credential paths (`X-Echo-API-Key` and
  `Authorization: Bearer`) in `authOk()` (was raw `===`).
- `package.json` never customized past `npm init` defaults -- added `private: true`, a real
  `test` script, removed unused boilerplate.
- Bumped `@cloudflare/workers-types` `^4.20260317.1` -> `^5.0.0` to clear all 6 `npm audit`
  findings (now 0 vulnerabilities).

### Added
- `tests/auth.test.mjs` -- 10 tests covering the public routes (health, `/public/*`), the
  management auth gate (both credential paths, positive and negative), the fail-closed
  no-key-configured case, and a same-length-vs-different-length wrong-key timing-shape check.
- Full governance set (README, SECURITY, CONTRIBUTING, CODE_OF_CONDUCT, LICENSE, CI).

### Notable: nothing else needed fixing
This repo's auth model and public-API field-picking were already correct when found -- see
SECURITY.md for what was verified, not changed.

## 1.0.0 -- original release

Multi-tenant public feedback board: posts, upvoting, admin status tracking, internal
comments, roadmap, changelogs, per-tenant analytics, AI-assisted feedback summarization.
