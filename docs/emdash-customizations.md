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
| Published-reference patch | 1.1.0 can restore a stale project reference baseline when a seeded homepage is unpublished, changed and republished. Recording the published selection as its baseline preserves ordering and the two-project limit without a schema change. | The homepage browser test publishes/unpublishes/replaces/reorders selections and checks draft isolation. Remove the patch when a released package passes this sequence unpatched. The installed version and upstream main still contain the [affected implementation](https://github.com/emdash-cms/emdash/blob/main/packages/core/src/api/handlers/staged-references.ts). |
| Native Turnstile binding patch | 1.1.0 correctly reads runtime secrets but only checks Siteverify's success flag. The patch passes the request hostname into the native verifier and requires that hostname, the `comment` action, and a successful HTTP response. Production middleware requires the same runtime secret aliases and site key; it never verifies or consumes the token itself. The former custom verifier and build-time secret masking are removed together. | Unit tests exercise source and shipped runtime code. `bun run test:runtime` uses the actual compiled Worker in production mode with a disposable copy of e2e data and intercepted Siteverify responses: exactly one validation, replay/host/action rejection, malformed/unavailable/HTTP-error rejection, missing token/secret/site-key denial, both secret aliases, and pending moderation. Remove this patch when native EmDash offers these hostname/action constraints. |
| Reply/action adapter | 1.1.0 renders threads and accepts `parentId`, but lacks reply/cancel controls and a Turnstile action prop. Our wrapper connects these without duplicating submission. | Browser coverage submits a native-form reply, cancels reply mode and checks threading/safe input. Remove each adapter when native components provide its behavior. |
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

## EmDash 1.1.0 upgrade review (October 1, 2026)

The upgrade branch ports the published-reference patch to 1.1.0. Upstream still
omits the published baseline in `recordPublishedReferences`; the unpatched
upgrade fails the mobile homepage-selection regression with three references
where the field allows two. The patch changes both the shipped runtime chunk
and its TypeScript source, and replaces the obsolete 1.0.1 patch registration.

The Turnstile double-verification blocker is fixed: native EmDash is the only
verifier, with hostname/action binding retained by the package patch. Production
middleware reads the same runtime secret aliases as native EmDash and rejects
missing configuration. The compiled regression uses only synthetic tokens and an
intercepted Siteverify boundary; it does not solve a CAPTCHA, create a widget, or
replace the outstanding real-reader launch exercise.

The owner explicitly accepted a one-time upgrade without a backup on 2026-10-01:
“I’m good to do the upgrade without a backup for now.” There is no guaranteed
way to restore existing data if this migration fails. Production already has
089 applied; the remaining SQLite migrations 090–091 add a redirect-enable loop
guard and redirect artifact tables/triggers without deleting user content.
The temporary waiver in PR #1903 was limited to this production target, the
pinned lockfile, exactly those two pending migrations, and the push immediately
after main commit `38a174b`, with a 24-hour expiry. Its executable exception is
removed by this follow-up; the normal fresh-backup requirement applies to every
future schema change. The owner's acceptance did not authorize deletion or
replacement of user data. No backup was created for this upgrade.
The deployment verifies live pages/health and rejects missing/invalid comment
tokens with a nonexistent parent as a second safeguard against persistence.

The reply/action and retired-PDF adapters remain: 1.1.0's native form still has
no action prop or reply controls. The draft-only policy and topic pagination
findings from the prior audit are unchanged by this dependency upgrade.
