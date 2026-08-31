**Internal links must exist in the served HTML.** Anything a script writes at runtime is unreliable for Googlebot and invisible to most AI crawlers, so JS-injected links pass no equity and do not count as internal linking.

Until 2026-08-24 both the "You Might Also Like" related-cards **and** the prev/next nav on every guide were built at runtime by `guides/js/guide-nav.js`. The link data was hand-curated and good; it just never reached a crawler. 21 of 52 guides had fewer than 2 crawlable internal links and 15 had **zero**. Neither the SEO nor the Designer audit caught the prev/next half.

## How it works now

Both blocks are pre-rendered into each guide's HTML. `guide-nav.js` keeps its data and its logic, but each injector bails out when it finds static content already present:

```js
// injectRelatedCards
if (container.querySelector('.related-card')) return;
// injectPrevNext
if (container.querySelector('.prev-next-link, .prev-next-placeholder')) return;
```

This makes the JS a no-op on converted pages while still populating any empty container, so the fallback survives for a page built later. Verified in both directions with a `vm`-based harness.

To regenerate after editing `RELATED_CONTENT`: reset the affected page's `<div class="related-cards-section">` to empty, then re-run the pre-render. `guide-nav.js` is loadable in Node via `vm` with a stubbed `document`/`window`, which is the reliable way to read `GUIDE_CATEGORIES` and `RELATED_CONTENT` rather than re-parsing the file by hand.

## Rules

- Never `nofollow` an internal link. It is for UGC and paid links; on your own navigation it just blocks equity.
- Never put UTM parameters on same-domain internal links: GA4 treats them as a new session source and fragments organic attribution. Use a GA4 event with a category dimension instead.
- Check the **inbound** distribution, not just outbound. After this fix: 2 pages at 1 inbound, most at 2-9, `what-is-ota.html` at 20 and `channel-manager.html` at 21. Cap a single destination around 10 before adding more; push new links toward under-linked commercial pages.
- When an FAQ answer covers another guide's primary keyword, keep the answer short and link out to that guide. That converts cannibalisation into an internal link.

Related: [[guide-audit-2026-08]], [[published-guides]]
