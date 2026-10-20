// Template checks: the mandatory page elements from CLAUDE.md and
// memory/guide-template.md, read from the HTML. One function per check, so a
// template change means editing one entry here.
//
// Each check returns { ok: true | false | null, detail? }. null = not
// applicable to this page type, and it is left out of the score.

const BANNED_COLOURS = ['#c62828', '#2e7d32', '#1565c0', '#e65100', '#7b1fa2'];

const na = { ok: null };
const pass = { ok: true };
const fail = (detail) => ({ ok: false, detail });

// Is the <footer class="footer"> a direct child of <body>? We count open and
// closed container tags before it; at depth 0 it sits straight in <body>.
function footerDepth(html) {
  const body = html.search(/<body\b/i);
  const at = html.search(/<footer\b[^>]*class="[^"]*\bfooter\b/i);
  if (body < 0 || at < 0) return null;
  const between = html.slice(body, at)
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  let depth = 0;
  for (const m of between.matchAll(/<(\/?)(div|main|section|article|aside)\b[^>]*>/gi)) {
    depth += m[1] ? -1 : 1;
  }
  return depth;
}

const CHECKS = [
  ['title', 'Title 60–70 characters, ends with "| OnlineHotelier"', (p) => {
    const t = p.parsed.title;
    if (!t) return fail('no <title>');
    const problems = [];
    if (t.length < 60 || t.length > 70) problems.push(`${t.length} characters`);
    if (!/\| OnlineHotelier$/.test(t)) problems.push('suffix is not "| OnlineHotelier"');
    return problems.length ? fail(problems.join('; ')) : pass;
  }],

  ['meta', 'Meta description 150–160 characters', (p) => {
    const d = p.parsed.metaDesc;
    if (!d) return fail('missing');
    return d.length >= 150 && d.length <= 160 ? pass : fail(`${d.length} characters`);
  }],

  ['canonical', 'Canonical points to its own www URL', (p) => {
    const want = 'https://www.onlinehotelier.com' + p.path;
    if (!p.parsed.canonical) return fail('missing');
    return p.parsed.canonical === want ? pass : fail(`is ${p.parsed.canonical}`);
  }],

  ['quick_answer', 'Quick Answer box', (p) => {
    if (p.type !== 'guide') return na;
    return /class="[^"]*\bquick-answer\b/.test(p.html) ? pass : fail('no .quick-answer');
  }],

  ['toc', 'Table of contents: has-toc, guide-toc aside, H2 ids', (p) => {
    if (p.type !== 'guide') return na;
    const problems = [];
    if (!/class="[^"]*\bguide-page-layout\b[^"]*\bhas-toc\b/.test(p.html)) problems.push('no has-toc on guide-page-layout');
    if (!/<aside\b[^>]*class="[^"]*\bguide-toc\b/.test(p.html)) problems.push('no guide-toc aside');
    const missing = p.parsed.h2s.filter((h) => !h.id).length;
    if (missing) problems.push(`${missing} H2s without an id`);
    return problems.length ? fail(problems.join('; ')) : pass;
  }],

  ['explore_tools', 'Related Tools & Guides block with 4 cards', (p) => {
    // Revenue guides have been migrated; other categories still use the
    // older prev-next and related-cards blocks (CLAUDE.md, item 5).
    if (p.type !== 'guide' || p.category !== 'revenue') return na;
    const block = p.html.match(/<div\b[^>]*class="[^"]*\bexplore-tools\b[\s\S]*?(?=<div\b[^>]*class="[^"]*\bfaq-section\b|<\/article>|$)/);
    if (!block) return fail('no .explore-tools');
    const cards = (block[0].match(/class="[^"]*\btool-link\b/g) || []).length;
    return cards === 4 ? pass : fail(`${cards} cards`);
  }],

  ['schema', 'Schema: Article, BreadcrumbList, Organization (+ FAQPage)', (p) => {
    if (p.type !== 'guide') return na;
    const have = new Set(p.parsed.schemaTypes);
    const need = ['Article', 'BreadcrumbList', 'Organization'];
    if (/class="[^"]*\bfaq-(section|item)\b/.test(p.html)) need.push('FAQPage');
    const missing = need.filter((t) => !have.has(t));
    return missing.length ? fail('missing ' + missing.join(', ')) : pass;
  }],

  ['consent', 'Consent default before GA4, consent.css and consent.js', (p) => {
    const problems = [];
    const def = p.html.search(/gtag\(\s*'consent'\s*,\s*'default'/);
    const loader = p.html.search(/googletagmanager\.com\/gtag\/js/);
    if (loader > -1 && (def < 0 || def > loader)) problems.push('consent default is not before the GA4 loader');
    if (!/href="\/css\/consent\.css"/.test(p.parsed.head)) problems.push('consent.css not in head');
    if (!/src="\/js\/consent\.js"/.test(p.html)) problems.push('no consent.js');
    return problems.length ? fail(problems.join('; ')) : pass;
  }],

  ['no_adsense', 'No AdSense loader', (p) =>
    /adsbygoogle|pagead2\.googlesyndication/.test(p.html) ? fail('AdSense code found') : pass],

  ['crawler_meta', 'Crawler meta: robots, googlebot, bingbot', (p) => {
    const missing = Object.entries(p.parsed.hasMeta).filter(([, v]) => !v).map(([k]) => k);
    return missing.length ? fail('missing ' + missing.join(', ')) : pass;
  }],

  ['footer', 'Footer: footer.css linked, footer outside the layout', (p) => {
    const problems = [];
    if (!/href="\/css\/footer\.css"/.test(p.parsed.head)) problems.push('footer.css not in head');
    const depth = footerDepth(p.html);
    if (depth === null) problems.push('no <footer class="footer">');
    else if (depth !== 0) problems.push('footer is nested inside another element');
    return problems.length ? fail(problems.join('; ')) : pass;
  }],

  ['listed', 'Listed: sitemap (+ guide menu and /guides/ for guides)', (p) => {
    if (p.noindex) return na;
    const missing = [];
    if (!p.ctx.sitemap.has(p.path)) missing.push('sitemap.xml');
    if (p.type === 'guide') {
      if (!p.ctx.guideNav.has(p.path)) missing.push('guide-nav.js');
      if (!p.ctx.guidesIndex.has(p.path)) missing.push('/guides/ page');
    }
    return missing.length ? fail('not in ' + missing.join(', ')) : pass;
  }],

  ['linked_in', 'Linked from at least 2 other guides', (p) => {
    if (p.type !== 'guide') return na;
    const n = p.ctx.inboundFromGuides.get(p.path) || 0;
    return n >= 2 ? pass : fail(`${n} inbound guide link${n === 1 ? '' : 's'}`);
  }],

  ['brand_colours', 'No banned Material Design colours', (p) => {
    const found = BANNED_COLOURS.filter((c) => p.html.toLowerCase().includes(c));
    return found.length ? fail(found.join(', ')) : pass;
  }]
];

export function runChecks(page) {
  const out = {};
  let failed = 0;
  for (const [key, label, fn] of CHECKS) {
    const r = fn(page);
    out[key] = { ok: r.ok, label, ...(r.detail ? { detail: r.detail } : {}) };
    if (r.ok === false) failed++;
  }
  return { checks: out, failed };
}
