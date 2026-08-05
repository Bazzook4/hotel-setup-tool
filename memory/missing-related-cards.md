# Guides Missing Related Cards

**Status:** 14 of 57 guides have no `RELATED_CONTENT` entry in `src/public/guides/js/guide-nav.js`.

**Effect:** `injectRelatedCards()` hides the whole "You Might Also Like" section when a path is absent from the lookup table (see `guide-nav.js` around the `container.style.display = 'none'` line). The reader reaches the end of the article with no suggested next read. These pages are dead ends.

**Action before go-live:** add an entry for each path below to `RELATED_CONTENT`, and add the category fallback so this cannot recur.

---

## The 14 URLs

Paths are current (`insights.onlinehotelier.com`). After migration the same paths sit on `www.onlinehotelier.com` — the keys in `RELATED_CONTENT` are path-only, so they do **not** need changing at cutover.

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
