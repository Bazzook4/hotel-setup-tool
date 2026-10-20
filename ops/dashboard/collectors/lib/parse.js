// Pulls the SEO-relevant parts out of one of our pages. The site is hand-written
// HTML from shared templates, so targeted patterns are reliable enough and keep
// the collector free of dependencies.
import { createHash } from 'node:crypto';

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', rarr: '→', times: '×', middot: '·', '#39': "'" };

export function decode(s) {
  return String(s || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z0-9#]+);/gi, (m, n) => (n in ENTITIES ? ENTITIES[n] : m));
}

function text(html) {
  return decode(String(html || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
    out[m[1].toLowerCase()] = m[3] !== undefined ? m[3] : m[4];
  }
  return out;
}

export function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

export function parsePage(html) {
  const head = (html.match(/<head[\s\S]*?<\/head>/i) || [''])[0];

  const meta = {};
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attrs(m[0]);
    if (a.name) meta[a.name.toLowerCase()] = decode(a.content || '');
  }
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const canonical = (links.find((l) => (l.rel || '').toLowerCase() === 'canonical') || {}).href || null;

  const title = text((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
  const h1 = text((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]);
  const h2s = [...html.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi)]
    .map((m) => ({ id: attrs('<x ' + m[1] + '>').id || null, text: text(m[2]) }));

  const schemaTypes = new Set();
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    for (const t of m[1].matchAll(/"@type"\s*:\s*"([A-Za-z]+)"/g)) schemaTypes.add(t[1]);
  }

  const hrefs = [...html.matchAll(/<a\b[^>]*\bhref\s*=\s*"([^"]*)"/gi)].map((m) => m[1]);

  // Visible body text: drop scripts, styles, nav, header and footer.
  const body = (html.match(/<body[\s\S]*<\/body>/i) || [''])[0]
    .replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(nav|header|footer)\b[\s\S]*?<\/\1>/gi, ' ');
  const bodyText = text(body);
  const wordCount = bodyText ? bodyText.split(' ').length : 0;

  return {
    head,
    title,
    metaDesc: meta.description || null,
    robots: meta.robots || '',
    hasMeta: { robots: 'robots' in meta, googlebot: 'googlebot' in meta, bingbot: 'bingbot' in meta },
    canonical,
    h1,
    h2s,
    schemaTypes: [...schemaTypes].sort(),
    hrefs,
    wordCount,
    // fingerprints for change classification
    sig: {
      title: title,
      meta: meta.description || '',
      h1: h1,
      h2s: h2s.map((h) => h.text).join('\n'),
      schema: sha256((html.match(/<script[^>]+application\/ld\+json[^>]*>[\s\S]*?<\/script>/gi) || []).join('')),
      links: [...new Set(hrefs)].sort().join('\n'),
      body: sha256(bodyText)
    }
  };
}

// Which parts changed between two versions of a page.
export function diffKinds(oldHtml, newHtml) {
  const a = parsePage(oldHtml).sig;
  const b = parsePage(newHtml).sig;
  const kinds = Object.keys(a).filter((k) => a[k] !== b[k]);
  return kinds.length ? kinds : ['markup'];
}
