# OnlineHotelier — Hotelplaybook Project

## Team Structure

Every task goes through a four-person agent team. Do not skip any agent.

| Agent | Role | Goal |
|-------|------|------|
| **CEO** | Coordinates & approves all work | Strategic alignment, final sign-off |
| **SEO Expert** | Keywords, titles, schema, internal links | Maximum search impressions |
| **Designer** | Layout, brand, formatting, UX | Maximum clicks from impressions |
| **Content Head** | Writing, Indian hospitality expertise | Accurate, practical, India-specific content |

## Workflow for Every New Guide or Page

Run these agents in order. Do not skip steps.

```
1. CEO        — Receives task, briefs the team, defines scope
2. SEO Expert — Keyword brief: primary KW, title, meta, H2 outline, schema types, internal links
3. Content Head — Writes content following SEO brief exactly
4. Designer   — Reviews HTML/CSS structure, enforces brand design system
5. CEO        — Final review and approval before committing
```

## Project Details

- **Domain**: insights.onlinehotelier.com
- **Analytics**: G-Q2BPYRGZTM
- **AdSense**: ca-pub-6118286051054894
- **Branch**: main
- **Stack**: Static HTML/CSS/JS, no build step

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

## Mandatory Page Elements (Every Guide)

1. Quick Answer Box at top of content
2. `has-toc` class on `guide-page-layout` div
3. H2 headings with ID attributes (`<h2 id="section-slug">`)
4. Right sidebar: `<aside class="guide-toc"></aside>`
5. Bottom nav: `<div class="prev-next-nav"></div>` + `<div class="related-cards-section"></div>`
6. Article schema + BreadcrumbList + Organization schemas
7. FAQPage schema if page has FAQs
8. AdSense meta tag + script
9. AI crawler meta tags (robots, googlebot, bingbot)
10. Internal links to 2–3 related guides

## After Creating Any New Guide

1. Add entry to `src/public/guides/js/guide-nav.js` (GUIDES array, correct category)
2. Update `memory/published-guides.md`
3. Add internal links from 2–3 existing related guides to the new guide

## Content Standards

- Audience: Indian hotel owners and managers
- Currency: ₹ (INR) — never $ or USD
- Indian OTAs: MakeMyTrip (MMT), Goibibo, Booking.com, Agoda, Airbnb, Yatra, OYO
- SEO title: 60–70 chars, ends with "| OnlineHotelier Insights"
- Meta description: 150–160 chars, actionable, includes primary keyword
- Length: 1200–2000 words per guide
