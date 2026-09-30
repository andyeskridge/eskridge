# eskridge.dev

Andy Eskridge's portfolio and writing, rebuilt with Astro and EmDash 1.0.1 for Cloudflare Workers. Content is served from EmDash at runtime; publication needs no code build. The custom editorial theme includes local Source Serif 4/Inter fonts, light/dark themes, published-content search, topic archives, RSS, projects and moderated article discussion.

```sh
bun install --frozen-lockfile # Bun 1.4.2; Node 24 is used in CI
bun run dev
```

Read [deployment and owner setup](docs/deployment.md), [recovery](docs/recovery.md), and [verification and outstanding checks](docs/verification.md) before remote deployment. Initial content in `seed/seed.json` is draft-only. Browser tests use a separate loopback server on port 4322 and isolated `.wrangler/e2e` storage; they do not use the regular development CMS.

```sh
bun run seed:validate
bun audit
bun run lint:ci
bun run typecheck
bun run test
bun run build
bunx playwright install chromium
bun run e2e
```

Production launched on September 29, 2026, with four owner-approved entries. The previous application is preserved on `codex/eskridge-pre-emdash-latest-20260929` at `6bc6e1869c040b3eab117756cad6e69106521a14`; its deployment/resources must remain available through October 29, 2026. See [the rollback record](deployment/legacy-rollback.json) and [remaining acceptance checks](docs/launch-checklist.md). Historical rollback records and retired-URL handling are intentional; legacy application code and generated bundles are no longer part of this checkout.
