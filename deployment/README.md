# Environment identities

`bun scripts/provision.ts staging` and `bun scripts/provision.ts production` create separate resources and write `resources.json` with their immutable IDs and migration target fingerprints. Review and commit that file and `wrangler.jsonc` before deployment. Resource names are intentionally unrelated to the old OpenNext cache.

Each environment needs its own `EMDASH_ENCRYPTION_KEY`, `SETUP_ACCESS_TOKEN`, `TURNSTILE_SECRET_KEY`, public Turnstile site key and session namespace. Never commit secrets. Initial provisioning does not attach the production custom domain.

After the September 29, 2026 launch, production declares the `eskridge.dev` custom domain in `wrangler.jsonc`, so subsequent main-branch deployments preserve the live attachment. Staging has no production domain route.

`legacy-rollback.json` records the previous `eskridge.dev` attachment, deployed legacy Worker version and actual cutover time. Preserve this snapshot and the old Worker/bindings through October 29, 2026. Do not refresh it with the new domain attachment during routine deployments; it is the recovery record for the previous site.

`release-*.json` records the commit last deployed by the scripts. Preserve it with backups and CI artifacts. A missing resource or release manifest is an error, never an invitation to guess a target.
