# Guides → Services Linking Map

> **Status 2026-08-25 — the linking pass is DONE; the service gap is NOT.**
> All **52 of 52** guides now carry a service link: an audit CTA panel pointing to
> `/services/ota-audit/` (commit `15c9beb`, verified 52/52). The "only 2 guides link
> out" problem below is **solved** and is kept as background.
>
> **What is still open and still matters: `/services/channel-manager-setup/` does not
> exist.** Section 6 below is the live finding — the guide cluster with the most search
> traffic behind it (~16,258 impressions) has no page to point at. The generic OTA-audit
> CTA is a stopgap, not the right destination for those 8 guides.
>
> Counts below say "57 guides"; the library is **52** (EP/CP/AP/MAP were consolidated
> into `hotel-rate-plans.html`). Impressions are still the 2026-07-28 Search Console pull
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
| ota/what-is-ota.html | 64 | ✅ already linked |
| ota/makemytrip-hotel-listing.html | 0 |
| ota/ota-hotel-meaning.html | 0 |
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

## 6. Channel Manager Setup — 16,258 impr / 8 guides — **NO SERVICE PAGE EXISTS**

| Guide | Impressions |
|---|---|
| revenue/no-show.html | 14,194 |
| software/what-is-pms-hotel.html | 468 |
| software/what-is-rms-hotel.html | 459 |
| software/channel-manager.html | 377 |
| revenue/overbooking.html | 321 |
| software/hotel-inventory-management.html | 261 |
| revenue/mlos.html | 127 |
| software/update-hotel-rates-all-otas.html | 51 |

**This is the single biggest finding.** The service with the most guide traffic behind it — nearly double the OTA listing cluster — has no page to link to. It is advertised on `/services/` index with no destination.

`no-show` alone (14,194 impr, position 6.6) is a natural channel-manager conversion path: overbookings and no-shows are exactly what a channel manager prevents.

**Action: build `/services/channel-manager-setup/`.** Still not built as of 2026-08-25
(`src/public/services/` holds only `hotel-website`, `independent-hotel-ota-listing`,
`ota-audit`, `vacation-rental-ota-listing`). The linking pass went ahead without it, so
these 8 guides currently point at the generic OTA audit instead. Re-point them once the
page exists. **This is the highest-value open item in this file.**

---

## Implementation notes

**Placement:** a short "Prefer not to do this yourself?" block after the main content, before related cards. Not a banner, not mid-article. One per guide.

**Wording:** follow the homepage `Done For You` voice. State what the service does plainly, let the reader walk away. Never imply the guide is incomplete without buying.

**Ordering:** work top-down by impressions. `no-show`, `hotel-rate-plans`, `booking-genius-program`, `best-ota-for-hotels` are the first four — together ~35k impressions.

**Do not link:** compliance guides (gst-hotels, tds-tcs, form-c-hotel, grc-form-c) and reports guides have no matching service. Forcing a link there would read as a non-sequitur. Leave them; they build authority and feed internal links to other guides.

Related: [[brand-positioning]], [[backlog]], [[migration-plan]]
