// Is each page live, and is the live copy the version in git?
// Vercel serves static files byte for byte, so the sha256 of the live response
// equals the sha256 of the committed file when the deploy has run.
// See memory/deploy-pipeline.md for why git alone is not proof.
import { SITE } from './lib/site.js';
import { sha256 } from './lib/parse.js';

async function fetchOnce(path) {
  const url = `${SITE}${path}${path.includes('?') ? '&' : '?'}tracker=${Date.now()}`;
  const checked_at = new Date().toISOString();
  try {
    const r = await fetch(url, {
      redirect: 'manual',
      headers: { 'Cache-Control': 'no-cache', 'User-Agent': 'OnlineHotelier-PageTracker/1.0' },
      signal: AbortSignal.timeout(20000)
    });
    const loc = r.headers.get('location');
    const body = r.status === 200 ? Buffer.from(await r.arrayBuffer()) : null;
    return {
      path, checked_at, http_status: r.status,
      live_hash: body ? sha256(body) : null,
      redirect_to: loc ? new URL(loc, SITE).pathname : null
    };
  } catch (err) {
    return { path, checked_at, http_status: 0, live_hash: null, redirect_to: null, error: err.message };
  }
}

function judge(check, target) {
  const s = check.http_status;
  if (target.deleted) {
    check.matches_repo = null;
    check.live_status = s === 200 ? 'still_live' : (s >= 300 && s < 400) || s === 404 || s === 410 ? 'gone' : 'error';
    return check;
  }
  check.matches_repo = s === 200 ? check.live_hash === target.repoHash : null;
  check.live_status =
    s === 200 ? (check.matches_repo ? 'live' : 'stale') :
    s >= 300 && s < 400 ? 'redirect' :
    s === 404 ? 'missing' : 'error';
  return check;
}

async function pool(items, size, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
  }));
  return out;
}

const PENDING = new Set(['stale', 'missing', 'error']);

// targets: [{ path, repoHash, deleted }]
// waitMs: after a push, keep re-checking pages that are not live yet, because
// Vercel takes a little while to build. 0 = check once.
export async function checkLive(targets, { waitMs = 0, intervalMs = 30000, log = () => {} } = {}) {
  const results = new Map();
  const run = async (list) => {
    const checks = await pool(list, 8, async (t) => judge(await fetchOnce(t.path), t));
    checks.forEach((c) => results.set(c.path, c));
  };

  await run(targets);
  const deadline = Date.now() + waitMs;
  let waiting = targets.filter((t) => !t.deleted && PENDING.has(results.get(t.path).live_status));
  while (waiting.length && Date.now() < deadline) {
    log(`waiting for deploy: ${waiting.length} page(s) not live yet`);
    await new Promise((r) => setTimeout(r, intervalMs));
    await run(waiting);
    waiting = waiting.filter((t) => PENDING.has(results.get(t.path).live_status));
  }
  return [...results.values()];
}
