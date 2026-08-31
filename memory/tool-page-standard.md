**The reference page is `/tools/revenue-management-tool/` (Revenue Management Setup).** When anything below is ambiguous, open that page and copy what it does. Every other tool should be indistinguishable from it in how these blocks look and behave.

Every page under `/tools/` must match this. Drift here is invisible in review and only shows up as pages that "feel different". Audited and fixed across all 11 tools in Aug 2026. Pages added later had drifted the most.

## Head, in order

Same as the guides, and for the same reasons. Full detail in [[guide-template]]
section 1; the differences for tools are noted here.

1. **Google Analytics** — `gtag.js?id=G-9L2N1S6S9F`.
2. **Basic meta** — title 60-70 chars ending `| OnlineHotelier`; description
   150-160 chars with the primary keyword; canonical full
   `https://www.onlinehotelier.com` URL. The domain is settled; never flag www
   canonicals as a defect.
3. **Stylesheets** — `/tools/css/tool-layout.css` **and**
   `/tools/css/tool-blocks.css`.
4. **AI crawler meta trio** — robots, googlebot, bingbot. See
   [[ai-llm-optimization]].
5. **AdSense** — `ca-pub-6118286051054894`.
6. **Schema** — SoftwareApplication or WebApplication for the tool itself, plus
   Organization + BreadcrumbList, plus FAQPage generated from the visible FAQ.

## Required scaffolding (all of it, in this order)

```html
<body data-tool-name="Tool Name Here">
  <nav id="site-nav"></nav>

  <div class="sidebar-overlay"></div>
  <button class="sidebar-toggle" aria-label="Toggle navigation">&#9776;</button>

  <div class="tool-page-layout">
    <aside class="tool-sidebar"></aside>
    <div class="tool-main-content">

  <div id="tool-breadcrumb"></div>

  <div class="container">
    ...page content...
  </div>

    </div><!-- /tool-main-content -->
  </div><!-- /tool-page-layout -->

  <footer class="footer">…</footer>   <!-- OUTSIDE the layout div, body-level -->
```

The footer must close out of `.tool-page-layout` first. Inside
`.tool-main-content` it renders at ~1140px with gutters rather than spanning the
page — the state three tool pages were in until 2026-09-01. See
[[footer-standard]].

Plus, in `<head>`: `<link rel="stylesheet" href="/tools/css/tool-layout.css">`
and `<link rel="stylesheet" href="/css/footer.css">`
And before `</body>`, in this order:

```html
<script src="/js/nav.js"></script>
<script src="/tools/js/tool-nav.js"></script>
<script src="/tools/js/audit-cta.js"></script>
```

**Never hardcode the nav or breadcrumb.** `nav.js` injects the nav and its own CSS; `tool-nav.js` injects the sidebar (tool list + Our Services) and the breadcrumb. A page that hardcodes them ends up with no sidebar and duplicate CSS. The Revenue and Profit Estimator shipped this way for months.

**Never override `.page-header` padding.** `tool-layout.css` owns it (`margin-bottom: 2rem`). Per-page padding is what made spacing differ between tools.

## Guides now share these two blocks

The FAQ accordion and the Related Tools & Guides block were copied to the guide
pages on 31 Aug 2026 (revenue category first, 15 guides). Markup and behaviour
are identical; the CSS and JS are separate copies living under `/guides/`
(`guide-layout.css`, `guide-blocks.js`) rather than shared files.

**If you change the markup contract or the accordion behaviour here, change it
on the guide side too, or the two drift apart.** The one deliberate difference:
guides nest the blocks inside `.article-content`, which is already a white card,
so the guide sheet scopes off the card background, shadow and radius. Tool pages
keep the card. See [[guide-template]].

## Shared blocks: load these, do not restyle them

```html
<link rel="stylesheet" href="/tools/css/tool-blocks.css">
<script src="/tools/js/tool-blocks.js"></script>
```

`tool-blocks.css` holds the Related Tools and FAQ styling lifted from the reference page. `tool-blocks.js` wires the FAQ accordion, and defers automatically if a page already binds its own. Never paste these styles into a page: that is how five different looks appeared.

## Related block: exact markup from the reference page

```html
<div class="explore-tools">
  <h3>Related Tools &amp; Guides</h3>
  <div class="tools-grid-mini">
    <a href="/tools/..." class="tool-link">
      <span class="icon">💰</span>
      <div class="text">
        <h4>Tool Name</h4>
        <p>One line on what it does</p>
      </div>
    </a>
  </div>
</div>
```

**Exactly four links, never more.** Counts ranged from 2 to 8, which made the grid wrap differently on every page. Four fills two columns evenly on desktop and stacks cleanly on mobile. The usual mix is two tools, one or two guides, and nothing pointing back at the page itself.

**One canonical title, icon and description per destination, reused everywhere.** The same OTA Dependency Calculator was titled "Analyze Your Channel Mix" on one page and "OTA Dependency Calculator" on another, with different descriptions. If a destination already appears on another tool, copy that wording exactly rather than writing new.

Use `.explore-tools`, not `.resource-links`. Six tools used a flat list or a plain link row and looked nothing like the reference.

Heading reads exactly "Related Tools & Guides". Not "Explore More Tools", "Related Tools", "Useful Tools", "Reduce Your Losses", or "Related Resources". All five were in use simultaneously.

## FAQ: collapsible accordion, and schema must match

```html
<div class="faq-section">
  <h3>Frequently Asked Questions</h3>
  <div class="faq-item">
    <div class="faq-question">Question text</div>
    <div class="faq-answer">Answer text</div>
  </div>
</div>
```

