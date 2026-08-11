# Security policy

Echo Feedback Board is a multi-tenant Cloudflare Worker (D1 + KV + Analytics Engine) running a
public feedback board plus a tenant-authenticated management API.

## Fixed in this consolidation pass

1. **Timing side-channel in the credential check.** `authOk()` compared both the
   `X-Echo-API-Key` header and the `Authorization: Bearer` token with a raw `===`. Replaced
   both with a constant-time `timingSafeEqual`. The fail-closed behavior when `ECHO_API_KEY`
   isn't configured (`if (!env.ECHO_API_KEY) return false;`) was already correct and is
   unchanged.
2. **`package.json` hygiene.** The manifest had never been customized past `npm init`
   defaults: `main: "index.js"` pointing at a file that doesn't exist, `license: "ISC"`, no
   `private` flag, and a stub `test` script that always exited 1. Added `private: true`, a
   real `test` script, and removed the unused boilerplate fields.
3. **`@cloudflare/workers-types` bumped `^4.20260317.1` -> `^5.0.0`** to clear all 6
   `npm audit` findings (undici/ws, `wrangler`/`miniflare` dev-tooling transitives) -- the
   pinned version conflicted enough with the current `wrangler@^4.77.0` range (resolves to
   4.120.1, peer-requires `workers-types@^5.x`) that `npm audit fix` couldn't resolve the
   dependency tree cleanly. `npm audit` now reports 0 vulnerabilities.

## What was already correct when found

**The auth model in this repo was already well-scoped.** Every management route (not just
writes) requires auth, including GET `/posts`, `/boards`, `/roadmap`, `/changelogs`,
`/analytics`, `/tenants/me` -- this repo's own commit history shows an earlier, deliberate fix
("add auth to management endpoints") that predates this consolidation pass. The public
`/public/:tenant_id/*` surface is consistently field-picked to exclude `author_email`
everywhere a post or comment is returned (`GET /public/.../posts`, `GET
/public/.../posts/:id`), while the authenticated admin views intentionally return the full
row including `author_email` for follow-up. This is the correct design, not something this
pass needed to change -- recorded here so a future reviewer doesn't have to re-derive it.

## Supported version

Security fixes target the current `main` branch. Historical commits are retained for evidence
and are not patched in place.

## Report a vulnerability

Do not open a public issue for a suspected vulnerability. Send a private report to
`security@echo-op.com` with:

- affected endpoint and exact revision;
- reproduction steps and expected impact;
- safe contact details for follow-up.

Never include a live `ECHO_API_KEY` in a report.
