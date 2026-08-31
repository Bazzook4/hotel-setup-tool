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
