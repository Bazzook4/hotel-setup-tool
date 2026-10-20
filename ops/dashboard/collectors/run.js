#!/usr/bin/env node
// Page tracker: records every site page, its git history, template checks and
// live status in Supabase. Run by .github/workflows/page-tracker.yml.
//
//   node ops/dashboard/collectors/run.js --mode=push    after a push: waits up to 10 min for Vercel
//   node ops/dashboard/collectors/run.js --mode=daily   re-checks everything once
//   node ops/dashboard/collectors/run.js --dry-run      prints a summary, writes nothing
//
// Needs SUPABASE_URL, SUPABASE_ANON_KEY and TRACKER_SECRET unless --dry-run.
// Output goes to public GitHub Actions logs: print paths and counts only.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  REPO, listPageFiles, fileToPath, classify as classifyPath, resolveHref,
  readSitemapPaths, readGuideNavPaths, readGuidesIndexPaths, readRedirects
} from './lib/site.js';
import { parsePage, sha256 } from './lib/parse.js';
import { runChecks } from './checks.js';
import { readChanges, classify as classifyChange } from './changes.js';
import { checkLive } from './live-check.js';
import { trackerConfig, rpc } from './lib/supabase.js';

const args = process.argv.slice(2);
const mode = (args.find((a) => a.startsWith('--mode=')) || '--mode=daily').split('=')[1];
const dryRun = args.includes('--dry-run');
const skipLive = args.includes('--no-live');
const log = (...m) => console.log('[tracker]', ...m);

const startedAt = new Date().toISOString();
const cfg = trackerConfig();
if (!cfg && !dryRun) {
  log('SUPABASE_URL, SUPABASE_ANON_KEY or TRACKER_SECRET is not set. Skipping (nothing to write to yet).');
  process.exit(0);
}

