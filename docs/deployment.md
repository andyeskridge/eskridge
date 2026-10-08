# Setup, staging and launch

## Current state

The Astro/EmDash rebuild is merged and live at `https://eskridge.dev` following the September 29, 2026 launch. The previous application is preserved at `codex/eskridge-pre-emdash-latest-20260929`, commit `6bc6e1869c040b3eab117756cad6e69106521a14`. Staging remains at `https://eskridge-emdash-staging.eskridge.workers.dev`, with separate D1/R2/KV resources and a hostname-restricted Turnstile widget. Environment identities are pinned in `deployment/resources.json`; ignored `deployment/release-ENV.json` records the deployed application commit. Outstanding remote acceptance checks are listed in `launch-checklist.md`.

EmDash and its Cloudflare database/storage adapter are both pinned to 1.2.0. Astro 7 and its Cloudflare adapter use the compatible versions in `bun.lock`. Security overrides pin patched transitive dependencies without changing the CMS version or schema. Miniflare is pinned to the same patched alpha revision already used by the Cloudflare Vite plugin, which selects Undici 7.29.1 while leaving Unifont's Undici 8 dependency on its own compatible major. Run `bun audit` after dependency changes and keep the EmDash reference patch until its regression passes with an upstream replacement. The Cloudflare starter supplies the native scheduled handler, D1 sessions, R2 storage and Images binding.

During implementation, `main` advanced to `6bc6e18` with legacy Next/Wrangler dependency updates. That latest legacy state is also preserved on `codex/eskridge-pre-emdash-latest-20260929`. The rebuild merged the new main history while retaining its tested Astro/EmDash dependency lock.

## Local development

1. `bun install --frozen-lockfile`.
   Use Bun 1.4.2 and Node 22.19 or newer; CI uses Node 24. The Node minimum includes the installed HTTP client's requirement, rather than only Astro's lower minimum.
2. Copy `.env.sample` to a private `.env`; generate a unique encryption key with `bun -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
3. `bun run dev` (bound to loopback).
4. Open `http://127.0.0.1:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin`. This bypass is rejected in built/deployed code. It creates a local development user and applies the seed once, keeping the launch content in draft.
5. Run `bun run configure:cms http://127.0.0.1:4321 --apply` after setup. It saves native all-comment moderation, disables authenticated-user auto-approval and installs historical redirects using native REST endpoints. It never reapplies the seed or publishes content. EmDash generates `emdash-env.d.ts` from the local database. Commit generated types alongside intentional schema changes. Seed validation, audit, lint, Astro checks, unit tests, build and browser acceptance verify changes.

Windows Cloudflare development requires the explicit nested picomatch optimizer entry in `astro.config.mjs`. Do not remove it without verifying startup. Development, check, build and browser tests use separate Vite caches to keep diagnostics from invalidating a running development server. Browser tests use port 4322 and `.wrangler/e2e` D1/R2/KV storage, never the owner's regular development database or an existing server. They launch Astro and Wrangler with an absolute runtime path so Windows subprocess PATH handling cannot select a different executable. Browser tests use bundled Chromium by default; an existing Edge installation can be used with `PLAYWRIGHT_CHANNEL=msedge` when browser downloads are unavailable.

For a compiled local preview, run `bun run build` followed by `bun run preview`. Preview explicitly shares the development persistence directory; a fresh unmigrated database correctly returns 503 in runtime check mode. Test the compiled scheduled handler through Wrangler's local explorer scheduled API.

EmDash 1.2.0 needs the versioned Bun patch in `patches/emdash@1.2.0.patch`: after publication, a reference revision records the published selection as its baseline. Without this, unpublishing a seeded homepage and replacing its two selected projects can re-add an old project and fail the cardinality check. The browser suite reproduces this sequence and verifies that draft selection changes stay private. Keep the reference fix until an upstream release passes that regression; it does not change the schema. The same patch binds native Turnstile verification to the request hostname and comment action. Native EmDash alone consumes each token; middleware rejects missing runtime configuration. After build and browser acceptance, run `bun run test:runtime` to verify the compiled production path against intercepted, single-use Siteverify fixtures.

## Remote environment setup

