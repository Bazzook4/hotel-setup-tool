# Open Backlog

Verified against the repo on **2026-08-31**. Everything here is still real; the
numbers were recounted, not copied forward. Replaces the Aug 2026 audit file,
which had gone stale (it still said the work was unmerged and unpushed).

## Open

1. **8 guides still carry Material Design colours.** Banned by CLAUDE.md, and
   these are the last holdouts:
   `software/what-is-pms-hotel`, `what-is-pos-hotel`, `what-is-rms-hotel`,
   `booking-engine`, `hotel-inventory-management`, `hotel-accounting-software`,
   `compliance/tds-tcs`, `ota/booking-com-visibility-booster`.
   Mostly purple `#5e35b1`/`#7e57c2` Quick Answer Boxes and red `#c62828`.
   Replace with `#3E3D35` / `#89826E`; see [[design-system]].

2. **21 guide meta descriptions over 160 chars.** Needs per-page editorial
   judgement, not a bulk pass.

3. **16 page titles over 70 chars**, now genuinely long rather than casualties
   of the old suffix. Worst are tools and services:
   `tools/hotel-discount-calculator` (91), `services/hotel-website` (86).

4. **1 guide missing a Quick Answer Box:**
   `ota/booking-com-hotel-listing-guide.html`. (`rate-linkage.html` was fixed
   31 Aug 2026.)

5. **37 guides still on the old page pattern.** Revenue (15) was converted to
   the accordion FAQ and four-card related block on 31 Aug 2026. Remaining:
   ota (14), software (9), reports (8), operations (6), compliance (5).
   Follow [[guide-template]]. OTA is the natural next one: largest category and
   the strongest fit for the OTA listing service keywords.

6. **`/services/channel-manager-setup/` does not exist** while guides carry
   roughly 16k impressions of intent with nowhere to point. See
   [[guides-to-services-map]].

7. **No GA4 click tracking on `.guide-audit-cta-btn`.** Use a GA4 event with a
   category dimension. **Not** UTM params: they fragment session attribution on
   internal links. See [[analytics-setup]].

8. **Resubmit `sitemap.xml`** in Search Console once the meta work lands.

9. **`/guides/index.html` cards are hand-maintained and will drift again.**
   `guide-nav.js` is the registry every guide page's sidebar reads, and it is
   accurate; the landing page is separate static HTML, which is how 19 guides
   ended up unlisted until 2026-09-01. The page already loads `guide-nav.js`, so
   it *could* render its cards from it — but the cards would then be
   JS-injected, which [[crawlable-static-links]] forbids for internal links.
   Either keep it static and add "update the index" to the new-guide checklist,
   or build the cards at commit time from `guide-nav.js`. Needs a decision, not
   a quick fix.

## Unresolved content questions

Flagged by the Content Head during the Aug 2026 audit and deliberately not
acted on, because the same agent was wrong about GST in the same review.
**Verify against sources before changing anything:**

- Booking.com Genius discount tiers described as "10-20%" may be imprecise.
- `ota/best-ota-for-homestays.html` omits the ₹10 lakh GST registration
  threshold for special-category states (the Northeast and hill states), which
  are real homestay markets.

## Closed, kept only as record

- **Aug 2026 guide audit** (83 pages, branch `guide-cta-faq-internal-links`):
  audit CTA on 52/52 guides, JS-injected links made static, 150 hidden FAQ Q&As
  surfaced, GST rates corrected, title suffix shortened across 87 pages, table
  mobile overflow fixed, all four schema types on all 52 guides, all H2 ids
  added, OG and Twitter cards on all 83 pages with a generated og-image.
  **Merged to main and live.**
- **Related cards**: all 52 guides have a `RELATED_CONTENT` entry, and the
  category fallback in `injectRelatedCards()` has landed, so a new guide can no
  longer dead-end.
- **AI crawler meta trio**: on every indexable page. 0 missing.
- **Footer standardisation** (2026-09-01): a dozen footer variants replaced by
  one, on all 83 non-sample pages, styled from `/css/footer.css`. Also moved the
  footer out of the capped-width layout column on 55 guide and tool pages, where
  it had been rendering at ~1140px. **Live.** See [[footer-standard]].
- **Guides index completeness** (2026-09-01): the index linked 33 of 52 guides
  and had no Operations section at all. All 52 now listed. The six category
  indexes were checked at the same time and were already complete. **Live.**
- **Domain migration**: complete, www is the single live domain. See
  [[migration-plan]].

Related: [[guide-template]], [[tool-page-standard]], [[working-practice]],
[[published-guides]], [[design-system]]
