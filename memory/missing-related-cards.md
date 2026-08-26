# Guides Missing Related Cards — RESOLVED 2026-08-25

**Status: CLOSED. Nothing to action here.** All **52 of 52** guides now have a
`RELATED_CONTENT` entry in `src/public/guides/js/guide-nav.js` (verified 2026-08-25:
52 keys, 52 guides, 0 missing). Related cards are also now **pre-rendered as static
HTML** rather than JS-injected, so crawlers see them — see [[crawlable-static-links]].

The 14 gaps below were closed on branch `guide-cta-faq-internal-links` (commit `15c9beb`).
The original list is kept only as a record of what was fixed.

**Note:** the "57 guides" figure below is historical. The library is **52** guides;
the EP/CP/AP/MAP rate-plan pages were consolidated into `hotel-rate-plans.html`.

**Still worth doing (the permanent fix, not yet done):** the category fallback in
`injectRelatedCards()` described at the bottom of this file. Until that lands, a new
guide added without a hand-written entry can still become a dead end.

---

## The 14 URLs (all fixed — historical record)

Paths were written pre-migration (`insights.onlinehotelier.com`); the site now serves from `www.onlinehotelier.com`. After migration the same paths sit on `www.onlinehotelier.com` — the keys in `RELATED_CONTENT` are path-only, so they do **not** need changing at cutover.

### OTA (6) — highest priority, strongest search entry points

| # | Path | Suggested related guides |
|---|------|--------------------------|
| 1 | `/guides/ota/makemytrip-hotel-listing.html` | best-ota-for-hotels, booking-com-hotel-listing-guide, channel-manager |
| 2 | `/guides/ota/ota-hotel-meaning.html` | what-is-ota, best-ota-for-hotels, hotel-direct-booking-strategy |
| 3 | `/guides/ota/hotel-direct-booking-strategy.html` | booking-engine, google-free-booking-links, what-is-ota |
| 4 | `/guides/ota/booking-genius-program.html` | booking-com-hotel-listing-guide, booking-com-visibility-booster, best-ota-for-hotels |
| 5 | `/guides/ota/booking-com-visibility-booster.html` | booking-com-hotel-listing-guide, booking-genius-program, best-ota-for-hotels |
| 6 | `/guides/ota/google-free-booking-links.html` | hotel-direct-booking-strategy, booking-engine, what-is-ota |

### Revenue (4)

| # | Path | Suggested related guides |
|---|------|--------------------------|
| 7 | `/guides/revenue/increase-hotel-revenue.html` | revpar, adr, occupancy |
| 8 | `/guides/revenue/rate-linkage.html` | hotel-rate-plans, bar, mlos |
| 9 | `/guides/revenue/ro-bb-hb-fb-hotel-meaning.html` | ep-plan-hotel, cp-plan-hotel, map-plan-hotel, ap-plan-hotel |
| 10 | `/guides/revenue/trevpar.html` | revpar, adr, occupancy |

### Operations (3)

| # | Path | Suggested related guides |
|---|------|--------------------------|
| 11 | `/guides/operations/hotel-cancellation-policy.html` | no-show, overbooking, hotel-check-in-process |
| 12 | `/guides/operations/hotel-housekeeping-sop.html` | hotel-staff-training, hotel-check-in-process, manager-report |
| 13 | `/guides/operations/hotel-staff-training.html` | hotel-housekeeping-sop, hotel-check-in-process, foc-hotel |

### Compliance (1)

| # | Path | Suggested related guides |
|---|------|--------------------------|
| 14 | `/guides/compliance/form-c-hotel.html` | grc-form-c, gst-hotels, tds-tcs |

---

## Root cause and permanent fix

The lookup table is manual. Every new guide needs a hand-written entry, and that step gets skipped — which is why the 14 missing ones are mostly the newest guides.

**Fix:** in `injectRelatedCards()`, replace the hide-on-missing branch with a fallback that picks up to 3 other guides from the same category (via `GUIDE_CATEGORIES`, excluding the current page). Hand-written entries still take precedence; the fallback only fills gaps. After this, no guide can ever be a dead end.

Related: guide-creation-checklist (add "add RELATED_CONTENT entry" as a mandatory post-creation step)
