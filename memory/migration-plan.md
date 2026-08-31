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
- The 4 unique Wix posts (2 digital marketing, `building-trust-with-online-visitors`,
  `common-bookingcom-mistakes`) were to become a `/guides/marketing/` category.
  **That category still does not exist.**
- Everything else that was listed here has shipped: all 52 guides now carry an
  audit CTA and link to a service. Current open work is in [[backlog]].

**DNS, historical.** The Wix → Namecheap → Vercel cutover ran 2026-08-04 off a
zone captured from Wix (nameservers were `ns12`/`ns13.wixdns.net`, so the whole
zone had to be rebuilt at Namecheap first; disconnecting the domain inside Wix
would have wiped it, email included). It is done and there is nothing to action.
The full record is in git history if a rollback question ever comes up.

Related: [[brand-positioning]], [[published-guides]], [[guide-template]], [[backlog]]
