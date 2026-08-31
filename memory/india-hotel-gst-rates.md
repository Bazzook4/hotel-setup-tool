**Hotel accommodation GST in India, effective 22 September 2025** (56th GST Council, Notification No. 15/2025-Central Tax (Rate) dated 17 Sept 2025):

- **Up to ₹7,500 per night: 5%, no input tax credit**
- **Above ₹7,500 per night: 18%, ITC allowed**
- Based on **declared tariff**, not the discounted rate actually charged.
- The earlier **0% (under ₹1,000) and 12% (₹1,001-₹7,500) slabs no longer exist.**
- Restaurant GST inside hotels still keys off the room tariff: hotels above ₹7,500 charge 18% on F&B, below that 5%.

Verified 2026-08-24 against [ClearTax](https://cleartax.in/s/impact-of-gst-hospitality-industry), [Masters India](https://www.mastersindia.co/blog/gst-changes-hotel-industry-itc/) and [Bajaj Finserv](https://www.bajajfinserv.in/all-about-gst-on-hotel-rooms).

**Why this matters:** the old slabs were live on the site as of Aug 2026 and nearly got republished. `gst-hotels.html` was the worst case: its *body copy* already described the 22 Sept 2025 change while its meta description and FAQPage schema still carried 0%/12%/18%. The page contradicted itself. `hotel-accounting-software.html` and `tds-tcs.html` carried the old rates too. A Content Head review flagged the error but proposed 12%/18% as the fix, which was also wrong, so this was only caught by searching the web.

**How to apply:** GST rates change by Council meeting, so never answer from training data or an agent's recall. Search current sources before writing or correcting any GST figure. When a rate changes, grep the whole repo (`12%`, `1,000`, `7,500`) rather than fixing one page: it appears in body copy, meta descriptions, FAQPage schema, comparison tables and worked examples. Worked examples cascade, so recompute the whole calculation rather than relabelling the rate.

Related: [[guide-audit-2026-08]], [[agent-verification-discipline]]
