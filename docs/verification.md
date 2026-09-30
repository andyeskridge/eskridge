# Implementation verification

Checked September 29, 2026 on Windows with Bun 1.4.2, Node 24 and Edge. These are local development and compiled-Worker results; production acceptance remains in `launch-checklist.md`.

| Check | Result |
| --- | --- |
| Frozen dependency installation, including the versioned EmDash patch | Passed |
| Seed validation | Passed; four initial entries, all drafts |
| Biome and Astro formatting | Passed |
| Astro type checks | 43 files; no errors, warnings or hints |
| Bun security, seed and raw snapshot tests | Four passed; 29 assertions |
| Playwright desktop and mobile acceptance | All ten passed in one complete run |
| WCAG A/AA automated checks | No violations on the tested pages in both themes |
| Production build and Wrangler deployment dry run | Passed |
| Compiled Worker scheduled publication | Due article published and served without rebuilding; local fixture then removed |
| Built development sign-in bypass | Rejected with 403 |
| Compiled Worker with production environment variables on loopback | Canonical URLs, robots, sitemap and RSS passed; drafts absent; owner setup guarded; signed preview private and noindex in both HTTP headers and markup |
| Raw D1 restoration into isolated local SQLite | 83 tables; integrity and foreign-key checks passed |
| Final local editorial state | Only Home, About, introductory article and real homelab project; all drafts |

Browser coverage includes private/tampered previews, staged edits and revisions, publishing without deployment, scheduled draft isolation, media upload, published-only search/topics/RSS, archives and pagination, CMS homepage ordering, project filtering, light/dark persistence, keyboard access, reduced motion, redirects, 410/404 responses, pending comments, owner/returning-reader moderation, threaded replies, unsafe input, private email, native spam/rate rejection, and limited REST/MCP credentials. The homepage regression includes publishing, unpublishing and replacing the initial selection, then confirming another draft reordering stays private until published.

Manual review screenshots are in ignored `output/playwright/review-*.png`: desktop homepage/project and mobile homepage/article/About. They show the real draft copy temporarily rendered on loopback for review. The entries were returned to draft afterward. No Cloudflare resource or domain route was changed.

The dry run reports 15,803.88 KiB uncompressed and 4,110.16 KiB gzip. This fits the current [64 MiB uncompressed Worker limit](https://developers.cloudflare.com/workers/platform/limits/); remote startup time and request CPU limits still require staging measurement. The build warns about a large native administration chunk.

## Remaining environment and owner checks

Cloudflare authentication, chosen account and private API credentials are unavailable. Provisioning, remote D1 migrations, staging deployment, environment identity checks, production-domain passkeys, live Turnstile, Cloudflare image transformations, complete SQL/R2/key/application restoration and domain rollback therefore remain unverified. No remote deployment is claimed.

Andy confirmed the ISN role and Dallas location. The copy and historical homelab case study need owner approval; public contact/social links, portrait and résumé are still unconfirmed. Initial production setup and publication remain owner-controlled. Preserve the old application and deployment for 30 days after the eventual recorded launch date.
