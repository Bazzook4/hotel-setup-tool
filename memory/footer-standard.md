# Footer Standard

One footer, on every page, from one source. Standardised 2026-09-01 across all
83 non-sample pages.

## The rules

1. **Markup is identical everywhere** — the four-column footer: brand blurb,
   Learn, Free Tools, Work With Us, then a `.footer-bottom` bar with the
   copyright and `www.onlinehotelier.com`. Copy it from any page; they are
   byte-identical.
2. **Styles live in `/css/footer.css` only.** Every page carries
   `<link rel="stylesheet" href="/css/footer.css">` in `<head>`. No page defines
   `.footer*` rules in its own `<style>` block. Duplicated CSS is exactly how the
   footers drifted into a dozen variants in the first place.
3. **The footer is a direct child of `<body>`.** Never inside
   `.guide-page-layout`, `.guide-main-content`, `.tool-page-layout` or
   `.tool-main-content` — those are capped-width grid columns and the footer
   renders at ~1140px with gutters instead of full width.
4. **No counts in the link labels.** "All Guides" and "All Tools", never "All 57
   Guides". The old hardcoded numbers were both wrong (it said 57 guides against
   52 real ones, and 11 tools against the 10 the tools index links) and they go
   stale on every publish.
5. `/samples/` is **excluded**. Those are client-facing hotel mockups, not
   OnlineHotelier pages, and an OnlineHotelier footer would be wrong on them.

## Checking it

Structure, from the browser console or a CDP eval — a grep cannot see nesting:

```js
document.querySelector('footer').parentElement.tagName   // must be "BODY"
document.querySelector('footer').getBoundingClientRect().width  // must equal viewport
```

Across the repo:

```sh
# every page links the stylesheet
grep -L 'css/footer.css' $(find src/public -name '*.html' -not -path '*/samples/*')
# nobody redefines footer styles inline
grep -l '\.footer[ -{]' $(find src/public -name '*.html' -not -path '*/samples/*')
```

Both should print nothing.

## Responsive

Four columns above 768px, single column below, `.footer-bottom` stacking at the
same breakpoint. Defined once in `footer.css`; do not re-declare per page.

Related: [[design-system]], [[guide-template]], [[tool-page-standard]],
[[working-practice]]
