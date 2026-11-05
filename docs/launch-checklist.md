# Launch acceptance

Record results against the actual production build and environment, rather than interpreting an unchecked item as passed.

- [x] Home, About, one real project and introductory article approved by Andy on September 29, 2026 ("content is good for now").
- [x] Launch copy approved; contact/social links, portrait and résumé omitted from launch content.
- [x] Production contains only the four owner-published launch entries. No public test fixtures.
- [ ] Unpublished entries absent from search, archives, RSS and sitemap: covered locally, remote draft-isolation exercise pending.
- [ ] Desktop/mobile reviewed in light/dark, keyboard navigation, readable measure, contrast and reduced motion checked.
- [ ] Draft previews private and scoped to their own entry; edits staged separately from published content.
- [x] Owner publication of all four launch entries appeared without an application deployment.
- [ ] Remote revisions and scheduled publication verified.
- [ ] Ordered homepage selections, navigation, taxonomy filtering, search and pagination verified.
- [ ] Media uploads, missing images and Cloudflare image transformations verified.
- [ ] Guest and authenticated comments held; approval/rejection, threaded replies, chronological order and private email verified.
- [ ] Turnstile rejects missing/invalid tokens; native honeypot and rate limits reject spam.
- [x] Owner signed in with one production-domain passkey. Andy explicitly waived the second-authenticator requirement on September 29, 2026.
- [ ] Owner recovery procedure verified.
- [ ] Draft-only MCP token tested against publish, delete and schema denials; owner session still publishes.
- [x] Staging noindex, independent Worker/D1/R2/KV identities and pinned migration targets verified.
- [x] Launch raw D1/media/key/application snapshot preserved. Remote restoration matched table counts, passed D1 quick/foreign-key checks, and rendered published pages in an isolated read-only, noindex Worker. Launch media bucket was empty.
- [ ] Nonempty media recovery and encrypted off-machine snapshot copy verified.
- [x] Public canonical metadata, RSS, sitemap, search, topics and 301/410/404 behavior verified after cutover.
- [ ] Public social previews and empty collections reviewed in the remote environment.
- [x] Production custom domain switched September 29, 2026; prior deployment ID and rollback procedure recorded. Temporary admin routes removed.
- [x] Old application/resources retained; do not remove before October 29, 2026.

Local automated checks and screenshots are development evidence. They do not substitute for production passkeys, Turnstile, media transformations, restore rehearsal or domain rollback verification.

Production rejects missing and invalid Turnstile tokens, requires approval for all article comments, disables authenticated auto-approval, and disables comments on Projects and Site pages. A successful remote reader submission, moderation/reply cycle and nonempty media exercise remain unverified; do not interpret the domain switch as those checks passing.
