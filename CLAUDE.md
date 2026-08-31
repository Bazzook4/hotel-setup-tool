# OnlineHotelier — Hotelplaybook Project

## Team Structure

Delivery work goes through the CEO and the four specialists. Do not skip any agent.

| Agent | Role | Goal |
|-------|------|------|
| **CEO** | Coordinates & approves all work | Strategic alignment, final sign-off |
| **SEO Expert** | Keywords, titles, schema, internal links | Maximum search impressions |
| **Designer** | Layout, brand, formatting, UX | Maximum clicks from impressions |
| **Content Head** | Writing, Indian hospitality expertise | Accurate, practical, India-specific content |
| **Content Strategist** | Keyword gaps, content calendar, briefs | Deciding what to build next |

Two roles sit **outside** the delivery chain and report to the owner. Neither approves work.

| Agent | Role | Goal |
|-------|------|------|
| **Consultant** | Independent audit, verifies other agents, external research | An honest outside read, with corrective actions |
| **Coordinator** | Detects drift across CLAUDE.md, memory and agent definitions | Keeps every agent's knowledge current. Drafts edits, owner approves |

Every definition lives in `.claude/agents/` in this repo, one file per agent.
Edit them there, never in `~/.claude/agents/` — a project-level agent overrides
a user-level one of the same name, so a stray copy outside the repo would
shadow the reviewed version. Definitions load at session start: after editing
one, start a new session before testing it.

## Workflow for Every New Guide or Page

Run these agents in order. Do not skip steps.

```
1. CEO        — Receives task, briefs the team, defines scope
2. SEO Expert — Keyword brief: primary KW, title, meta, H2 outline, schema types, internal links
3. Content Strategist — Validates the keyword opportunity before anything is written:
                 real search demand, no cannibalisation of an existing guide, where it
                 sits in the calendar. New topics only; skip for edits to a live page.
4. Content Head — Writes content following SEO brief exactly
5. Designer   — Reviews HTML/CSS structure, enforces brand design system
6. CEO        — Final review and approval before committing
```

## Project Details

- **Domain**: www.onlinehotelier.com (migrated from insights.onlinehotelier.com; that subdomain now 301-redirects here)
- **Analytics**: GA4 `G-9L2N1S6S9F` is the only property. See `memory/analytics-setup.md` before touching tracking; two older properties were retired on 9 Aug 2026.
- **AdSense**: ca-pub-6118286051054894
- **Branch**: main
- **Stack**: Static HTML/CSS/JS, no build step

> **Values drift, rules do not.** Anything here that is a *value* (an ID, a
> domain, a tax rate) can go stale between sessions. Two false "critical"
> audit findings have already come from trusting a stale value in this file.
> Before reporting a mismatch as a defect, check the repo and `memory/` first:
> `memory/analytics-setup.md` for tracking, `memory/migration-plan.md` for the
> domain, and the guide body copy for GST rates. The repo is the source of
> truth; this file is a summary of it.

## Brand Design System

```
Primary:       #3E3D35
Secondary:     #89826E
Primary Light: rgba(62,61,53,0.08)
Secondary Light: rgba(137,130,110,0.12)
Background:    #F8F8F4
Font:          'Avenir', 'DM Sans', system fonts
```

**NEVER use** Material Design colors on any page (no red #c62828, green #2e7d32, blue #1565c0, orange #e65100, purple #7b1fa2).

## Page Templates

**Before building or editing any page, read the template for it.** Both live in
the repo and describe what the pages actually do:

- `memory/guide-template.md` — the single template for every `/guides/` page
- `memory/tool-page-standard.md` — the single template for every `/tools/` page

`memory/README.md` indexes the rest. The list below is a summary of the guide
template, not a substitute for it.

## Mandatory Page Elements (Every Guide)

1. Quick Answer Box at top of content
2. `has-toc` class on `guide-page-layout` div
3. H2 headings with ID attributes (`<h2 id="section-slug">`)
4. Right sidebar: `<aside class="guide-toc"></aside>`
5. "Related Tools & Guides" block before the FAQ: `.explore-tools` with exactly
   four `.tool-link` cards (two tools, two guides). Revenue guides dropped the
   older `prev-next-nav` and `related-cards-section` blocks in favour of this
   one; the other categories still carry them until they get the same pass.
6. Article schema + BreadcrumbList + Organization schemas
7. FAQPage schema if page has FAQs
8. AdSense meta tag + script
9. AI crawler meta tags (robots, googlebot, bingbot)
10. Internal links to 2–3 related guides
11. `<link rel="stylesheet" href="/css/footer.css">` in the head, and the
    standard `<footer class="footer">` **outside** `guide-page-layout` as a
    direct child of `<body>`. See `memory/footer-standard.md`.

## After Creating Any New Guide

1. Add entry to `src/public/guides/js/guide-nav.js` (`GUIDE_CATEGORIES`, correct category)
2. **Add a card to `src/public/guides/index.html`** in that category's
   `.guides-grid`. This is separate hand-maintained HTML, not generated from
   `guide-nav.js`. Skipping it leaves the guide unreachable from `/guides/`,
   which is how 19 guides went unlisted until 1 Sept 2026.
3. Update `memory/published-guides.md`
4. Add internal links from 2–3 existing related guides to the new guide
5. Confirm it is live after deploying — a clean push is not a deploy. See
   `memory/deploy-pipeline.md`.

## Content Standards

- Audience: Indian hotel owners and managers
- Currency: ₹ (INR) — never $ or USD
- Indian OTAs: MakeMyTrip (MMT), Goibibo, Booking.com, Agoda, Airbnb, Yatra, OYO
- SEO title: 60–70 chars, ends with "| OnlineHotelier" (the longer "| OnlineHotelier Insights" suffix was retired: at 26 chars it pushed most titles past 70 and rarely survived mobile SERP truncation)
- Meta description: 150–160 chars, actionable, includes primary keyword
- Length: 1200–2000 words per guide
