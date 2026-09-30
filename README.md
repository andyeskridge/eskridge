# eskridge.dev

Andy Eskridge's portfolio and writing, rebuilt with Astro and EmDash 1.0.1 for Cloudflare Workers. Content is served from EmDash at runtime; publication needs no code build. The custom editorial theme includes local Source Serif 4/Inter fonts, light/dark themes, published-content search, topic archives, RSS, projects and moderated article discussion.

```sh
bun install --frozen-lockfile
bun run dev
```

Read [deployment and owner setup](docs/deployment.md), [recovery](docs/recovery.md), and [launch content review](docs/launch-content.md) before remote deployment. Initial content in `seed/seed.json` is draft-only. Browser fixtures are created solely in the loopback development CMS and removed after tests.

```sh
bun run seed:validate
bun run lint:ci
bun run typecheck
bun run test
bun run build
bunx playwright install chromium
bun run e2e
```

The old Next/Tina/OpenNext application remains on `codex/eskridge-pre-emdash-20260929` at `375d0e60ccc33cfe4a4ea739ad8ab9e7d54c7ca3`. Production has not been cut over. Owner content approval, production passkeys, Cloudflare resource setup and a remote restoration rehearsal are required before launch.
