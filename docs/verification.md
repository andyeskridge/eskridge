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

The Turnstile widget, three runtime secrets, Images binding and maintenance cron are configured. Owner setup is complete: the signed-in dashboard shows one owner account and the four launch entries published on staging. The homepage renders the CMS introduction, selected homelab project and introductory article after publication, without another application deployment. The native Writing collection settings were saved as “All comments require approval” with authenticated-user auto-approval disabled; the moderation plugin is enabled. Andy subsequently approved the current launch content for production.

Production launched on September 29, 2026. The committed rollback record identifies the previous Worker/version and actual cutover time. Production owner setup and publication are complete, and one production-domain passkey is registered; Andy waived the second-authenticator requirement. The launch restoration rehearsal matched application table counts, passed D1 quick/foreign-key checks and served restored published pages in an isolated read-only, noindex Worker. The launch media bucket was empty.

Remote scheduling, successful real-reader Turnstile completion/moderation, media transformations, nonempty media restoration, encrypted off-machine backup storage and owner recovery still need verification. Public contact/social links, portrait and résumé remain omitted from the approved launch content. Preserve the old application/deployment/resources through October 29, 2026. See `launch-checklist.md` for the complete acceptance record.

## Portfolio review completed September 30, 2026

Reviewed the tracked application, ignored legacy output, dependency graph, middleware/access policies, CMS publication flows, discovery metadata, deployment/recovery scripts, CI and the live public site. The changes below are local working-tree changes and have not been deployed. Production content and Cloudflare resources were not modified during this review.

### Findings resolved

| Finding | Result |
| --- | --- |
| Old Next type declarations and Tina admin scaffold remained tracked; generated Tina HTML/assets were still under `public/admin` and could enter a local build | Removed `next-env.d.ts`, the old admin scaffold, generated Tina/Next/OpenNext directories, TypeScript build cache and May 2026 browser reports; simplified obsolete ignore rules. No active Tina/Next dependencies or application code remain. |
| Draft-only credentials could send `status: "draft"` on an existing item, which EmDash interprets as unpublishing | Existing-entry writes must omit status. Explicit draft status remains allowed on creation. Both REST and MCP regressions verify a limited token cannot unpublish an owner-published entry. |
| Dependency audit reported 18 advisories across six packages | Applied narrowly scoped compatible overrides, retained the pinned CMS/reference patch, and added `bun audit` to CI. The final audit found no vulnerabilities across 783 packages. |
| Search/error pages set HTML robots metadata but their layout-level HTTP header writes did not take effect; early middleware responses missed common headers | Set common headers after every middleware outcome and CMS `noindex` headers in page frontmatter. Search, errors, previews and administration are consistently excluded from indexing. Preview/API/admin responses use private, non-storing cache policies. |
| The production Worker alias could expose an indexable duplicate of the public origin | Only the configured production origin is indexable. Alternate hosts receive `noindex`, blocking robots and no sitemap. Verified against the compiled Worker using a different Host header. |
| Browser tests reused the owner's regular development CMS and depended on Windows subprocess PATH | Tests now run on port 4322, with dedicated `.wrangler/e2e` persistence and a separate Vite cache. Astro/Wrangler use the runner's absolute runtime. The existing development database is preserved. |
| The preview-tampering test could replace a character with itself, or alter only an unused base64 padding bit | The test now changes the token's first character deterministically. Invalid previews remain unavailable. |
| Migration backup validation accepted missing/invalid dates because comparisons with `NaN` are false | Require a valid recent timestamp, exact account/Worker/D1/R2/fingerprint, strict completion/escrow flags and well-formed application/SQL/lock identities. Tests cover stale, future, malformed and mismatched manifests. |
| Runtime version metadata, documentation and small presentation details were inconsistent | Declared Bun 1.4.2 and Node 22.19 minimum, aligned the local origin, corrected stale prelaunch documentation, preserved the actual rollback snapshot, removed an unused draft style, made the back-to-top anchor work without JavaScript and omitted invalid résumé links. |

The security overrides select these published fixes:

| Package | Selected version | Upstream reference |
| --- | --- | --- |
| qs | 6.16.0 | [Maintainer advisory](https://github.com/ljharb/qs/security/advisories/GHSA-x5fp-wj9c-mxmx) |
| DOMPurify | 3.4.13 | [Maintainer advisory](https://github.com/cure53/DOMPurify/security/advisories/GHSA-55q2-fjhq-7xh7) |
| Browserslist | 4.28.7 | [Maintainer advisory](https://github.com/browserslist/browserslist/security/advisories/GHSA-c83g-rgw3-j3cx) |
| baseline-browser-mapping | 2.11.0 | [Upstream release](https://github.com/web-platform-dx/baseline-browser-mapping/releases/tag/v2.11.0) |
| js-yaml | 4.3.2 | [Maintainer advisory](https://github.com/nodeca/js-yaml/security/advisories/GHSA-2883-xcg3-v3hh) |
| Miniflare / Undici | 5.20260926.1-alpha / 7.29.1 | [Undici maintainer advisory](https://github.com/nodejs/undici/security/advisories/GHSA-w293-vg96-wgc3) |

Miniflare is unified on the patched revision already required by the Cloudflare Vite plugin. Unifont retains its separate compatible Undici 8.11.2 dependency. These overrides do not change the content schema.

### Final evidence

| Check | Result |
| --- | --- |
| Frozen installation, security audit, draft seed validation and formatting | Passed; audit clean |
| Astro diagnostics | 46 files; zero errors, warnings or hints |
| Unit tests | Five passed; 50 assertions |
| Desktop/mobile acceptance | All ten passed in the final fresh run, including the new unpublish and CMS robots-header regressions |
| Production build | Passed; native admin chunk size warning remains |
| Compiled read-only production-mode Worker | Public origin metadata/feed/sitemap, search/error indexing headers, alias crawler blocking, private draft 404s, setup/bypass denials and retired admin 404 passed |
| Local raw SQL restoration | 83 tables; integrity and foreign-key checks passed |
| Built artifact secret check | The private local encryption key was absent from inspected build artifacts; no old Tina admin bundle was produced |
| Live read-only HTTP review | Main pages, approved article/project, search, RSS, sitemap, robots, setup/bypass protection and historical 301/410/404 behavior passed |
| Live visual review | Desktop homepage in both themes, mobile homepage and 320px article inspected; no horizontal overflow at 320px; the live dark homepage had zero tested WCAG A/AA violations |

The existing local server initially returned errors and was restarted successfully. One intermediate test run experienced local connection resets while other validation/configuration work was running; the final run used fresh isolated test storage/cache with no concurrent Worker checks and passed all ten cases. Browser screenshots are in ignored `output/playwright/live-*.png`; local restore evidence is in `output/recovery/local-restore.json`.

### Remaining owner and production work

Deploy the reviewed code through the normal main-branch process before treating these fixes as live. Keep the legacy rollback Worker/resources through October 29, 2026. The existing empty-media launch restore does not prove recovery of future uploaded objects or owner authentication on a recovery domain.

Complete the outstanding remote exercises in `launch-checklist.md`: signed draft isolation, revisions/scheduled publication, a successful real-reader Turnstile submission plus approval/reply cycle, media transformations, nonempty media restoration, encrypted off-machine backup retention and owner account recovery. The owner explicitly waived a second authenticator at launch; this review does not change that decision.

The Privacy page points visitors to About for contact/removal requests, but no public contact links are configured. Add an owner-approved contact route in the CMS. Public pages also lack a social preview image; an approved default image would improve shared links. No contact details or imagery were invented or published during this review.
