# Repository guidance

This repository uses Astro 7, EmDash 1.1.0 and the EmDash Cloudflare adapter 1.1.0, with Bun and a committed lockfile. Layouts are maintained in code; editorial content lives in D1 via EmDash. Read `docs/deployment.md` and `docs/recovery.md` for target checks, owner-controlled setup and launch constraints.

Never reseed a live CMS to change its schema. Use an explicit versioned migration and regenerate `emdash-env.d.ts` against the resulting local model. Initial content stays draft-only; do not invent professional claims or publish browser fixtures. Article comments always require approval. Non-admin bearer credentials permit drafting/media work only, enforced across REST and MCP.

Prefer native EmDash components, settings and APIs. Read `docs/emdash-customizations.md` for necessary exceptions, regressions and removal conditions. Every new exception must be documented there. Initialize native moderation and legacy redirects with `bun run configure:cms URL --apply` after owner setup; never replace live content with the seed.

Verify with seed validation, audit, lint, Astro checks, Bun tests, build and Playwright. Keep secrets and database/media snapshots outside Git. Production deployments require main; retain the previous deployment for 30 days after cutover.
