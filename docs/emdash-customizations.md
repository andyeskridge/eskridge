# EmDash boundaries and upgrade checklist

The site uses EmDash's admin, authentication, Portable Text editor, live queries,
search, revisions, previews, scheduling, comments and redirects. The Astro theme,
collection fields and taxonomies use supported extension points. Deployment
migrations use the official `emdash migrate` CLI and runtime `check` mode.
Staging isolation and SQL/media/key recovery remain deployment responsibilities.

## Native comment and redirect configuration

`Discussion.astro` wraps native `Comments` and `CommentForm`. EmDash renders and
escapes comments, serializes and submits the form, resets challenge tokens and
reports the result. The theme supplies styling, privacy copy and reply controls
using the supported `parentId` field.

The built-in moderator is selected when the former bundled policy plugin is
absent. Writing uses `commentsModeration: all` and
`commentsAutoApproveUsers: false`; projects/pages disable comments. The
submission guard checks these settings so incomplete setup or an accidental
settings change closes submissions instead of publishing comments.

After first owner setup, run:

```sh
bun run configure:cms http://127.0.0.1:4321 --apply
```

For staging/production, use the pinned origin and a temporary native admin
credential in `EMDASH_TOKEN`; revoke it afterward. Omit `--apply` for a read-only
check. The command uses public REST endpoints, reads affected state before
writing, installs missing rules, refuses conflicting owner rules and verifies
the result. It never reapplies the seed or changes editorial content. Redirects
remain editable in the admin; intentionally changed rules do not need this
one-time migration rerun.

Retired page/taxonomy URLs now receive EmDash's empty `410` response. Unknown
article URLs still return `404`. The retired PDF keeps the themed `/gone`
response because 1.0.1 skips file extensions. Native `/home` redirects to `/`
without carrying arbitrary query parameters.

## Necessary exceptions

Every new exception must document its native gap, preserved behavior, regression
and removal condition here. Prefer public APIs, settings and components first.

| Exception | Reason | Regression and removal condition |
| --- | --- | --- |
| Published-reference patch | 1.0.1 can restore a stale project reference baseline when a seeded homepage is unpublished, changed and republished. Recording the published selection as its baseline preserves ordering and the two-project limit without a schema change. | The homepage browser test publishes/unpublishes/replaces/reorders selections and checks draft isolation. Remove the patch when a released package passes this sequence unpatched. The installed version and upstream main still contain the [affected implementation](https://github.com/emdash-cms/emdash/blob/main/packages/core/src/api/handlers/staged-references.ts). |
| Runtime Turnstile verifier | Published 1.0.1 reads `import.meta.env`, which Vite substitutes at build time. Our verifier reads the deployed Worker secret, verifies hostname/action and fails closed. Builds clear both secret aliases so tokens are verified once and secrets cannot enter the bundle. | Unit tests cover incorrect hostname/action, missing keys/tokens and transport failures. Upstream [fixed runtime reads](https://github.com/emdash-cms/emdash/commit/0b9426e1bffa435f40388bb4864acd8d0d5bc989). Adopt its published release, test a compiled Worker with only runtime secrets for valid, invalid, missing and reused tokens, then remove the verifier and build-time masking together. |
| Reply/action adapter | 1.0.1 renders threads and accepts `parentId`, but lacks reply/cancel controls and a Turnstile action prop. Our wrapper connects these without duplicating submission. | Browser coverage submits a native-form reply, cancels reply mode and checks threading/safe input. Remove each adapter when native components provide its behavior. |
| Draft-only REST/MCP policy | Native token scopes combine editing, publication and deletion. A Contributor cannot edit even its own existing content; Author/Editor roles include publishing/deleting. Our workflow permits drafting on existing owner entries while reserving publication/deletion/schema changes for the owner. | REST/MCP tests verify permitted editing and rejected publishing, unpublishing, deletion and schema mutation. Replace the policy when native permissions separate these actions for the same ownership workflow. See [native permissions](https://github.com/emdash-cms/emdash/blob/emdash%401.0.1/packages/auth/src/rbac.ts). |
| Retired PDF adapter | Native redirect middleware skips file-extension paths, including `/AndyEskridgeResume.pdf`. | Browser checks require `410` for that file. Move it to a native terminal rule when a released version handles file URLs. |

## Upgrade validation

Update EmDash and its Cloudflare adapter together. Renovate requires review of
CMS updates. Inspect these exceptions on every update and remove resolved ones
in the upgrade branch. Keep compatible security overrides until the dependency
graph supplies the fixed versions.

Run seed validation, audit, formatting, type checks, unit tests, build and browser
acceptance against isolated local/staging data. Complete runtime Turnstile
verification before replacing its adapter. Preserve owner setup protection,
private previews/indexing policy and write-paused backup/scheduler behavior.
