# Launch acceptance

Record results against the actual production build and environment, rather than interpreting an unchecked item as passed.

- [x] Home, About, one real project and introductory article approved by Andy on September 29, 2026 ("content is good for now").
- [ ] Contact/social links confirmed; portrait and résumé either approved or omitted.
- [ ] No test fixtures in production; unpublished entries absent from search, archives, RSS and sitemap.
- [ ] Desktop/mobile reviewed in light/dark, keyboard navigation, readable measure, contrast and reduced motion checked.
- [ ] Draft previews private and scoped to their own entry; edits staged separately from published content.
- [ ] Publishing changes the public page without deploying; revisions and scheduled publication verified.
- [ ] Ordered homepage selections, navigation, taxonomy filtering, search and pagination verified.
- [ ] Media uploads, missing images and Cloudflare image transformations verified.
- [ ] Guest and authenticated comments held; approval/rejection, threaded replies, chronological order and private email verified.
- [ ] Turnstile rejects missing/invalid tokens; native honeypot and rate limits reject spam.
- [ ] Two production-domain passkeys registered; owner recovery procedure verified.
- [ ] Draft-only MCP token tested against publish, delete and schema denials; owner session still publishes.
- [ ] Staging noindex, independent Worker/D1/R2/KV identities and pinned migration targets verified.
- [ ] Raw D1/media/key/application backup restored and tested in an isolated environment.
- [ ] Canonical/social metadata, RSS, sitemap, 301/410/404 behavior and empty collections verified.
- [ ] Production custom domain switched after review; prior deployment ID and rollback procedure recorded.
- [ ] Retain old application/resources until 30 days after recorded cutover date.

Local automated checks and screenshots are development evidence. They do not substitute for production passkeys, Turnstile, media transformations, restore rehearsal or domain rollback verification.
