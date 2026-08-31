# Project memory

Durable knowledge about this site that is not derivable from the code: the page
templates, the standards they enforce, and the decisions behind them.

Files link to each other with double-bracket syntax using the filename without
the `.md`. Every link resolves inside this folder.

## Build or edit a page

| File | What it is |
|---|---|
| [guide-template.md](guide-template.md) | **THE template for every `/guides/` page.** Head, layout, content order, shared blocks, schema parity, post-creation checklist, pre-ship checks, and the CSS cascade trap. |
| [tool-page-standard.md](tool-page-standard.md) | **THE template for every `/tools/` page.** Head, scaffolding, shared blocks, FAQ, audit CTA, when the CEO reviews, pre-ship checks. |
| [writing-standard.md](writing-standard.md) | Who the reader is and the 10-point checklist every guide passes before commit. Jargon, ₹ examples, story-first, sentence length, no em dashes. |
| [design-system.md](design-system.md) | Brand colours, component rules, and the dark-panel white-text trap including the WCAG contrast limit on `#89826E`. |
| [ai-llm-optimization.md](ai-llm-optimization.md) | AI crawler meta trio, Organization and BreadcrumbList schema bodies, H2 id rules. |
| [crawlable-static-links.md](crawlable-static-links.md) | Internal links must be static HTML, never JS-injected, plus the internal-linking rules. |
| [footer-standard.md](footer-standard.md) | One footer everywhere, styled only from `/css/footer.css`, and always a direct child of `<body>`. |

## What to work on

| File | What it is |
|---|---|
| [backlog.md](backlog.md) | **Everything still open**, verified against the repo 31 Aug 2026. Also records what closed, so finished work does not get re-reported. |
| [published-guides.md](published-guides.md) | Every published guide by category. Use it to find internal linking opportunities. |
| [guides-to-services-map.md](guides-to-services-map.md) | Which guide points at which service, and the gaps. |

## Facts worth not re-deriving

| File | What it is |
|---|---|
| [india-hotel-gst-rates.md](india-hotel-gst-rates.md) | Current GST: 5% up to ₹7,500 (no ITC), 18% above. The 0% and 12% slabs died 22 Sept 2025. |
| [analytics-setup.md](analytics-setup.md) | GA4 `G-9L2N1S6S9F`, the whatsapp_click event, and why GTM is deliberately absent. |
| [brand-positioning.md](brand-positioning.md) | OnlineHotelier is a consultant and guide, not a listing agency. |
| [migration-plan.md](migration-plan.md) | Wix to Vercel, and folding the insights subdomain into www. Complete; www canonicals are correct and must never be flagged. |
| [deploy-pipeline.md](deploy-pipeline.md) | How the Vercel deploy works, and why a clean push is not proof the site updated. Check the live URL, not git. |

## How to work here

| File | What it is |
|---|---|
| [working-practice.md](working-practice.md) | Verify findings against the files, treat CLAUDE.md values as hints, and remember that structural checks miss what the reader sees. Each rule is there because of a real false finding or a real shipped defect. |

## Keeping this honest

The templates describe what the pages **actually do**, not an aspiration. When
you change a page pattern, change the template in the same commit, or the next
person reads a lie and "fixes" working code back to broken. That has already
happened here twice.

The same applies to the backlog: recount before carrying an item forward. The
file this replaced still claimed its work was unmerged weeks after it shipped.
