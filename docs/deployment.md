# Setup, staging and launch

## Current state

The rebuild is on `codex/emdash-rebuild`. The previous application is preserved at `codex/eskridge-pre-emdash-20260929`, commit `375d0e60ccc33cfe4a4ea739ad8ab9e7d54c7ca3`. No current production resource or domain route has been changed. Staging was provisioned and deployed on September 29, 2026 at `https://eskridge-emdash-staging.eskridge.workers.dev`, with separate D1/R2/KV resources and a hostname-restricted Turnstile widget. Staging identities are pinned in `deployment/resources.json`; the ignored `deployment/release-staging.json` records the deployed application commit. Owner setup, passkeys and remote restoration remain launch checks.

EmDash and its Cloudflare database/storage adapter are both pinned to 1.0.1. Astro 7 and its Cloudflare adapter use the compatible versions in `bun.lock`. The Cloudflare starter supplies the native scheduled handler, D1 sessions, R2 storage and Images binding.

During implementation, `main` advanced to `6bc6e18` with legacy Next/Wrangler dependency updates. That latest legacy state is also preserved on `codex/eskridge-pre-emdash-latest-20260929`. The rebuild merged the new main history while retaining its tested Astro/EmDash dependency lock.

## Local development

1. `bun install --frozen-lockfile`.
2. Copy `.env.sample` to a private `.env`; generate a unique encryption key with `bun -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
3. `bun run dev` (bound to loopback).
4. Open `http://127.0.0.1:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin`. This bypass is rejected in built/deployed code. It creates a local development user and applies the seed once, keeping the launch content in draft.
5. EmDash generates `emdash-env.d.ts` from the local database. Commit generated types alongside intentional schema changes. `bun run seed:validate`, `bun run lint:ci`, `bun run typecheck`, `bun run test`, `bun run build`, and `bun run e2e` verify the change.

Windows Cloudflare development requires the explicit nested picomatch optimizer entry in `astro.config.mjs`. Do not remove it without verifying startup. Development, check and build use separate Vite caches to keep diagnostics from invalidating a running development server. Browser tests use bundled Chromium by default; an existing Edge installation can be used with `PLAYWRIGHT_CHANNEL=msedge` when browser downloads are unavailable.

For a compiled local preview, run `bun run build` followed by `bun run preview`. Preview explicitly shares the development persistence directory; a fresh unmigrated database correctly returns 503 in runtime check mode. Test the compiled scheduled handler through Wrangler's local explorer scheduled API.

EmDash 1.0.1 needs the versioned Bun patch in `patches/emdash@1.0.1.patch`: after publication, a reference revision records the published selection as its baseline. Without this, unpublishing a seeded homepage and replacing its two selected projects can re-add an old project and fail the cardinality check. The browser suite reproduces this sequence and verifies that draft selection changes stay private. Keep the patch until an upstream release passes that regression; it does not change the schema.

## Remote environment setup

1. Authenticate Wrangler. Set `CLOUDFLARE_ACCOUNT_ID` and a private `CLOUDFLARE_API_TOKEN` with Worker, D1, KV and R2 management permissions. EmDash's deployment migration executor requires an API token even when Wrangler OAuth login is available. Local credentials may be stored in the ignored `.env.cloudflare.local`; invoke deployment scripts with `bun --env-file=.env.cloudflare.local ...`. API widget provisioning additionally needs Account Turnstile Edit permission.
2. Run `bun --env-file=.env.cloudflare.local scripts/provision.ts staging`. It creates or finds only the reserved EmDash resource names; inspect the IDs and commit `deployment/resources.json` and `wrangler.jsonc`. It resolves the real account Workers subdomain instead of guessing the staging URL.
3. Register a Turnstile widget for that environment's hostname, including the `comment` action. Put its public key in `env.staging.vars.TURNSTILE_SITE_KEY`.
4. Set independent runtime secrets using `bunx wrangler secret put NAME --env staging`: `EMDASH_ENCRYPTION_KEY`, `SETUP_ACCESS_TOKEN`, `TURNSTILE_SECRET_KEY`. Keep the encryption key escrowed privately with the matching backups. The first secret put can create a placeholder Worker; no production route is involved.
5. Run `bun --env-file=.env.cloudflare.local run deploy:staging`. The script checks resource separation, requires secrets, builds for the chosen environment, checks the pinned migration fingerprint, applies migrations under EmDash's database lock, checks them again, deploys, then checks migration state and HTTP behavior. Staging always sends `noindex`; its sitemap is unavailable.
6. Visit `https://STAGING-HOST/_emdash/admin/setup?setup_token=YOUR_PRIVATE_BOOTSTRAP_SECRET`. A short-lived secure, HttpOnly cookie permits owner setup and removes the token from the address. Do not share the URL. Complete native passkey setup. Include the seed's draft content.
7. Configure the article collection's moderation settings to **all** and disable authenticated-user auto-approval as defense in depth. The code plugin independently holds every submission, including returning readers and owner replies.

## CMS and agent access

Use the native editor for drafts, revisions, signed previews, scheduled publication, media, taxonomy assignments, ordered homepage selections and navigation. Published edits are rendered from the runtime database; publication does not require a code deployment.

For an agent, create a named expiring token with `content:read`, `content:write`, `media:read`, `media:write` and optionally `schema:read`. Do **not** grant `admin` or `schema:write`. Connect to `/_emdash/api/mcp`. The site's middleware imposes a drafting/media allowlist on non-admin bearer tokens because native `content:write` by itself also covers publishing and deleting. Both REST and MCP calls are restricted. Human owner sessions review and publish through the CMS. Keep the token in the client's secret store. Revoke tokens no longer used.

The collection seed is an installation artifact. Never reapply it over live content to change models. Future content-model changes need a versioned migration with a preflight, explicit target and rollback instructions; regenerate types against the migrated local/staging model. Core upgrades use the generated `.emdash/migrations.json` tied to the locked application version. Production runtime mode is `check`, never `auto`.

## Production launch

Production deployments are restricted to `main`, with GitHub environment permissions and a serialized environment/database concurrency group. Provision production separately, set separate secrets and Turnstile settings, and deploy without adding a domain route. Register production passkeys on `eskridge.dev`; register **two** authenticators before retiring staging credentials. Use Cloudflare Access on the initial administrative setup if the production domain needs to be routed temporarily before launch.

Before switching the domain, review `docs/launch-content.md`, publish approved Home/About, one real project and the introductory article through the CMS, after checking the case-study claims against your current setup. Confirm approved contact links and imagery. Check the production Worker hostname directly: no staging fixtures, private drafts excluded from archives/search/RSS/sitemap, valid metadata, comment moderation and Turnstile, image transformations, scheduled publication, and passkey recovery.

Then switch the `eskridge.dev` custom domain to the new Worker through Cloudflare. Domain cutover is the final launch action after the concrete content/site review. Keep the previous deployment and rollback branch for at least 30 days. Do not delete its bindings or cache resources during that window. Record the actual cutover date and old deployment ID.

Legacy `/articles` redirects to `/writing`. Known retired articles, `/uses`, `/speaking`, obsolete taxonomy paths and the unverified old résumé return a helpful 410. Other missing URLs return 404. Confirm the historical URL inventory against the rollback branch before cutover; do not turn every unknown article into a 410.