async function main() {
  // ── Repo state ────────────────────────────────────────────────────────
  const ctx = {
    sitemap: readSitemapPaths(),
    guideNav: readGuideNavPaths(),
    guidesIndex: readGuidesIndexPaths(),
    inboundFromGuides: new Map()
  };
  const redirects = readRedirects();

  const files = listPageFiles();
  const current = files.map((file) => {
    const buf = readFileSync(join(REPO, file));
    const html = buf.toString('utf8');
    const path = fileToPath(file);
    return { file, path, html, repoHash: sha256(buf), parsed: parsePage(html), ...classifyPath(path) };
  });

  // Internal links: out per page, in per target (and in from guides only).
  const inboundAll = new Map();
  for (const p of current) {
    const targets = new Set(p.parsed.hrefs.map((h) => resolveHref(h, p.path)).filter((t) => t && t !== p.path));
    p.linksOut = targets.size;
    for (const t of targets) {
      inboundAll.set(t, (inboundAll.get(t) || 0) + 1);
      if (p.type === 'guide') ctx.inboundFromGuides.set(t, (ctx.inboundFromGuides.get(t) || 0) + 1);
    }
  }

  // ── History ───────────────────────────────────────────────────────────
  const history = readChanges();
  const byPath = new Map();
  for (const h of history) {
    if (!byPath.has(h.path)) byPath.set(h.path, []);
    byPath.get(h.path).push(h);
  }
  log(`${current.length} pages, ${history.length} page changes in git history`);

  const currentPaths = new Set(current.map((p) => p.path));
  const pageRows = [];

  for (const p of current) {
    const hist = byPath.get(p.path) || [];
    const added = hist.find((h) => h.change_type === 'added' || h.change_type === 'renamed') || hist[0];
    const last = hist[hist.length - 1];
    p.noindex = /noindex/i.test(p.parsed.robots);
    const { checks, failed } = runChecks({ ...p, ctx });
    pageRows.push({
      path: p.path, type: p.type, category: p.category,
      title: p.parsed.title || null, title_len: p.parsed.title ? p.parsed.title.length : null,
      meta_desc: p.parsed.metaDesc, meta_len: p.parsed.metaDesc ? p.parsed.metaDesc.length : null,
      h1: p.parsed.h1 || null, word_count: p.parsed.wordCount,
      schema_types: p.parsed.schemaTypes, canonical: p.parsed.canonical,
      internal_links_out: p.linksOut, internal_links_in: inboundAll.get(p.path) || 0,
      in_sitemap: ctx.sitemap.has(p.path), in_guide_nav: ctx.guideNav.has(p.path),
      in_guides_index: ctx.guidesIndex.has(p.path), noindex: p.noindex,
      checks, checks_failed: failed, repo_hash: p.repoHash,
      first_added: added ? added.date : null, last_changed: last ? last.date : null,
      last_commit: last ? last.sha : null, last_message: last ? last.subject : null,
      deleted_at: null
    });
  }

  // Pages that existed once and are gone now.
  const deleted = [];
  for (const [path, hist] of byPath) {
    if (currentPaths.has(path)) continue;
    const last = hist[hist.length - 1];
    if (last.change_type !== 'deleted') continue;
    const added = hist.find((h) => h.change_type === 'added' || h.change_type === 'renamed') || hist[0];
    deleted.push(path);
    pageRows.push({
      path, ...classifyPath(path), title: null, title_len: null, meta_desc: null, meta_len: null,
      h1: null, word_count: null, schema_types: null, canonical: null, internal_links_out: null,
      internal_links_in: inboundAll.get(path) || 0, in_sitemap: ctx.sitemap.has(path),
      in_guide_nav: ctx.guideNav.has(path), in_guides_index: ctx.guidesIndex.has(path),
      noindex: null, checks: null, checks_failed: null, repo_hash: null,
      first_added: added.date, last_changed: last.date, last_commit: last.sha,
      last_message: last.subject, deleted_at: last.date
    });
  }

  // ── Classify new changes ──────────────────────────────────────────────
  const known = new Set(cfg && !dryRun ? await rpc(cfg, 'tracker_known_commits', {}) : []);
  const toClassify = dryRun ? history.slice(-40) : history.filter((h) => !known.has(h.sha));
  for (const h of toClassify) h.kinds = classifyChange(h);
  log(`classified ${toClassify.length} change(s)`);

  const changeRows = history.map((h) => ({
    commit_sha: h.sha, path: h.path, committed_at: h.date, author: h.author, message: h.subject,
    change_type: h.change_type, old_path: h.old_path || null, kinds: h.kinds || null,
    lines_added: null, lines_removed: null
  }));

  // ── Live check ────────────────────────────────────────────────────────
  let checks = [];
  if (!skipLive) {
    const targets = current.map((p) => ({ path: p.path, repoHash: p.repoHash, deleted: false }))
      .concat(deleted.map((path) => ({ path, deleted: true })));
    checks = await checkLive(targets, { waitMs: mode === 'push' ? 10 * 60000 : 0, log });
  }
  const liveByPath = new Map(checks.map((c) => [c.path, c]));

  // The newest change to each page takes the page's live result.
  const statuses = [];
  for (const [path, hist] of byPath) {
    const c = liveByPath.get(path);
    if (!c) continue;
    const last = hist[hist.length - 1];
    const s = c.live_status;
    const status = last.change_type === 'deleted'
      ? (s === 'gone' ? 'live' : 'not_live')
      : s === 'live' ? 'live' : s === 'redirect' ? 'redirect' : 'not_live';
    statuses.push({ commit_sha: last.sha, path, live_status: status });
  }

  const problems = checks.filter((c) => ['stale', 'missing', 'still_live'].includes(c.live_status));
  const summary = {
    pages: current.length, deleted: deleted.length, changes: changeRows.length,
    live: checks.filter((c) => c.live_status === 'live').length,
    problems: problems.map((c) => `${c.path} (${c.live_status})`),
    failingChecks: pageRows.filter((r) => r.checks_failed > 0).length
  };

  if (dryRun) {
    log('DRY RUN, nothing written');
    console.log(JSON.stringify(summary, null, 2));
    return { summary, pageRows, changeRows, checks };
  }

  const res = await rpc(cfg, 'tracker_ingest', { p_pages: pageRows, p_changes: changeRows, p_redirects: redirects });
  log(`stored ${res.pages} pages, ${res.changes} changes`);
  if (checks.length) {
    await rpc(cfg, 'tracker_live', {
      p_checks: checks.map(({ error, ...c }) => c),
      p_statuses: statuses
    });
  }
  log(`live: ${summary.live}/${checks.length}; not live: ${problems.length}; pages failing checks: ${summary.failingChecks}`);
  return { summary, problems };
}

main().then(async (out) => {
  if (dryRun) return;
  const problems = out.problems || [];
  await rpc(cfg, 'tracker_log', {
    p_source: mode, p_started: startedAt, p_finished: new Date().toISOString(),
    p_rows: out.summary.changes, p_status: problems.length ? 'not_live' : 'ok',
    p_error: problems.length ? problems.map((c) => `${c.path}: ${c.live_status}`).join('\n') : null
  });
  if (problems.length) {
    // Fails the Action, so GitHub emails the owner.
    console.error('[tracker] NOT LIVE:\n' + problems.map((c) => `  ${c.path}  ${c.live_status}`).join('\n'));
    process.exit(1);
  }
}).catch(async (err) => {
  console.error('[tracker] failed:', err.message);
  if (cfg && !dryRun) {
    await rpc(cfg, 'tracker_log', {
      p_source: mode, p_started: startedAt, p_finished: new Date().toISOString(),
      p_rows: 0, p_status: 'error', p_error: err.message
    }).catch(() => {});
  }
  process.exit(1);
});
