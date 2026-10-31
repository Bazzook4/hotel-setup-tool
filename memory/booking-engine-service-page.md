# Booking Engine Service Page

Page: `/services/hotel-booking-engine/` (live 2026-10-31)

## Owner-confirmed facts (2026-10-31)

These are the ONLY product claims allowed on this page. Do not add to them
without going back to the owner.

**Confirmed true:**
- Same free software as the PMS. No subscription, no trial period.
- Guests pay the hotel's own UPI or bank account directly.
- No payment gateway required. No PG fees. No commission to OnlineHotelier.
- OnlineHotelier supplies the software only. It does not process, hold or settle money.
- Payment confirmation is done BY THE HOTEL: the hotel checks the payment in its own UPI app or bank, then confirms the reservation in the software.
- Any property in India can use it. The UPI workflow is designed for the Indian market.
- Live and ready to use now.
- Channel manager is the only paid add-on (same as the PMS page).
- Reservations go into the same OnlineHotelier system (safe phrasing confirmed).

**Not confirmed / not to be claimed:**
- Refunds or refund workflows.
- UPI app names (BHIM, PhonePe, GPay, etc.).
- UPI transaction limits.
- Modes other than UPI and bank transfer.
- OTA sync or PMS calendar write-through from the booking engine.
- Website embed method (defer to WhatsApp for setup).
- Setup time, support hours, speeds.
- Savings numbers not computed from the reader's own inputs.

## Who it is not for (stated on page)

If the property needs automatic payment confirmation or card payments at the
time of booking, this engine is not the right fit. This is stated in the
`who-its-for` section and in FAQ Q4. Do not soften or remove these disclosures.

## Page wiring

- Linked from: nav.js Software column, services/index.html card,
  services/hotel-pms/index.html (free-vs-paid section + footer Work With Us),
  guides/software/booking-engine.html (highlight-box after setup steps),
  guides/ota/hotel-direct-booking-strategy.html (highlight-box after Step 1 bullets),
  sitemap.xml, llms.txt.
- Internal links on the page: /services/hotel-pms/, /tools/ota-commission-calculator/,
  /guides/software/booking-engine.html, /guides/ota/hotel-direct-booking-strategy.html.

## Schema

SoftwareApplication (isAccessibleForFree, offers price 0 INR) + Service
(areaServed 'IN', NOT Worldwide) + FAQPage (7 questions, all visible on page) +
Organization + BreadcrumbList (Home > Services > Hotel Booking Engine).

## GA4 event

`pms_signup_click` with `cta_position` values: hero, facts, mid, faq, bottom.
Same event name as the PMS page (same product).

## WhatsApp call

`ohWA.open('OnlineHotelier PMS')` exactly, same as the PMS page.

Related: [[country-pms-pages]], [[brand-positioning]], [[writing-standard]]