1. Authenticate Wrangler. Set `CLOUDFLARE_ACCOUNT_ID` and a private `CLOUDFLARE_API_TOKEN` with Worker, D1, KV and R2 management permissions. EmDash's deployment migration executor requires an API token even when Wrangler OAuth login is available. Local credentials may be stored in the ignored `.env.cloudflare.local`; invoke deployment scripts with `bun --env-file=.env.cloudflare.local ...`. API widget provisioning additionally needs Account Turnstile Edit permission.
2. Run `bun --env-file=.env.cloudflare.local scripts/provision.ts staging`. It creates or finds only the reserved EmDash resource names; inspect the IDs and commit `deployment/resources.json` and `wrangler.jsonc`. It resolves the real account Workers subdomain instead of guessing the staging URL.
3. Register a Turnstile widget for that environment's hostname, including the `comment` action. Put its public key in `env.staging.vars.TURNSTILE_SITE_KEY`.
4. Set independent runtime secrets using `bunx wrangler secret put NAME --env staging`: `EMDASH_ENCRYPTION_KEY`, `SETUP_ACCESS_TOKEN`, `TURNSTILE_SECRET_KEY`. Keep the encryption key escrowed privately with the matching backups. The first secret put can create a placeholder Worker; no production route is involved.
5. Run `bun --env-file=.env.cloudflare.local run deploy:staging`. The script checks resource separation, requires secrets, builds for the chosen environment, checks the pinned migration fingerprint, applies migrations under EmDash's database lock, checks them again, deploys, then checks migration state and HTTP behavior. Staging always sends `noindex`; its sitemap is unavailable.
6. Visit `https://STAGING-HOST/_emdash/admin/setup?setup_token=YOUR_PRIVATE_BOOTSTRAP_SECRET`. A short-lived secure, HttpOnly cookie permits owner setup and removes the token from the address. Do not share the URL. Complete native passkey setup. Include the seed's draft content.
7. Use a temporary native admin token in `EMDASH_TOKEN` to run `bun run configure:cms https://STAGING-HOST --apply`, then revoke the token. The built-in moderator holds every submission, including returning readers and owner replies. The submission guard closes comments if native settings no longer require approval. The command installs missing legacy redirects and refuses to overwrite conflicting owner rules. Omit `--apply` for a read-only configuration check.

## CMS and agent access

Use the native editor for drafts, revisions, signed previews, scheduled publication, media, taxonomy assignments, ordered homepage selections and navigation. Published edits are rendered from the runtime database; publication does not require a code deployment.

For an agent, create a named expiring token with `content:read`, `content:write`, `media:read`, `media:write` and optionally `schema:read`. Do **not** grant `admin` or `schema:write`. Connect to `/_emdash/api/mcp`. The site's middleware imposes a drafting/media allowlist on non-admin bearer tokens because native `content:write` by itself also covers publishing and deleting. Both REST and MCP calls are restricted. Human owner sessions review and publish through the CMS. Keep the token in the client's secret store. Revoke tokens no longer used.

The collection seed is an installation artifact. Never reapply it over live content to change models. Future content-model changes need a versioned migration with a preflight, explicit target and rollback instructions; regenerate types against the migrated local/staging model. Core upgrades use the generated `.emdash/migrations.json` tied to the locked application version. Production runtime mode is `check`, never `auto`.

## Production launch

Production launched on September 29, 2026. The `eskridge.dev` custom domain now points to `eskridge-emdash-production`; Home, About, the homelab project and introductory article were approved and published by the owner. Independent runtime secrets, D1/R2/KV resources and a hostname-restricted Turnstile widget are provisioned. GitHub's production environment restricts deployments to `main` and pins the D1 identity/fingerprint checked before migrations.

The local, ignored `.emdash/production.runtime-secrets.json` preserves the generated runtime secrets. Move the production encryption key into durable private escrow before a recovery rehearsal or schema change. Do not confuse this private key file with a completed or tested recovery backup.

Subsequent production deployments are restricted to `main`, with GitHub environment permissions and a serialized environment/database concurrency group. The committed custom-domain route preserves the live attachment; staging has no production route. A schema change requires a complete, verified backup less than 24 hours old with a valid timestamp, matching account/Worker/D1/R2/fingerprint, application commit and SQL/lock checksums. The backup must come from the deployed application before preparing the upgrade.

One production-domain passkey is registered; Andy explicitly waived the second-authenticator requirement at launch. Owner recovery remains an acceptance check. Contact links, portrait and résumé were intentionally omitted from the approved launch content. Outstanding remote checks include signed draft isolation, scheduling, a successful Turnstile submission/moderation cycle, uploaded-media transformations and recovery of a nonempty media bucket. See `docs/launch-checklist.md` for the recorded evidence and open checks.

`deployment/legacy-rollback.json` preserves the previous Worker, version, domain attachment and actual cutover time. Retain that snapshot and the old Worker/resources through October 29, 2026; do not overwrite it with the new attachment during routine deployments. The recovery runbook records the tested raw launch restoration and domain rollback procedure. Public production Worker aliases carry `noindex`, block crawlers and omit the sitemap; `eskridge.dev` is the indexed origin.

Legacy `/articles` redirects to `/writing`. Known retired articles, `/uses`, `/speaking` and obsolete taxonomy paths use native CMS `410` rules; other missing URLs return `404`. EmDash's terminal rules return an empty response. The old résumé uses the themed `410` adapter because EmDash 1.2.0 skips file paths. The retired article inventory matches the three posts in the preserved legacy branch; do not turn every unknown article into a `410`.

Read [EmDash boundaries and upgrade checklist](emdash-customizations.md) before adding policy code or upgrading the CMS. Native comment components and moderation settings replace the former custom form/plugin. The published-reference patch, native Turnstile binding patch, small reply/action adapter and draft-only token restriction have explicit regressions and removal conditions. Do not remove these until a released upstream replacement preserves the required behavior.

PR #1903 used an explicitly owner-authorized exception for migrations 090–091 only; see `docs/emdash-customizations.md`. The temporary exception has been removed. No backup was created for that upgrade, so data restoration is not guaranteed. Future schema changes require a complete, matching fresh recovery backup.
