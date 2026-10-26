# Site navigation (mega menu)

One shared header, `src/public/js/nav.js`, injected into `<nav id="site-nav">` on
every page that loads it (105 pages). `/admin/` and `/samples/` do not load it.

## How it works

- Guides, Tools and Services are `.has-mega` buttons, not links. Each opens a
  panel built from the `MEGA` object at the top of `nav.js`: an "all" card, then
  columns of links. Tool and service links carry a one-line `desc`.
- Opens on hover (desktop, 150ms close delay), click/tap, and keyboard. Escape
  closes. Under 769px each panel is an accordion inside the hamburger menu.
- Home, About, PMS Login and Contact stay plain links.
- Panel is `#F8F8F4` on the dark `#3E3D35` bar. Descriptions use
  `rgba(62,61,53,0.7)`, not `#89826E`, which fails contrast on light.

## Keep in sync by hand

`MEGA` is hand-curated and is **not** generated from `guide-nav.js`. The Guides
panel shows 4 guides per category, chosen for demand. When you:

- add a high-value guide, consider whether it belongs in its category column;
- add a tool or service, add it to `MEGA` (and `tool-page-standard.md` /
  `/services/` as before);
- rename or move a page, update its `MEGA` href. Every href was checked against
  the repo on 26 Oct 2026.

## Caveats

- Links are JS-injected, like the rest of the nav, so they pass little equity to
  crawlers (see [[crawlable-static-links]]). Guide and tool pages still need
  their own static internal links.
- Visual check in a browser was not done at ship time. Verify hover, mobile
  accordion and the 6-column Guides panel at 1000px before relying on it.
