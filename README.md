# OnlineHotelier

The content site behind [www.onlinehotelier.com](https://www.onlinehotelier.com) — guides, calculators and services for Indian hotel owners and managers.

The project began as a single Revenue Management System setup tool. It has since grown into an 87-page static site: 59 guides, 12 calculators, 8 service pages, and the supporting index and policy pages.

## What is here

| Section | Count | What it is |
|---|---|---|
| `src/public/guides/` | 59 | Long-form guides across six categories |
| `src/public/tools/` | 12 | Free browser-based calculators |
| `src/public/services/` | 8 | Service and service-index pages |
| `src/public/about/`, `contact/`, `privacy/`, `samples/` | — | Supporting pages (`samples/` is `noindex`) |

### Guide categories

| Category | Guides | Covers |
|---|---|---|
| `revenue/` | 16 | Rate plans, ADR, RevPAR, occupancy, overbooking, no-shows |
| `ota/` | 14 | OTA basics, Booking.com, MakeMyTrip, direct booking, GDS |
| `software/` | 9 | PMS, RMS, POS, channel manager, booking engine |
| `reports/` | 8 | Night audit, P&L, arrival, departure, manager reports |
| `operations/` | 6 | Check-in, housekeeping SOP, cancellation policy, staff training |
| `compliance/` | 5 | GST, TDS/TCS, Form C, GRC |

### Tools

Calculators run entirely in the browser and persist state to `localStorage`:
OTA commission, OTA dependency, break-even, guest acquisition cost, hotel
discount, revenue profit estimator, demand calendar, revenue management tool
and results, rate shopper, competitor analysis.

`rate-shopper` and `competitor-analysis` are the two exceptions — they call the
serverless functions in `api/`.

## Stack

- **Static HTML, CSS and vanilla JavaScript.** No build step, no framework, no bundler.
- **Hosting:** Vercel, serving `src/public` directly (`vercel.json` sets `outputDirectory`, with an empty `buildCommand`).
- **Serverless functions:** `api/` — `hotels.js`, `competitors.js`, `inventory/`, `occupancy/`.
- **Analytics:** GA4 `G-9L2N1S6S9F`, inlined on all 83 indexable pages. No GTM, deliberately. See `memory/analytics-setup.md`.
- **Styling:** hand-written CSS using the brand design system. No Tailwind, no CSS framework.

`src/server.js` is a local Express server retained for development convenience.
It is not what runs in production — Vercel serves the static files.

## Running locally

```bash
npm install
npm start          # Express on http://localhost:3000
npm run dev        # same, with --watch auto-reload
```

Because the site is static, you can equally serve `src/public` with any static
file server. The `api/` routes only resolve when deployed to Vercel or run
through the Vercel CLI.

## Deploying

Pushes to `main` deploy automatically via Vercel.

**A clean push is not proof the site updated.** Always confirm against the live
URL rather than git. See `memory/deploy-pipeline.md`.

## Domain and redirects

The site migrated from `insights.onlinehotelier.com` to `www.onlinehotelier.com`.
That subdomain now 301-redirects here, and `vercel.json` carries 61 redirect
rules covering the migration plus consolidated pages whose old URLs still hold
traffic. Canonicals point at `www` and are correct — see `memory/migration-plan.md`
before flagging any of this as a defect.

## Working on this project

Read **`CLAUDE.md`** first. It defines the agent team, the mandatory workflow for
every new page, the brand design system, and the content standards.

Then read **`memory/README.md`**, which indexes the durable project knowledge:

- `memory/guide-template.md` — the template for every `/guides/` page
- `memory/tool-page-standard.md` — the template for every `/tools/` page
- `memory/writing-standard.md` — audience and the pre-commit content checklist
- `memory/design-system.md` — brand colours and the dark-panel contrast trap
- `memory/backlog.md` — what is still open

The templates describe what the pages **actually do**, not an aspiration. If you
change a page pattern, change its template in the same commit.

## Content standards

- Audience: Indian hotel owners and managers
- Currency: ₹ (INR), never $ or USD
- SEO titles 60–70 characters, ending `| OnlineHotelier`
- Meta descriptions 150–160 characters
- Guides run 1,200–2,000 words

## Project structure

```
├── CLAUDE.md            # Team workflow, design system, content standards
├── memory/              # Durable project knowledge (version-controlled)
├── api/                 # Vercel serverless functions
├── scripts/
│   └── generate-llms-txt.py
├── vercel.json          # Static config + 61 redirects
└── src/
    ├── server.js        # Local dev server only
    ├── index.js
    └── public/          # ← the deployed site
        ├── index.html
        ├── guides/      # 59 guides in 6 categories + css/, js/
        ├── tools/       # 12 calculators + css/, js/
        ├── services/    # 8 service pages
        ├── about/  contact/  privacy/  samples/
        ├── css/  js/
        ├── sitemap.xml  # 83 entries, 1:1 with indexable pages
        ├── robots.txt   llms.txt   ads.txt
```

## License

MIT
