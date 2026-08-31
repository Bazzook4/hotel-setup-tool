# Guide Template — the one source for /guides/ pages

**Everything needed to build or edit a guide is in this file.** It replaces the
old split across `guide-creation-checklist`, `faq-schema-parity` and
`guide-blocks-standard`, which drifted apart and started contradicting each
other. The tools equivalent is [[tool-page-standard]].

**Reference files:** `revenue/adr.html` for the current pattern (accordion FAQ,
four-card related block). `ota/what-is-ota.html` for the older structure still
used by unconverted categories.

Site-wide rules that are not guide-specific live in [[design-system]] (brand
colours, contrast) and [[ai-llm-optimization]] (crawler meta, schema bodies).

---

## 1. Head, in order

1. **Google Analytics** — `gtag.js?id=G-9L2N1S6S9F` at the very top.
   `G-Q2BPYRGZTM` was retired 9 Aug 2026. Values go stale: see
   [[stale-doc-false-alarms]] before reporting a mismatch as a defect.
2. **Basic meta** — charset UTF-8; viewport; **title** 60-70 chars ending
   `| OnlineHotelier`; **description** 150-160 chars with the primary keyword;
   **keywords** 8-12 terms; **canonical** full `https://www.onlinehotelier.com`
   URL; favicon `/favicon.png`.
   - The `| OnlineHotelier Insights` suffix was retired 24 Aug 2026: at 26 chars
     it pushed 32 of 52 titles past 70 and rarely survived mobile truncation.
   - **The domain is settled.** www is live, `insights.` 301-redirects to it.
     Canonicals and JSON-LD on www are CORRECT. Never flag them. See
     [[migration-plan]].
3. **Stylesheet** — `/guides/css/guide-layout.css`.
4. **AI crawler meta trio** — robots, googlebot, bingbot, with `max-snippet:-1`.
   Full markup in [[ai-llm-optimization]].
5. **AdSense** — meta tag `ca-pub-6118286051054894` + async script.
6. **Inline `<style>`** — DM Sans import, reset, CSS variables
   (`--primary: #3E3D35`, `--secondary: #89826E`), nav, breadcrumb, article,
   quick answer, highlight boxes, tables, responsive.
   **Read section 7 before adding anything here.**
7. **Schema** — Article + Organization + BreadcrumbList always; FAQPage if there
   is an FAQ; HowTo if step-by-step. Bodies in [[ai-llm-optimization]].

## 2. Body skeleton

```html
<nav class="nav">…</nav>

<div class="sidebar-overlay"></div>
<button class="sidebar-toggle" aria-label="Toggle navigation">&#9776;</button>

<div class="guide-page-layout has-toc">
  <aside class="guide-sidebar"></aside>        <!-- filled by guide-nav.js -->
  <div class="guide-main-content">
    <div class="breadcrumb">…</div>
    <article class="article-container">
      <header class="article-header">
        <h1>[40-60 chars]</h1>
        <div class="article-meta">
          <span>By OnlineHotelier Insights Team</span>
          <span>[X] min read</span>
        </div>
      </header>
      <div class="article-content">
        …                                       <!-- see section 3 -->
      </div>
    </article>
    <footer class="footer">…</footer>
  </div>
  <aside class="guide-toc"></aside>            <!-- MANDATORY, right TOC -->
</div>

<script src="/guides/js/guide-nav.js"></script>
<script src="/guides/js/guide-blocks.js"></script>
<script src="/js/wa-widget.js"></script>
<script src="/js/tools-widget.js"></script>
```

All three columns are required. `has-toc` plus **4 or more H2s** is what makes
the right TOC appear. A missing sidebar is almost always a wrong script tag:
it must be `guide-nav.js`, never `whatsapp-widget.js`.

`guide-nav.js` builds the left nav, the TOC, and prev/next + related cards where
those divs exist. `guide-blocks.js` wires the FAQ accordion, loaded after it.

## 3. Content order inside `.article-content`

```
Quick Answer Box
H2 sections (each with a unique id)
[optional CTA panels]
.explore-tools          — Related Tools & Guides, exactly 4 cards
<h2 id="faq">           — heading sits OUTSIDE .faq-section, so the TOC sees it
.faq-section            — accordion
```

`explore-tools` always comes **before** the FAQ, matching the tool pages.

### Quick Answer Box (mandatory)

```html
<div class="quick-answer">
  <h2 id="topic-in-short">[Its own heading, NOT the section title repeated]</h2>
  <div class="big-text">[Short memorable formula]</div>
  <p>[1-2 sentence explanation]</p>
</div>
```

