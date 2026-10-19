# Guides → Services Linking Map

> **Status 2026-10-18: the channel manager gap is CLOSED.** `/services/hotel-pms/`
> (free PMS, paid channel manager add-on, revenue help bundled with the add-on) went
> live 14 Oct 2026 and is the destination for the section 6 cluster. All 8 of those
> guides now carry a PMS / channel manager CTA box instead of the generic OTA audit
> one. See section 6 for the full link list.
>
> Background, 2026-08-25: all 52 guides carry a service link (commit `15c9beb`). Counts
> below say "57 guides"; the library was 52 then (EP/CP/AP/MAP were consolidated into
> `hotel-rate-plans.html`). Impressions are still the 2026-07-28 Search Console pull
> and have not been refreshed.

**Original problem (solved):** Only 2 of 57 guides linked to any service page (`ota/what-is-ota.html`, `ota/hotel-direct-booking-strategy.html`). Guides attract search traffic but offered no route to the commercial offer. This is the missing last link in the chain: land → read → trust → hire.

**Principle (from [[brand-positioning]]):** the service link is the "or let us do it for you" option, never a hard sell. It belongs *after* the guide has actually taught something, framed as a choice the reader can decline.

Impressions are from Search Console, last 16 months, pulled 2026-07-28.

---

## 1. Independent Hotel OTA Listing — 8,996 impr / 10 guides

`/services/independent-hotel-ota-listing/`

| Guide | Impressions |
|---|---|
| ota/booking-genius-program.html | 3,939 |
| ota/best-ota-for-hotels.html | 3,093 |
| ota/booking-com-visibility-booster.html | 892 |
| ota/booking-com-hotel-listing-guide.html | 438 |
| ota/what-is-gds.html | 299 |
| ota/best-ota-for-resorts.html | 271 |
| ota/what-is-ota.html | 64 | ✅ already linked — merged with ota-hotel-meaning.html Oct 2026 |
| ota/makemytrip-hotel-listing.html | 0 |
| ota/attract-international-guests-india.html | 0 |

## 2. Direct Booking Website — 4,843 impr / 6 guides

`/services/direct-booking-website/`

| Guide | Impressions |
|---|---|
| revenue/hotel-rate-plans.html | 3,008 |
| software/booking-engine.html | 997 |
| revenue/bar.html | 641 |
| revenue/rate-linkage.html | 190 |
| ota/hotel-direct-booking-strategy.html | 7 | ✅ already linked |
| revenue/increase-hotel-revenue.html | 0 |

## 3. Vacation Rental OTA Listing — 672 impr / 1 guide

`/services/vacation-rental-ota-listing/`

| Guide | Impressions |
|---|---|
| ota/best-ota-for-homestays.html | 672 |

**Gap:** only one guide feeds this service. Homestay/villa/Airbnb content is thin. Worth new guides if this service matters commercially.

## 4. Google My Business — 0 impr / 1 guide

`/services/google-my-business/`

| Guide | Impressions |
|---|---|
| ota/google-free-booking-links.html | 0 |

**Gap:** effectively no content feeds this service. Needs guides on local SEO, Google Business Profile, Maps ranking.

## 5. Hotel Website Design — 0 guides

`/services/hotel-website/` (the old `hotel-website-themes` URL 301s here)

**Gap:** no guide feeds this service at all. Nothing in the guide library is about hotel websites, design, or conversion. The 3 surviving Wix posts (2 digital marketing + building-trust-with-online-visitors) are the natural seed for `/guides/marketing/`, which would feed both this and Direct Booking Website.

---

## 6. Hotel PMS + Channel Manager: 16,258 impr / 8 guides

`/services/hotel-pms/` (anchors: `#free-vs-paid` for the channel manager add-on,
`#revenue-management` for the bundled revenue help)

The 8 cluster guides had their `.guide-audit-cta` box re-pointed from
`/services/ota-audit/` to this page on 2026-10-18, each with copy written for that
guide's topic:

| Guide | Impressions | CTA target |
|---|---|---|
| revenue/no-show.html | 14,194 | `/services/hotel-pms/` |
| software/what-is-pms-hotel.html | 468 | `/services/hotel-pms/` (plus an existing FAQ link) |
| software/what-is-rms-hotel.html | 459 | `#revenue-management` |
| software/channel-manager.html | 377 | `#free-vs-paid` (plus an existing FAQ link) |
| revenue/overbooking.html | 321 | `#free-vs-paid` |
| software/hotel-inventory-management.html | 261 | `/services/hotel-pms/` |
| revenue/mlos.html | 127 | `#free-vs-paid` (in-body OTA audit link kept) |
| software/update-hotel-rates-all-otas.html | 51 | `#free-vs-paid` |

One in-text link was added to each of these, where the sentence already discussed a
PMS or channel manager: `ota/best-ota-for-hotels`, `revenue/hotel-rate-plans`
(`#revenue-management`), `revenue/increase-hotel-revenue`,
`operations/hotel-check-in-process`, `operations/foc-hotel`, `reports/night-audit`,
and the `/guides/software/` hub intro. The homepage "Done For You" list has a card,
the shared footer's "Work With Us" column has a "Free Hotel PMS" link on every page, and the
JS tool nav and tools widget list it under services.

**Deliberately not linked:** sentences where the link would claim a feature the
service page does not state (POS integration, accounting/Tally sync, automated night
audit, MTD flash reports, Form C automation). Add those only if the service page
confirms the feature.

---

## Implementation notes

**Placement:** a short "Prefer not to do this yourself?" block after the main content, before related cards. Not a banner, not mid-article. One per guide.

**Wording:** follow the homepage `Done For You` voice. State what the service does plainly, let the reader walk away. Never imply the guide is incomplete without buying.

**Ordering:** work top-down by impressions. `no-show`, `hotel-rate-plans`, `booking-genius-program`, `best-ota-for-hotels` are the first four — together ~35k impressions.

**Do not link:** compliance guides (gst-hotels, tds-tcs, form-c-hotel, grc-form-c) have no matching service. Reports guides now have one in `/services/hotel-pms/` where the guide is about running the front desk (night audit is linked); keep it to that. Forcing a link there would read as a non-sequitur. Leave them; they build authority and feed internal links to other guides.

Related: [[brand-positioning]], [[backlog]], [[migration-plan]]
