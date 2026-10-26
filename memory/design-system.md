## Brand Colours (ALL pages)

- Primary: `#3E3D35` | Secondary: `#89826E` | BG: `#F8F8F4`
- Primary light: `rgba(62,61,53,0.08)` | Secondary light: `rgba(137,130,110,0.12)`
- Font: `'Avenir', 'DM Sans', system fonts`
- Nav: sticky, bg `#3E3D35`; logo span `#89826E`
- Footer: bg `#3E3D35`, links `#89826E`

**NEVER use** Material Design colors: red `#c62828`, green `#2e7d32`, blue `#1565c0`, orange `#e65100`, purple `#7b1fa2`

## Dark CTA Panels (the white-text trap)

Full-width service/tool CTA panels on guide pages use a dark gradient with white text. Two things bite here, and both did in Aug 2026 across 8 blocks on 7 guides:

1. **Set `color` on the `<p>` itself, never rely on inheritance.** Guide pages define `.article-content p { color: #444 }`, which is more specific than an inline `color: white` on the parent `<div>`. The eyebrow and heading (bare `div`s, no competing rule) render white correctly while the body paragraph silently comes out near-black on a dark ground. Use `<p style="color: #fff; opacity: 0.92; ...">`.
2. **Gradient end must be `#6E6959`, not `#89826E`.** White on `#89826E` is only **3.83:1**, under the 4.5:1 WCAG AA minimum, and the body copy sits over exactly that lighter end of the gradient. `#6E6959` gives 5.49:1 and still reads as the brand secondary.

Working panel markup:

```html
<div style="background: linear-gradient(135deg, #3E3D35 0%, #6E6959 100%); border-radius: 12px; padding: 1.75rem 2rem; margin: 2rem 0; color: white;">
  <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 0.4rem;">Eyebrow</div>
  <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 0.5rem;">Headline</div>
  <p style="color: #fff; opacity: 0.92; margin-bottom: 1.25rem; font-size: 0.95rem;">Body copy.</p>
  <a href="/services/..." style="display: inline-block; background: white; color: #3E3D35; padding: 0.7rem 1.5rem; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 0.95rem;">Label &rarr;</a>
</div>
```

**Check contrast before shipping any white-on-brand combination.** `#89826E` is a mid-tone and fails AA with white in most uses. Related: [[writing-standard]].

## Guide Page Components

- Tables: `.comparison-table` with dark header (`#3E3D35`)
- Highlight boxes: `.highlight-box` (insights), `.highlight-box.tip` (pro tips)
- Cards: white bg, `border-radius 10–12px`, `box-shadow 0 2px 8px rgba(62,61,53,0.06)`
- Accent borders: `border-top` or `border-left 3–4px solid #89826E`

## Tool UI Rules (site-wide)

- Positive/payout values: `color var(--primary)`, `bg var(--primary-light)`
- Negative/cost/loss values: `color var(--secondary)`, `bg var(--secondary-light)`
- Hero card gradient: `linear-gradient(135deg, var(--primary), var(--secondary))`
- CTA buttons: `linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)` — see the dark CTA panel rule below before reusing this on a text panel
- SEO intro boxes: `bg var(--secondary-light)`, `border: 2px solid var(--secondary)` (all sides, NOT just border-left)
- Star ratings: `color var(--secondary)` — NOT gold
- Result stat cards: white bg, `border-left 4px solid var(--secondary)` or `var(--primary)`

## Tool Layout Rules (site-wide)

- Breadcrumb: `Home › Tools › [Tool Name]` — use `›` NOT `&rsaquo;`
  - Place between nav and page-header, inside `tool-main-content`
  - CSS: `background: white; padding: 1rem 2rem; border-bottom: 1px solid #eee;`
- Page header: left-aligned, `padding: 2rem 2rem 1rem` — NEVER `text-align: center`
- All content sections: `margin: 0 2rem` — NEVER `max-width: Xpx; margin: 0 auto`
- Mobile `@media max-width: 768px`: `margin: 0 1rem; padding: 1.25rem`
- All tools use `tool-page-layout` with `<aside class="tool-sidebar">` + `<div class="tool-main-content">`
- Link `<link rel="stylesheet" href="/tools/css/tool-layout.css">`

