A full audit of all 83 pages (52 guides, 7 guide indexes, 12 tools, 8 services, 4 top-level) ran on **2026-08-24**, reviewed by SEO Expert, Designer, Content Head and CEO. Work sits on branch **`guide-cta-faq-internal-links`**, four commits at the time of audit (a fifth, `cb141b0`, recorded the two oversight roles in CLAUDE.md on 2026-08-25), **not merged to main and not pushed**.

## Fixed and verified

- **Audit CTA on 52/52 guides** (`.guide-audit-cta`, CSS in `guides/css/guide-layout.css`). Was 0 of 52. Three copy variants by intent: OTA/distribution (15), Revenue+Reports (22), Ops/Compliance/Software (15). All point to `/services/ota-audit/`; previously only 4 guides linked to any service page. Placed above the FAQ on the 27 pages that have one, else at the end of `.article-content` (inside it, so the gradient panel sits on the white card).
- **JS-injected links made static.** `RELATED_CONTENT` *and* prev/next were both built at runtime by `guide-nav.js`, so crawlers never saw them. Both are now pre-rendered into the HTML; the injectors no-op when they find static content (`if (container.querySelector('.related-card')) return;`). Guides with fewer than 2 crawlable internal links: **21 → 0**. Zero-inbound pages: **1 → 0**.
- **150 hidden FAQ Q&A pairs surfaced.** Every guide had FAQPage schema but 39 pages had Q&As that existed *only* in the JSON-LD, which breaks Google's visible-content requirement. 25 pages gained a real FAQ section, 14 had missing questions merged in, `no-show.html` had two competing FAQPage blocks merged into one set of 7.
- **GST rates corrected** in `gst-hotels.html`, `hotel-accounting-software.html`, `tds-tcs.html`. See [[india-hotel-gst-rates]]. The worked example in tds-tcs.html cascaded from the old rate and was recomputed, not relabelled.
- **Title suffix shortened** `| OnlineHotelier Insights` → `| OnlineHotelier` across 87 pages. Over-length titles **52 → 16**.
- **Table mobile overflow fixed** with one rule, `.article-content table { display:block; overflow-x:auto; }`. Beats the pages' own `.comparison-table` on specificity (0,1,1 vs 0,1,0), so no HTML edits were needed. Covers all 48 guides with tables.
- 6 em-dash titles → colons; Material `#dc3545` removed from `tools/revenue-management-tool`.

## Also fixed (commit 3)

- **All four schema types on all 52 guides.** Article, Organization, BreadcrumbList, FAQPage: 0 missing. Built from each page's own H1/description.
- **All 83 missing H2 `id`s added**, slugged from heading text, FAQ headings normalised to `id="faq"`. No duplicates. Every guide now clears the 4-H2 threshold the TOC needs.
- **Open Graph + Twitter cards on all 83 pages**, with a generated 1200x630 `src/public/og-image.png` (brand gradient, Pillow-generated). Nothing on the site had `og:image` before.
- **34 em dashes removed from meta descriptions** before the OG rollout mirrored them into share cards.
- **Sitemap `lastmod`** stamped on the 76 genuinely-changed pages only, not all 83.

## Still open (CEO priority order)

1. **Software cluster** — the 6 software guides + `rate-linkage.html` + `tds-tcs.html` still carry Material colours (purple `#5e35b1`/`#7e57c2` Quick Answer Boxes, red `#c62828`) and 7 of them still lack AI crawler meta tags (googlebot/bingbot/max-snippet). The H2-id and schema parts of this cluster are now done.
2. **19 meta descriptions still over 160 chars** (was 33; commit `93a844f` trimmed the longest). Needs per-page editorial judgement, not a bulk pass; 8 more are under 150, 25 are in range. Recount across all 52 guides on 2026-08-25.
3. **16 guide files still carry Material colours** (9 outside the software cluster: 4 reports pages, `increase-hotel-revenue`, `no-show`, `occupancy`, 2 booking.com OTA pages).
4. **2 guides missing a Quick Answer Box**: `booking-com-hotel-listing-guide.html`, `rate-linkage.html`.
5. **16 titles still over 70 chars**, now genuinely long rather than suffix casualties. Worst are tools/services: `hotel-discount-calculator` (91), `services/hotel-website` (86).
6. **Resubmit `sitemap.xml`** in Search Console once the remaining meta work lands.

## Unresolved content questions

Content Head flagged two things I did not act on, given it was wrong on GST: Booking.com Genius discount tiers described as "10-20%" may be imprecise, and the homestay GST registration threshold (`best-ota-for-homestays.html`) omits the ₹10 lakh special-category-state figure for the Northeast and hill states, which are real homestay markets. Verify against sources before changing.

## Not done

No GA4 click tracking on `.guide-audit-cta-btn`. The SEO Expert advised **against UTM params on internal links** because they fragment GA4 session attribution; use a GA4 event with a category dimension instead.

Related: [[india-hotel-gst-rates]], [[agent-verification-discipline]], [[stale-doc-false-alarms]], [[guide-template]]
