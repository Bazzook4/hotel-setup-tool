# Project memory

Durable knowledge about this site that is not derivable from the code: the page
templates, the standards they enforce, and the decisions behind them.

Files link to each other with `[[wikilink]]` syntax, using the filename without
the `.md`. Every link resolves inside this folder.

## Start here

| File | What it is |
|---|---|
| [guide-template.md](guide-template.md) | **THE template for every `/guides/` page.** Head, layout, content order, shared blocks, schema parity, post-creation checklist, pre-ship checks, and the CSS cascade trap. |
| [tool-page-standard.md](tool-page-standard.md) | **THE template for every `/tools/` page.** Head, scaffolding, shared blocks, FAQ, audit CTA, when the CEO reviews, pre-ship checks. |

These two are the single source for building or editing a page. They replaced an
earlier split across several files that drifted apart and began contradicting
each other: one still forbade the FAQ accordion that had already shipped to 15
guides.

## Standards the templates rely on

| File | What it is |
|---|---|
| [design-system.md](design-system.md) | Brand colours, tool and guide component rules, and the dark-panel white-text trap including the WCAG contrast limit on `#89826E`. |
| [ai-llm-optimization.md](ai-llm-optimization.md) | AI crawler meta trio, Organization and BreadcrumbList schema bodies, H2 id rules. |
| [crawlable-static-links.md](crawlable-static-links.md) | Internal links must be static HTML, never JS-injected. |
| [feedback_readability_standard.md](feedback_readability_standard.md) | Readability checklist for the new-hotelier audience. |
| [feedback_writing_style.md](feedback_writing_style.md) | No em dashes, bold every `channel manager`, story-first structure. |

## Facts and inventories

| File | What it is |
|---|---|
| [published-guides.md](published-guides.md) | Every published guide by category. Use it to find internal linking opportunities. |
| [india-hotel-gst-rates.md](india-hotel-gst-rates.md) | Current GST: 5% up to ₹7,500 (no ITC), 18% above. The 0% and 12% slabs died 22 Sept 2025. |
| [analytics-setup.md](analytics-setup.md) | GA4 `G-9L2N1S6S9F`, the whatsapp_click event, and why GTM is deliberately absent. |
| [brand-positioning.md](brand-positioning.md) | OnlineHotelier is a consultant and guide, not a listing agency. |
| [guides-to-services-map.md](guides-to-services-map.md) | Which guide points at which service, and the gaps. |
| [migration-plan.md](migration-plan.md) | Wix to Vercel, and folding the insights subdomain into www. |
| [dns-cutover-checklist.md](dns-cutover-checklist.md) | Historical DNS record detail. |

## Working practice

| File | What it is |
|---|---|
| [agent-verification-discipline.md](agent-verification-discipline.md) | Verify every agent finding against the files before acting on it. |
| [stale-doc-false-alarms.md](stale-doc-false-alarms.md) | Values in CLAUDE.md go stale and have caused false CRITICAL findings. Check the repo first. |
| [guide-audit-2026-08.md](guide-audit-2026-08.md) | The Aug 2026 audit: what shipped and what is still open. |
| [missing-related-cards.md](missing-related-cards.md) | Resolved Aug 2026; the category-fallback fix is still open. |

## Keeping this honest

The templates describe what the pages **actually do**, not an aspiration. When
you change a page pattern, change the template in the same commit, or the next
person reads a lie and "fixes" working code back to broken. That has already
happened here twice.
