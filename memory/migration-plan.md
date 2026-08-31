**STATUS: COMPLETE.** The migration has shipped. `www.onlinehotelier.com` is the single live domain. Verified 2026-08-24.

**Do not report www canonicals as a defect.** Every page correctly uses `https://www.onlinehotelier.com`. An SEO audit on 2026-08-24 raised "all canonicals point to the wrong domain" as a CRITICAL finding — it was FALSE, caused by this file and CLAUDE.md still naming `insights.onlinehotelier.com` as live. That documentation is now corrected.

**Verified live state (2026-08-24):**
- 83 canonicals across the site, 100% on `https://www.onlinehotelier.com`. Zero on the old subdomain.
- Zero `insights.onlinehotelier.com` references remain anywhere in `src/public`.
- `vercel.json`: 9 redirects, all `insights.onlinehotelier.com` → `https://www.onlinehotelier.com` (301).
- `robots.txt` and `sitemap.xml` (83 URLs) both on www.
- JSON-LD (`logo`, `sameAs`, BreadcrumbList items) all on www.
- Only pages without canonicals are `/samples/*` — intentional: `noindex, nofollow`, `Disallow: /samples/`, absent from sitemap.

**What shipped:**
- Wix site (21 URLs) migrated to Vercel; `/blogs` and `/post/*` retired.
- `insights` subdomain folded into www. Same Vercel project serves both — do NOT create a second project.
- New homepage swapped into `src/public/index.html` (the old `home-main.html` staging file is gone).
- `/contact/` built. `js/nav.js` no longer hardcodes the Wix Contact URL.
- Services settled at four pages: `ota-audit`, `hotel-website`, `independent-hotel-ota-listing`, `vacation-rental-ota-listing`. The phantom "Channel Manager Setup" link is off the services index, and the `hotel-website` naming mismatch is resolved.
- 13 of 17 Wix posts 301'd into existing guides rather than rebuilt, avoiding keyword cannibalisation.

**Still open (carried forward, not migration blockers):**
- The 4 unique Wix posts (2 digital marketing, `building-trust-with-online-visitors`, `common-bookingcom-mistakes`) were to become a `/guides/marketing/` category. **That category does not exist yet.**
- Guide → service wiring remains weak: only 4 of 52 guides link to any `/services/` page, and 0 of 52 carry an audit CTA. This is the highest-return open work on the site. See the 2026-08-24 guide audit.

Related: [[brand-positioning]], [[published-guides]], [[guide-template]]
