# Environment identities

`bun scripts/provision.ts staging` and `bun scripts/provision.ts production` create separate resources and write `resources.json` with their immutable IDs and migration target fingerprints. Review and commit that file and `wrangler.jsonc` before deployment. Resource names are intentionally unrelated to the old OpenNext cache.

Each environment needs its own `EMDASH_ENCRYPTION_KEY`, `SETUP_ACCESS_TOKEN`, `TURNSTILE_SECRET_KEY`, public Turnstile site key and session namespace. Never commit secrets. No production domain route is configured by provisioning or deployment.

`release-*.json` records the commit last deployed by the scripts. Preserve it with backups and CI artifacts. A missing resource or release manifest is an error, never an invitation to guess a target.
