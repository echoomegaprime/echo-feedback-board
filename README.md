# Echo Feedback Board

Multi-tenant public feedback board on Cloudflare Workers -- a Canny/UserVoice alternative.
Feature requests and bug reports with upvoting, admin status tracking and internal notes,
public roadmap, changelogs, per-tenant analytics, and AI-assisted feedback summarization.

## Endpoints

| Access | Method | Path | Description |
|---|---|---|---|
| Public | GET | `/`, `/health`, `/status` | Health |
| Public | GET/POST | `/public/:tenant_id/*` | The public board: boards, posts, voting, comments, roadmap, changelogs |
| Authenticated | GET/POST/PUT/DELETE | everything else | Tenant/board/post management, internal comments, analytics, AI summarization |

## Authentication

Every route other than the ones above requires `X-Echo-API-Key` (or `Authorization: Bearer`),
compared to `env.ECHO_API_KEY` in constant time -- **including management GET routes**, unlike
several sibling repos in this consolidation campaign that had a real bug exempting every GET
from auth. This repo's auth model was already correctly scoped when found (an earlier commit
in its own history explicitly added auth to management endpoints); this pass only fixed the
timing side-channel in the comparison. See [SECURITY.md](SECURITY.md).

## Verify

```powershell
npm install
npm test
```

## Security

See [SECURITY.md](SECURITY.md) to report a vulnerability -- never as a public issue.

## License

See [LICENSE](LICENSE). Contributions: see [CONTRIBUTING.md](CONTRIBUTING.md).