## Guide Audit CTA Panel (added 2026-08-24)

Every guide carries one `.guide-audit-cta` block pointing at `/services/ota-audit/`. CSS lives in `guides/css/guide-layout.css`.

- Gradient is `#3E3D35 → #6E6959`, deliberately different from `.quick-answer` at the top of the page so the page does not open and close with the same dark block. Note `.quick-answer` is itself inconsistent: 30 guides use flat `#3E3D35`, 11 use the primary→secondary gradient, 7 still use Material colours.
- White text needs an explicit `color` on every child, per the dark CTA panel rule.
- Structure: `.guide-audit-cta` > `.guide-audit-cta-inner` > eyebrow / heading / body / `.guide-audit-cta-btn`. The `guide-` prefix matches `.guide-page-layout`, `.guide-sidebar`, `.guide-toc`.
- Sits **inside** `.article-content`, above the FAQ h2 (or at the end where there is no FAQ). Inside matters: `.article-content` is a white card with 2.5rem padding, so a panel placed outside it floats on the page background with no container.
- Button copy is `Get Your Free OTA Audit` on all 52. Three body-copy variants by intent: OTA/distribution, Revenue+Reports, Ops/Compliance/Software.

## Table Overflow (site-wide rule)

`.article-content table { display: block; overflow-x: auto; max-width: 100%; }` in `guide-layout.css`. Wide tables previously pushed the whole page sideways on mobile across 48 guides. `display: block` is what makes `overflow` apply to a table. The rule (0,1,1) outranks the pages' own inline `.comparison-table` (0,1,0), so page-level styles do not need editing.

## Looks Designed, Not Generated (added 2026-10-26)

Adapted from the owner's web-design standards file and a UI/UX video. **The brand system above wins wherever they conflict**: the font stays `'Avenir', 'DM Sans'`, the palette stays the five brand values, and the dark brand gradients (`#3E3D35 → #6E6959`) are fine. What carries over is the anti-generic discipline.

**Hard bans on any page:**
- Purple, violet or indigo as a colour, and purple/blue/pink gradients. Already covered by the Material colour ban.
- Gradient-filled headline words.
- Stat rows of big numbers with vague labels. Show a number only if it is real and sourced (a GST rate, a commission band, a figure from `memory/ota-commission-and-tax-rates.md`).
- Emoji in headings or section titles. Use the `oh-icon` SVG set.
- "Why Choose Us?" blocks and interchangeable SaaS slogans.
- Frosted-glass cards, pill-badge clutter under a hero, and soft shadows on every card. Shadow is an accent: low opacity, high blur, popovers heavier than cards.
- Decorative numbering (`01 / 02 / 03`) unless the content is a real sequence.

**Interaction floor (every page, every tool):**
- Visible `:focus-visible` ring on every link, button, FAQ question and card: `outline: 2px solid var(--secondary); outline-offset: 2px` (white-ish on the dark nav).
- Buttons carry default, hover, pressed and disabled states; inputs carry focus and error states. Error uses `var(--secondary)` border plus `--secondary-light` fill, never red.
- Every action gets a response: a loading state while calculating, a confirmation when something is copied.
- Large headings (guide `.article-header h1`, tool `.page-header h1`) use `letter-spacing: -0.02em` and a line-height of 1.1–1.3.
- No more than about six font sizes on a content page.
- Respect `prefers-reduced-motion` on any animation. One considered motion beats scattered effects.
- Keep clutter out of the first screen: one job per page, most characteristic content first.

**Check before shipping:** screenshot at 375, 768, 1024 and 1440px; tab through the page and confirm every interactive element shows focus; read the copy and rewrite anything that could sit on any competitor's site; remove one thing that is not earning its place.

Status of the 26 Oct 2026 pass: focus rings, H1 tracking and calculate-button states are in shared CSS. Input error states, loading states, FAQ animation and the OTA calculator's roughly ten font sizes are still open. Related: [[tool-page-standard]], [[guide-template]].