Two traps, both shipped live on `rate-linkage.html`:

1. **Give the box a heading of its own.** Reusing the title of the section
   below puts the same words in the TOC twice. `adr.html` titles its box
   "ARR Full Form in Hotel" against a "What is ARR" section.
2. **Its white text is a cascade coin-flip** — see section 7.

### Related Tools & Guides

```html
<div class="explore-tools">
  <h3>Related Tools &amp; Guides</h3>
  <div class="tools-grid-mini">
    <a href="/tools/…" class="tool-link">
      <span class="icon">💰</span>
      <div class="text">
        <h4>Canonical Title</h4>
        <p>One line on what it does</p>
      </div>
    </a>
    <!-- exactly four -->
  </div>
</div>
```

- **Exactly four links.** Usually two tools + two guides. Never self-link.
- **One canonical icon, title and description per destination**, reused
  identically everywhere. If a destination already appears elsewhere, copy that
  wording rather than writing new.
- Heading reads exactly "Related Tools & Guides".
- **Do not duplicate what "You Might Also Like" already links to** on pages that
  still have it. The two blocks must not repeat each other.

**The grid needs four columns asked for explicitly.** Tool pages give it ~1044px
so `auto-fit` at `minmax(200px,1fr)` lands four across. Guides cap the article at
900px for readability, leaving ~756px, and the same rule drops the fourth card to
its own row. The guide sheet therefore sets
`grid-template-columns: repeat(4, minmax(0,1fr))` with a tighter gap and stacks
`.tool-link` (icon above text) because each card is only ~180px. Two across
under 1024px, one under 768px. **Do not widen the 900px cap to fix a grid** — it
is a deliberate reading measure on all 52 guides.

### FAQ

```html
<h2 id="faq">Frequently Asked Questions</h2>
<div class="faq-section">
  <div class="faq-item" id="faq-unique-slug">
    <div class="faq-question">Question text</div>
    <div class="faq-answer">Answer text</div>
  </div>
</div>
```

- `faq-question` / `faq-answer`, never `faq-q` / `faq-a`.
- Unique `id` per item (extend the slug when two questions share a prefix).
- `id="faq"` exactly on the h2, and keep it **outside** `.faq-section`.
- Answers stay in the DOM; only `display` toggles. Collapsed-by-default was the
  old concern for rich results, but the copy is present in the HTML, so schema
  and crawler parity hold. This replaced the bare `h3`/`p` `.faq-list` markup on
  the revenue guides in Aug 2026.
- The audit CTA sits **above** the FAQ.

### prev-next-nav and related-cards-section

```html
<div class="prev-next-nav"></div>
<div class="related-cards-section"></div>
```

**Removed from all 15 revenue guides** on 31 Aug 2026: with the four-card block
in place, three related-links sections stacked at the foot was repetitive. The
other 37 guides still carry them and `guide-nav.js` still owns both, so **never
delete the JS** — removing the two divs is what disables them on a page.

Follow whatever the category you are working in already does.

### Other components

- **H2s:** every one needs a semantic `id` **and** unique text, or the TOC lists
  the same entry twice.
- **Internal links:** `style="color: var(--secondary);"`. Static HTML only,
  never JS-injected — see [[crawlable-static-links]].
- **Tables:** `.comparison-table`. They scroll inside their own box on mobile.
- **Highlight boxes:** `.highlight-box`, `.highlight-box.tip`, `.example-box`.
- **Dark CTA panels:** exact markup and the contrast rule in [[design-system]] —
  the gradient must end `#6E6959`, not `#89826E` (white on `#89826E` is 3.83:1,
  under AA).

## 4. Schema

Article + Organization + BreadcrumbList on every guide; FAQPage when there is an
FAQ; HowTo for tutorials. Bodies in [[ai-llm-optimization]].

**The visible page is the source of truth. Generate schema from it, never the
reverse.** Check parity after touching either:

```python
import re,json,glob,html
def plain(x): return html.unescape(re.sub(r'<[^>]+>','',x)).strip()
for f in sorted(glob.glob('src/public/guides/*/*.html')):
    s=open(f,encoding='utf-8').read(); sq=[]
    for b in re.findall(r'<script type="application/ld\+json">\s*(.*?)\s*</script>',s,re.S):
        try: d=json.loads(b)
        except Exception: continue
        for it in (d.get('@graph',[d]) if isinstance(d,dict) else d):
            if isinstance(it,dict) and it.get('@type')=='FAQPage':
                sq=[q['name'] for q in it['mainEntity']]
    vq=[plain(x) for x in re.findall(r'class="faq-question">(.*?)</div>',s,re.S)]
    vq+=[plain(x) for x in re.findall(r'<div class="faq-list">(.*?)</div>',s,re.S) for x in re.findall(r'<h3[^>]*>(.*?)</h3>',x,re.S)]
    if sq and sorted(sq)!=sorted(vq): print('MISMATCH',f,len(sq),len(vq))
```

