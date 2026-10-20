**Hotel accommodation GST in India, effective 22 September 2025** (56th GST Council, Notification No. 15/2025-Central Tax (Rate) dated 17 Sept 2025):

- **Up to ₹7,500 per night: 5%, no input tax credit**
- **Above ₹7,500 per night: 18%, ITC allowed**
- Exactly ₹7,500 is in the **5%** slab. Write "up to ₹7,500" / "above ₹7,500", never "₹7,500 and above".
- Based on the **actual value of supply** (the price actually charged, after discounts). The "declared tariff" concept was **removed from 1 April 2025** by Notification 05/2025-Central Tax (Rate). Never write "declared tariff" as current law.
- The earlier **0% (under ₹1,000) and 12% (₹1,001-₹7,500) slabs no longer exist.**
- Restaurant/F&B GST keys off **specified premises**, not the room being billed: a hotel is specified premises if the value of supply of any unit exceeded ₹7,500 per unit per day in the preceding financial year, or it opted in by declaration. Specified premises: 18% on F&B with ITC; otherwise 5% without ITC. This test governs F&B only, never the room rate or room ITC.
- **Room ITC for a business guest:** only on rooms billed at 18% (above ₹7,500). Accommodation is always CGST + SGST of the hotel's state (place of supply = property location), so the guest's business needs a GSTIN in that state to claim it.

Verified 2026-08-24 against [ClearTax](https://cleartax.in/s/impact-of-gst-hospitality-industry), [Masters India](https://www.mastersindia.co/blog/gst-changes-hotel-industry-itc/) and [Bajaj Finserv](https://www.bajajfinserv.in/all-about-gst-on-hotel-rooms). Declared-tariff removal and specified-premises test verified 2026-10-19 against [TaxGuru](https://taxguru.in/goods-and-service-tax/latest-amendments-hotel-industry-restaurants.html) and [TaxHeal](https://www.taxheal.com/?p=97443); this memory itself had carried the wrong declared-tariff rule until then. Not yet checked against the CBIC gazette text.

**Live pages:** rates live on `guides/compliance/gst-on-hotel-rooms.html`; ITC, invoices, filing and OTA commission on `guides/compliance/gst-hotels.html` (split 2026-10-19). Don't duplicate the rate table on the rules page.

**Why this matters:** the old slabs were live on the site as of Aug 2026 and nearly got republished. `gst-hotels.html` was the worst case: its *body copy* already described the 22 Sept 2025 change while its meta description and FAQPage schema still carried 0%/12%/18%. The page contradicted itself. `hotel-accounting-software.html` and `tds-tcs.html` carried the old rates too. A Content Head review flagged the error but proposed 12%/18% as the fix, which was also wrong, so this was only caught by searching the web.

**How to apply:** GST rates change by Council meeting, so never answer from training data or an agent's recall. Search current sources before writing or correcting any GST figure. When a rate changes, grep the whole repo (`12%`, `1,000`, `7,500`, `declared tariff`, `and above`) rather than fixing one page: it appears in body copy, meta descriptions, FAQPage schema, comparison tables and worked examples. Worked examples cascade, so recompute the whole calculation rather than relabelling the rate.

Related: [[backlog]], [[working-practice]]
