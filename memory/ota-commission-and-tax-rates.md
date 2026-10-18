**The one set of OTA commission and OTA-payout tax figures every page uses.** Verified 2026-10-18.

## MakeMyTrip / Goibibo commission

- **15 to 25 percent**, and **most independent hotels pay 18 to 22 percent**.
- Smart Deals and other promotions are a further opt-in discount (5 to 8 percent) funded from the hotel's own rate. Visibility programmes can push the effective cost past 30 percent.
- MMT does not publish a rate; it is set per contract. These are the bands third-party sources agree on ([myhomestay.ai](https://myhomestay.ai/blog/ota-commission-guide-india), [jhattse](https://blog.jhattse.com/hotel-ota-commission-rates-india-2026/)). Never publish a narrower or different band without new evidence.

Before 18 Oct 2026 the site said 12-18, 15-20, 15-25, 18-22 and 18-23 on different pages, and two pages (`what-is-ota.html`, `best-ota-for-homestays.html`) contradicted themselves.

## Taxes deducted from an OTA payout

| Deduction | Rate | Law | Credit goes to |
|---|---|---|---|
| GST on the OTA's commission | 18% | OTA service | Not recoverable for rooms at 5% (no ITC) |
| TDS | **0.1%** (5% with no valid PAN) | Income Tax Act s.194-O, cut from 1% on 1 Oct 2024 | Form 26AS, claimed in the ITR |
| TCS | **0.5%** on net room value, no threshold | **CGST Act s.52**, cut from 1% on 10 July 2024 | GST electronic cash ledger, via the OTA's GSTR-8 |

- **TCS on OTA bookings is GST, not income tax.** Income tax s.206C(1H) covered sales of goods only and stopped applying on 1 April 2025. `tds-tcs.html` wrongly cited it, with a ₹50 lakh threshold and Form 26AS credit, until 18 Oct 2026.
- A hotel **not** registered for GST has no TCS. The OTA pays GST on the room itself as deemed supplier under s.9(5).
- Both TDS and TCS are calculated on the room value **before** GST. On ₹5,000: TDS ₹5, TCS ₹25.
- Corporate rate-contract stays: TDS at 10% under s.194-I once payments pass ₹50,000 in a month (raised from ₹2.4 lakh a year on 1 April 2025). One-off bookings do not attract it.

## How to apply

These values change through Finance Acts and GST notifications, so search current sources before republishing any of them. When one changes, grep the whole repo: it appears in body copy, meta descriptions, FAQPage schema (keep it identical to the visible FAQ), comparison tables, worked examples, and the calculator's JS constants (`tools/ota-commission-calculator/`, `tools/break-even-calculator/`). Recompute worked examples; don't just relabel the rate.

Canonical pages: `guides/ota/makemytrip-commission.html` for MMT commission and net payout, `guides/compliance/tds-tcs.html` for the tax mechanics. Their ₹5,000 worked examples must stay identical (₹4,040 settled).

Related: [[india-hotel-gst-rates]], [[working-practice]], [[published-guides]]
