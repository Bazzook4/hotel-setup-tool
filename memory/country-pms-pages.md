# Country PMS Pages

Pages under `/services/hotel-pms/<country>/` that sell the free OnlineHotelier PMS
to very small properties outside India. Started 24 Oct 2026.

## Status

| Wave | Country | Slug | State |
|---|---|---|---|
| 1 | Thailand | `thailand` | Live (pattern page) |
| 1 | Malaysia | `malaysia` | Live |
| 1 | Indonesia | `indonesia` | Live |
| 1 | Kenya | `kenya` | Live |
| 2 | Sri Lanka | `sri-lanka` | Live (owner asked for it early) |
| 2 | Philippines | `philippines` | Live |
| 2 | Vietnam | `vietnam` | Live |
| 2 | Tanzania (incl. Zanzibar) | `tanzania` | Live |
| 3 | Nepal | `nepal` | Live |
| 3 | Maldives | `maldives` | Live (USD billing; local-island guesthouses only) |
| Hold | Singapore, Cambodia | | Owner decision: too little demand or local material |

## The pattern

Copy `thailand/index.html`. Same `<style>` block character for character, same
section ids in this order: `at-a-glance`, `one-calendar`, `check-in-checkout`,
`local-fit`, `property-types`, `channel-manager`, `faq`. A light mid-page CTA row
sits after `channel-manager`. Schema: SoftwareApplication + Service (areaServed,
local priceCurrency, price 0) + FAQPage + Organization + BreadcrumbList. No
Article schema: these are service pages.

## Owner decisions that shape every page

- **Audience:** tiny properties whose main need is managing incoming
  reservations. Lead with one free calendar for every booking source (OTAs, the
  local messaging app, phone, walk-ins). Taxes, payments and guest registration
  are one short `local-fit` section. The paid channel manager is one short
  optional section.
- **Sign up first.** "Sign Up Free" is the primary CTA everywhere, WhatsApp
  secondary. WhatsApp must call `ohWA.open('OnlineHotelier PMS')` exactly: the
  widget only preselects an existing option value. The country goes in the GA4
  `pms_signup_click` event as `country: '<slug_with_underscores>'`.
- **Local currency, not ₹.** A scoped exception to the ₹-only rule in
  [[writing-standard]], approved by the CEO for these pages only.
- **What may be claimed:** the PMS handles any country's taxes, levies and
  service charge; the channel manager covers the OTAs that matter. **What may
  not:** government e-invoicing or reporting submission (MyInvois, eTIMS, APOA,
  TM30), payment processing (M-Pesa STK, QRIS), guest-report exports as built in
  (say "available on request"), offline mode, local-language UI, support hours,
  setup times or speed claims, channel manager pricing models.
- **Small-property honesty:** most of these properties are below VAT and similar
  thresholds. Say "where it applies to you"; never imply every tax applies.

## Facts that tripped the first drafts

Every tax figure carries its source URL in an HTML comment beside it. Re-check
before editing, because several moved during 2026:

- **Indonesia:** hotel rooms pay the regional PBJT (max 10%, per regency), not
  national VAT. Hotel services are on the VAT negative list (Art. 4A(3) VAT Law
  as amended by Law 7/2021). An early brief put both on the bill.
- **Malaysia:** Tourism Tax exemption is fewer than five rooms across all the
  operator's premises (was fewer than ten in 2017). MyInvois is mandatory only
  above RM 3 million revenue from Sept 2026.
- **Kenya:** SafariBookings is a safari-tour marketplace, not a lodge OTA. Keep
  the 2% tourism levy off the sample bill.
- **Sri Lanka:** VAT threshold stayed Rs 60m (the cut to Rs 36m was dropped in
  June 2026); the SSCL threshold did fall to Rs 36m from 1 July 2026. TDL is not
  on the guest bill.
- **Thailand:** 7% VAT runs to 30 Sept 2027 (Royal Decree 807). Recheck after.
- **Vietnam:** the 8% VAT rate ends 31 Dec 2026 unless extended. Recheck in
  January 2027; the sample bill uses 8%.
- **Tanzania:** the 2% council hotel levy is kept off the bill (assessed on
  turnover). No Zanzibar sample bill: its VAT and infrastructure tax rates came
  only from secondary sources.
- **Nepal:** the mandatory 10% service charge was struck down by the Supreme
  Court in Jan 2023; the page shows it as optional.
- **Weak sources:** beancount.io blog posts surfaced for Sri Lanka, Nepal and
  the Maldives. Never use them as the only source for a figure.

## Linked from

The `#outside-india` section of `/services/hotel-pms/`, a plain link line under
the grid on `/services/` (the PMS card is itself a link, so links cannot nest),
`sitemap.xml`, and `llms.txt`. Add every new country to all four.

Related: [[brand-positioning]], [[writing-standard]], [[working-practice]]
