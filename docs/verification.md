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

Manual review screenshots are in ignored `output/playwright/review-*.png`: desktop homepage/project and mobile homepage/article/About. They show the real draft copy temporarily rendered on loopback for review. The entries were returned to draft afterward.

The dry run reports 15,803.88 KiB uncompressed and 4,110.16 KiB gzip. This fits the current [64 MiB uncompressed Worker limit](https://developers.cloudflare.com/workers/platform/limits/); remote startup time and request CPU limits still require staging measurement. The build warns about a large native administration chunk.

## Remaining environment and owner checks

Staging was deployed on September 29, 2026 from commit `4948abb91c4480ad7562a336daf13eaf038a7285`, Worker version `8864db2d-ef49-42e5-babc-ae408cf51137`. Provisioning pinned independent D1/R2/KV identities, and the native migration executor applied all 88 initial migrations and passed its subsequent checks. The live HTTP check passed for Home, Writing, Projects, About, search, RSS and robots; public responses carried `noindex`, robots blocked crawling and the staging sitemap returned 404. Legacy `/articles` redirected to `/writing`; `/uses` returned 410; unknown URLs and the unpublished launch article/project returned 404. Owner setup without its bootstrap secret and the development bypass returned 403. The private bootstrap returned a secure HttpOnly cookie and removed the secret from the URL before serving setup. Deployment and staging secrets were absent from the 726 inspected built artifacts.

The initial health probe hit Cloudflare's temporary 404 before its new route became available; the deployed site subsequently passed. Deployment now retries transient 404/502/503/504 responses up to six times before failing. Staging version preview URLs are disabled; native signed content previews remain available after owner setup.

The Turnstile widget, three runtime secrets, Images binding and maintenance cron are configured. Owner setup is complete: the signed-in dashboard shows one owner account and the four launch entries published on staging. The homepage renders the CMS introduction, selected homelab project and introductory article after publication, without another application deployment. The native Writing collection settings were saved as “All comments require approval” with authenticated-user auto-approval disabled; the moderation plugin is enabled. The homepage copy and launch content still await explicit owner review for production.

Remote scheduling, real Turnstile challenge completion, media transformations, complete SQL/R2/key/application restoration, production provisioning, production-domain passkeys and domain rollback remain unverified. Production traffic has not been switched.

Andy confirmed the ISN role and Dallas location. The copy and historical homelab case study need owner approval; public contact/social links, portrait and résumé are still unconfirmed. Initial production setup and publication remain owner-controlled. Preserve the old application and deployment for 30 days after the eventual recorded launch date.
