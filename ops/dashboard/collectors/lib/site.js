// Where the site's pages are and how a file maps to a URL path.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = fileURLToPath(new URL('../../../../', import.meta.url));
export const PUBLIC_DIR = join(REPO, 'src', 'public');
export const PUBLIC_PREFIX = 'src/public/';
export const SITE = 'https://www.onlinehotelier.com';

// Not site pages: the admin area itself, and client sample sites.
const EXCLUDE = [/^\/admin\//, /^\/samples\//];

export function isTrackedRepoFile(repoPath) {
  if (!repoPath.startsWith(PUBLIC_PREFIX) || !repoPath.endsWith('.html')) return false;
  const p = fileToPath(repoPath);
  return !EXCLUDE.some((re) => re.test(p));
}

// src/public/guides/ota/x.html -> /guides/ota/x.html
// src/public/tools/x/index.html -> /tools/x/
export function fileToPath(repoPath) {
  let p = '/' + repoPath.slice(PUBLIC_PREFIX.length);
  if (p.endsWith('/index.html')) p = p.slice(0, -'index.html'.length);
  return p;
}

export function pathToFile(path) {
  return PUBLIC_PREFIX + (path.endsWith('/') ? path.slice(1) + 'index.html' : path.slice(1));
}

export function listPageFiles() {
  const out = [];
  (function walk(dir) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.html')) {
        const repoPath = relative(REPO, full).split(sep).join('/');
        if (isTrackedRepoFile(repoPath)) out.push(repoPath);
      }
    }
  })(PUBLIC_DIR);
  return out.sort();
}

export function classify(path) {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'guides') {
    if (path.endsWith('/')) return { type: 'hub', category: parts[1] || null };
    return { type: 'guide', category: parts.length > 2 ? parts[1] : null };
  }
  if (parts[0] === 'tools') return { type: path === '/tools/' ? 'hub' : 'tool', category: 'tools' };
  if (parts[0] === 'services') return { type: path === '/services/' ? 'hub' : 'service', category: 'services' };
  return { type: 'other', category: null };
}

// Resolve an href found on `fromPath` to a site path, or null if external.
export function resolveHref(href, fromPath) {
  if (!href || /^(mailto:|tel:|javascript:|#|data:)/i.test(href)) return null;
  let url;
  try { url = new URL(href, SITE + fromPath); } catch { return null; }
  if (!/^(www\.)?onlinehotelier\.com$/.test(url.hostname)) return null;
  let p = decodeURI(url.pathname);
  if (p.endsWith('/index.html')) p = p.slice(0, -'index.html'.length);
  return p;
}

export function readSitemapPaths() {
  const xml = readFileSync(join(PUBLIC_DIR, 'sitemap.xml'), 'utf8');
  return new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => resolveHref(m[1].trim(), '/')).filter(Boolean));
}

// guide-nav.js: GUIDE_CATEGORIES entries carry basePath, then slug lines.
export function readGuideNavPaths() {
  const js = readFileSync(join(PUBLIC_DIR, 'guides', 'js', 'guide-nav.js'), 'utf8');
  const out = new Set();
  let base = null;
  for (const m of js.matchAll(/basePath:\s*'([^']+)'|slug:\s*'([^']+)'/g)) {
    if (m[1]) base = m[1];
    else if (base) out.add(base + m[2]);
  }
  return out;
}

export function readGuidesIndexPaths() {
  const html = readFileSync(join(PUBLIC_DIR, 'guides', 'index.html'), 'utf8');
  const out = new Set();
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const p = resolveHref(m[1], '/guides/');
    if (p && p.startsWith('/guides/') && p.endsWith('.html')) out.add(p);
  }
  return out;
}

export function readRedirects() {
  const file = join(REPO, 'vercel.json');
  if (!existsSync(file)) return [];
  const cfg = JSON.parse(readFileSync(file, 'utf8'));
  return (cfg.redirects || [])
    .filter((r) => !r.has && !r.source.includes(':'))
    .map((r) => ({ from_path: r.source, to_path: r.destination }));
}
