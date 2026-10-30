# Guide Diagram Standard

Benchmark: the animated channel manager diagram on
`guides/software/channel-manager.html` (`#channel-manager-diagram`), approved
by the owner on 30 Oct 2026. Every new explainer diagram follows it. CSS lives
in `guides/css/guide-layout.css` under "Guide diagrams".

## When to add one

Only where the topic is a flow, a calculation or a relationship that words
explain badly: how systems connect, where money goes, a process with real
steps. One diagram per guide at most. No decorative diagrams.

## What the owner rejected, and why

Three versions were built before approval:

1. **Box-and-arrow cards** (uppercase eyebrow labels, numbered circle badges,
   a dark hub box, three equal example cards, a slogan caption). Rejected as
   "looks AI generated". Every one of those elements is a template tell.
2. **A sync-log table** (timestamps, before/after per channel). Specific and
   credible, but rejected: the owner finds diagrams easier to understand.
3. **Hand-drawn-style SVG flow with one annotation**, then animated. Approved.

So: draw the system, keep it plain, and let motion tell the story.

## Build rules

- **Inline SVG inside `<figure class="guide-diagram" id="...-diagram">`**, not
  a JPG/PNG/GIF. Text stays as real `<text>` so Google reads it, it stays sharp,
  and it weighs a few KB.
- **Two SVGs:** `.gd-wide` and `.gd-tall`. Do not just shrink the wide one:
  text becomes unreadable. The switch is a **container query on the figure's
  own width** (tall below 580px), not a viewport media query. The guide
  sidebars appear from about 800px, so the column is *narrower* at 820–1100px
  (about 400–480px) than at 768px (about 670px). A viewport breakpoint showed
  the wide drawing at 8px text on tablets. Measured 30 Oct 2026.
- **Author the wide SVG for the real column.** The guide article column is
  about 630px wide at 1440px. Keep the wide viewBox near 700–720 units so
  label text lands at about 13px. A 900-unit viewBox put sub-labels under 9px.
- **Accessibility and SEO:** each SVG gets `role="img"` and
  `aria-labelledby` pointing at its own `<title>` and `<desc>`. The `<desc>`
  is a full-sentence description using the guide's primary keyword. Put a
  plain-language `<figcaption>` under the diagram that also contains the
  keyword. No slogans.
- **Namespace every id** with a guide prefix (`cm-ah`, `cm-title`) so two
  diagrams can share a page.
- **Classes:** `gd-box` (`gd-main` for the hub, `gd-direct` for direct
  booking), `gd-label`, `gd-sub`, `gd-note` (italic annotation), `gd-line`
  (`gd-hot` for the highlighted path, `gd-dash` for the return path),
  `gd-icon`, `gd-tag`, `gd-status`.
- **Brand colours only:** `#3E3D35` lines and text, `#89826E` secondary lines,
  `#6E6959` secondary text. No Material colours, no fills beyond white.
- **One annotation**, italic, with a thin leader line. Not a legend.
- **Channel lists:** never include OYO; always include the hotel's own website
  as the direct-booking channel. MakeMyTrip and Goibibo share one extranet, so
  show them as one node.

## Animation

- SMIL inside the SVG (`animateMotion` dots along the same paths as the drawn
  lines, `animate` opacity with `calcMode="discrete"` for labels). One shared
  loop length (10s) so every element stays in sync.
- Tell a real two-part story with concrete INR figures, with a numbered status
  line under the diagram (`1. ...`, `2. ...`). Numbering is allowed here
  because it is a real sequence.
- All animated elements sit in `<g class="gd-anim">`, which is hidden under
  `prefers-reduced-motion`; the static diagram still makes sense without it.

## SEO wiring when a guide gets a diagram

- Render a 1200x630 PNG of the static wide diagram with the guide title, save
  to `/images/guides/<slug>.png` (keep under ~150 KB).
- Point `og:image`, `twitter:image` and a descriptive `og:image:alt` at it.
- Add `"image"` as an `ImageObject` (url, width, height, caption) to the
  Article schema.
- Bump `dateModified` in the Article schema and `<lastmod>` in `sitemap.xml`.

## Check before shipping

Screenshot inside the real page (local server, not a standalone file) at
1440px and a true 375px. Headless Chrome will not go below 500px wide, so load
the page in a 375px iframe. Freeze the animation with `pauseAnimations()` +
`setCurrentTime()` to check each phase. Related: [[design-system]],
[[guide-template]].
