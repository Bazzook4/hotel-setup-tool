# Working Practice

How to work on this project without shipping confident nonsense. Two rules,
both learned from real false findings.

## 1. Verify every finding against the files before acting on it

Run an independent check of the claim. Do not take a confident report at face
value, whether it comes from an agent, from CLAUDE.md, or from your own first
grep.

**Why:** during the 2026-08-24 guide audit, every agent produced at least one
wrong finding stated with full confidence. Acting on any of them unchecked would
have shipped a defect:

- **Content Head** said the GST rates were wrong (correct) and that the current
  slabs are 12%/18% (also wrong). Two web searches confirmed the 56th GST
  Council replaced them on **22 Sept 2025** with **5% up to ₹7,500 (no ITC) and
  18% above (with ITC)**. Publishing its correction would have put wrong tax
  rates in front of hoteliers. The same agent said "no em dashes found" and then
  found one in the next paragraph; the real count was 77.
- **SEO Expert** filed "all 59 canonicals point to the wrong domain" as CRITICAL.
  False, see rule 2. It also called 20 pages "orphans" when all were linked from
  category indexes, though the JS-injection problem it half-sensed was real.
- **Designer** said `.quick-answer` uses a gradient. Partly true: 30 pages use
  flat `#3E3D35`, 11 the brand gradient, 7 Material colours. Neither the agent
  nor the first grep had the whole picture.
- **CEO** guessed the software guides had zero inbound links. They had 2 to 21.

**How to apply:** treat reports as leads, not conclusions. Script the claim
across all files rather than trusting a sample. For anything time-sensitive
(tax rates, OTA commissions, platform policies) search the web rather than
relying on recall. When two agents conflict, read the files: the Designer and
SEO Expert disagreed on CTA placement and the answer was visible in the CSS.

## 2. Values in CLAUDE.md go stale; check the repo first

Before reporting a value mismatch (a domain, an ID, a tax rate) as a defect,
check the repo and this folder. CLAUDE.md is a summary, not the source of truth.

**Why:** this produced two false CRITICAL findings in one day, each burning a
review cycle:

1. "All 59 canonicals point to the wrong domain" because CLAUDE.md said the live
   domain was `insights.onlinehotelier.com`. It was not: `vercel.json` redirects
   `insights` → `www`, robots.txt and sitemap are on www, and zero `insights.`
   references remained. The canonicals were correct. See [[migration-plan]].
2. "Analytics missing on 52/52 guides" because CLAUDE.md named `G-Q2BPYRGZTM`.
   That property was retired 9 Aug 2026; the site uses `G-9L2N1S6S9F`.
   [[analytics-setup]] already documented this.

**How to apply:** verify against, in order: the actual files,
[[analytics-setup]] (tracking), [[migration-plan]] (domain), guide body copy
(GST rates, see [[india-hotel-gst-rates]]), git log. When you find a genuinely
stale value, fix CLAUDE.md in the same pass.

## 3. Structural checks miss what the reader sees

A grep proving a block exists says nothing about whether it is visible,
correctly nested, in the right order, or readable. In the Aug 2026 revenue pass
three defects reached production and were caught only by a screenshot:
unreadable CTA body text, a duplicated related-links block, and a four-card grid
wrapping 3+1. Two were CSS cascade problems where the rule existed with the
right value but lost to a more specific one.

**How to apply:** for any "I fixed all N pages" claim, open at least 3 of the N
and check rendered order against the reference page. Look at the page, or ask
for a screenshot, before calling a visual change done. Do not quote line-position
percentages as if they mean visual position.

The 2026-09-01 footer pass made the point twice more, and both times the source
checks passed while the browser found the defect:

- Inserting cards into `/guides/index.html` put them **inside a card's
  `.guide-meta`** once and **inside the footer** the next time, because the
  regex ran past the intended region. Link counts, tag balance and duplicate
  checks were all clean both times. The browser showed 54 elements for 52 links
  (nested `<a>` splits into two) and 1252px of horizontal overflow.
- On 55 guide and tool pages the footer was correct in the markup but nested
  inside `.guide-main-content` / `.tool-main-content`, a constrained grid
  column, so it rendered at 1140px with gutters instead of spanning the page.
  Invisible in the diff; obvious in a screenshot.

The reusable check for "is this element where I think it is" is the ancestor
chain, not a grep:

```js
let e = document.querySelector('footer').parentElement, out = [];
while (e && e.tagName !== 'HTML') { out.push(e.tagName + '.' + e.className); e = e.parentElement; }
```

`["BODY"]` means body-level. Anything else means it is wrapped, and its width
is whatever the wrapper allows.

## 4. Editing HTML with regex needs the script bodies masked out

`</div>` and `</footer>` appear inside JavaScript template literals. A regex that
walks closing tags will happily consume them and delete live code.

**Why:** the same footer pass **destroyed a 550-line `<script>` block** in
`tools/revenue-management-tool/index.html`, including the states-and-cities
data, by matching `</div>` strings inside a JS string. It was caught only
because `git diff --stat` showed one file at −511 lines when a footer swap
should be ±50.

**How to apply:** blank out script and style bodies before matching structure,
keeping the length identical so offsets into the original still line up:

```python
masked = re.sub(r'(<script\b[^>]*>)(.*?)(</script>)',
                lambda m: m.group(1) + ' '*len(m.group(2)) + m.group(3),
                s, flags=re.S|re.I)
```

Then check what you did not intend to touch: compare `<script>`, `<form>`,
`<table>` and heading counts against `git show HEAD:<file>` for every file
edited, and read `git diff --stat` before committing. A line count far from what
the edit implies is the tell.

Related: [[guide-template]], [[tool-page-standard]], [[backlog]],
[[deploy-pipeline]]