Use `faq-question` / `faq-answer`, never `faq-q` / `faq-a`.

**It is an accordion, not a static list.** Answers are `display: none` until `.faq-item` gets `.open`, and the marker flips from + to minus. Three tools rendered every answer expanded, which is the most visible difference between a page that matches the reference and one that does not. Loading `tool-blocks.js` is all that is needed; do not write a new handler.

Every tool needs a FAQ. Revenue Management Results shipped with none.

**The visible FAQ is the source of truth; generate the schema from it, never the other way round.** 7 of 10 tools had drifted, with schema questions that were not on the page and page questions missing from schema. Google can treat that as a structured-data mismatch. The Demand Calendar was the worst case: 6 questions in schema, none rendered at all.

**The visible FAQ is the source of truth. Generate schema from it, never the
reverse.** Also check for duplicate JSON-LD blocks and the same question asked
twice: both shipped live on the guide side. Verify parity before shipping:

```bash
python3 -c "
import re,json
s=open('index.html',encoding='utf-8').read()
fq=[json.loads(b) for b in re.findall(r'<script type=\"application/ld\+json\">\s*(.*?)\s*</script>',s,re.S) if json.loads(b).get('@type')=='FAQPage']
sq=sorted(q['name'] for q in fq[0]['mainEntity'])
vq=sorted(re.sub(r'<[^>]+>','',x).strip() for x in re.findall(r'class=\"faq-question\"[^>]*>(.*?)</div>',s,re.S))
print('PASS' if sq==vq else 'MISMATCH', len(sq), len(vq))
"
```

## Audit CTA

Loading `/tools/js/audit-cta.js` is enough. It injects one panel after the results block, falling back to above the FAQ. A page with neither needs `<div data-audit-cta-here></div>` where the panel should go. Opt out with `<body data-audit-cta="off">`.

Do not paste the CTA markup inline. It lived in twelve copies before being centralised.

## When to bring the CEO in

Set after the user pointed out that four multi-page commits went straight to production with no review, and that the verification behind them was a grep count.

**CEO reviews before commit when a change touches any of:**

1. More than one tool or guide page in the same session. Cross-page changes are where drift accumulates.
2. Any shared JS, CSS or template rendering on multiple pages: `tools/js/*.js`, `tools/css/*.css`, `guides/js/guide-nav.js`, sitemap, schema. One bad edit hits every page.
3. The position, copy or presence of a CTA, related-links block, FAQ or schema. These are what the SERP and on-page conversion depend on.
4. Any claim of "I fixed all N pages".

**Straight through, no review:** single-page copy tweak, typo, broken image, one broken link.

**The verification rule that goes with it:** an "I fixed all N pages" claim needs the Designer to open at least 3 of the N end to end and check rendered element order against the reference page. A grep count proves a block exists; it says nothing about whether it is visible, correctly nested, or in the right order.

**Do not quote line-position percentages as if they mean visual position.** A page with large tables puts a block at 80% by line count and halfway down by height. Say "after the results block" or "before the FAQ".

**Known fragility:** `revenue-management-tool` has no results container, so its CTA relies on the `.faq-section` fallback in `audit-cta.js`. Removing that fallback silently kills the CTA on that page.

## Checks that grep cannot do

Counting `class="faq-section"` and getting 1 proves nothing. Every one of these shipped past that check:

- **Blocks nested inside `.results-container`**, which is `display:none` until the user calculates. Three tools had their FAQ or related block invisible on page load. Verify the block is a sibling of the results container, not a child.
- **A second FAQ under different markup.** Demand Calendar had its own `<details>` accordion inside `.section-card` with an `<h2 id="faq">`, so a grep for `faq-section` returned 0 and a duplicate got added. Search for the words "Frequently Asked", not the class.
- **Order.** `explore-tools` must come before `faq-section`. Three tools had it after.
- **Heading element.** `tool-blocks.css` only styles `.faq-section h3`. An `<h2>` or a `<div class="faq-title">` renders unstyled or page-styled and looks wrong.
- **Missing `<p>` in tool-link cards.** Without a description the cards are shorter and the grid rows go uneven. 33 links across six tools were bare.
- **Per-page CSS overriding the shared sheet.** 121 local rules were fighting `tool-blocks.css`. If a page defines `.faq-*` or `.explore-tools` or `.tool-link`, delete it.

When in doubt, have the Designer agent read the actual markup against the reference page. A structural grep will tell you a block exists; it will not tell you the reader can see it.

## Before shipping any tool page

1. Scaffolding matches the block above, nothing hardcoded
2. `tool-blocks.css` and `tool-blocks.js` both loaded
3. Related block uses `.explore-tools` markup, heading exactly "Related Tools & Guides"
4. FAQ present, uses `faq-question` / `faq-answer`, opens and closes on click
5. FAQ schema parity passes
6. `audit-cta.js` loaded and an anchor exists
7. HTML parses with no unclosed tags, all JSON-LD parses
8. Every class used in the body is actually styled (a page can be valid HTML and still render unstyled, see [[design-system]])

Fastest check: open the page side by side with the reference and click a FAQ on each.

## This file is the whole tools template

Everything needed to build or edit a tool page is here. The guides equivalent is
[[guide-template]], which is the single source for `/guides/`. Anything
site-wide (brand colours, contrast, the dark-panel white-text trap) is in
[[design-system]]; schema and crawler meta bodies are in [[ai-llm-optimization]].

Related: [[guide-template]], [[design-system]], [[ai-llm-optimization]]