**Normalise before comparing** — strip tags and unescape entities, or `&amp;`
and `<strong>` bolding produce phantom findings.

Also check for **more than one FAQPage block per page**, **duplicate JSON-LD
blocks**, and **the same question asked twice**. All three shipped live:
`no-show.html` emitted Organization and BreadcrumbList twice; `arr.html` and
`occupancy.html` each had two FAQ groups asking the same things.

## 5. Post-creation checklist

1. Add the guide to `guides/js/guide-nav.js` (GUIDES array, correct category).
2. Add a `.guide-card` to `guides/[category]/index.html`, incrementing the number:
   ```html
   <a href="/guides/[category]/[slug].html" class="guide-card">
     <div class="guide-card-num">Guide N</div>
     <div class="guide-card-title">[Title]</div>
     <div class="guide-card-arrow">Read guide →</div>
   </a>
   ```
3. Add a `RELATED_CONTENT` entry in `guide-nav.js` for the new path, on any
   category that still uses the related-cards block. Without it the page falls
   back to same-category picks, and a new guide can dead-end.
4. Update [[published-guides]].
5. Add internal links from 2-3 existing related guides to the new one.
6. **Open the page** and confirm the left sidebar highlights the current guide
   and the right TOC lists every H2.

## 6. Before shipping — checks that actually catch things

Structural greps pass on pages that render wrong. All of these shipped live:

- **HTML well-formedness**, parsed. Unclosed CTA divs on `adr.html` and
  `occupancy.html` swallowed everything after them.
- **Every JSON-LD block parses**, and no `@type` appears twice.
- **FAQ schema ↔ visible parity** (section 4).
- **`explore-tools` precedes `faq-section`**, both inside `.article-content`.
- **Exactly 4 `.tool-link`**, no self-links, no overlap with related cards.
- **Unique H2 ids and unique H2 text.**
- **No page-level CSS redeclaring** `.faq-*`, `.explore-tools`, `.tool-link`.
- **Accordion opens and closes**, keyboard reachable.
- **No em dashes, no `$`.** Currency is ₹.
- **Look at the rendered page.** Three separate visual defects in the Aug 2026
  revenue pass were caught only by a screenshot: unreadable CTA text, a
  duplicated tools block, and a grid wrapping 3+1. See [[agent-verification-discipline]].

## 7. The inline-style cascade trap

Every guide's own `<style>` sets:

```css
.article-content p { margin-bottom: 1rem; color: #444; }
```

That is specificity 0,1,1 and reaches **any** `<p>` inside `.article-content`,
including those in dark panels. Anything painting text white on a dark ground
must beat it, or the copy renders dark grey on dark and is unreadable.

This shipped **twice in one session**:

- `.guide-audit-cta-body` at 0,1,0 lost outright once the CTA was nested inside
  `.article-content`.
- `.quick-answer p` at 0,1,1 **tied**, so source order decided, and on
  `rate-linkage.html` it was declared first and lost.

**Never rely on source order.** Scope the selector:

```css
.article-content .quick-answer p, .quick-answer p { color: #fff; }
.article-content .guide-audit-cta p.guide-audit-cta-body { color: rgba(255,255,255,0.9); }
```

Inline `style="color:#fff"` on the `<p>` also wins (1,0,0), which is why the
hand-written CTA panels were never affected — and why only the middle paragraph
of a panel looks wrong while the eyebrow and heading (bare `div`s) are fine.

**A grep proving a rule exists says nothing about which rule wins.** Compare
specificity and source order deliberately, or check in a browser.

## 8. Shared with the tool pages

The FAQ accordion and Related Tools block are the same component as
[[tool-page-standard]], with separate CSS/JS copies under `/guides/`. **Change
the markup contract in one place and change it in the other**, or they drift.

The one deliberate difference: guides nest both blocks inside `.article-content`,
which is already a white card, so `guide-layout.css` scopes off the card
background, shadow and radius and uses a rule separator instead. Tool pages keep
the card.

Related: [[tool-page-standard]], [[design-system]], [[ai-llm-optimization]],
[[crawlable-static-links]], [[published-guides]], [[agent-verification-discipline]]
