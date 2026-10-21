(async function () {
  'use strict';
  await OH.requireAdmin('pages');
  var esc = OH.esc;
  var pages = [];
  var changesByPath = {};   // path -> changes, loaded on first expand
  var openPaths = {};       // rows the user has expanded

  function listedOk(p) {
    if (p.noindex) return true;
    if (!p.in_sitemap) return false;
    return p.type !== 'guide' || (p.in_guide_nav && p.in_guides_index);
  }

  function renderStats(lastRun) {
    var current = pages.filter(function (p) { return !p.deleted_at; });
    var weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    var stats = [
      ['Pages on the site', current.length],
      ['Live', current.filter(function (p) { return p.live_status === 'live'; }).length],
      ['Changed in last 7 days', current.filter(function (p) { return p.last_changed >= weekAgo; }).length],
      ['Not live', pages.filter(TR.isProblem).length],
      ['Failing checks', current.filter(function (p) { return p.checks_failed > 0; }).length],
      ['Not listed', current.filter(function (p) { return !listedOk(p); }).length]
    ];
    document.getElementById('stats').innerHTML = stats.map(function (s) {
      return '<div class="stat"><div class="label">' + s[0] + '</div><div class="value">' + s[1] + '</div></div>';
    }).join('');
    if (lastRun) {
      document.getElementById('sync-note').innerHTML = 'Last checked ' + OH.fmtDateTime(lastRun.finished_at || lastRun.started_at) +
        (lastRun.status === 'ok' ? '' : ' · <span class="badge bad">last run failed</span>');
    }
  }

  // ── All pages ─────────────────────────────────────────────────────────
  var aSearch = document.getElementById('a-search');
  var aType = document.getElementById('a-type');
  var aCat = document.getElementById('a-cat');
  var aProblem = document.getElementById('a-problem');
  var aLive = document.getElementById('a-live');
  var aChanged = document.getElementById('a-changed');

  function fillFilterOptions() {
    Object.keys(TR.TYPES).forEach(function (t) {
      aType.insertAdjacentHTML('beforeend', '<option value="' + t + '">' + TR.TYPES[t] + '</option>');
    });
    var cats = {};
    pages.forEach(function (p) { if (p.category) cats[p.category] = true; });
    Object.keys(cats).sort().forEach(function (c) {
      aCat.insertAdjacentHTML('beforeend', '<option value="' + esc(c) + '">' + esc(c) + '</option>');
    });
  }

  function failingNames(p) {
    if (!p.checks) return '';
    return Object.keys(p.checks).filter(function (k) { return p.checks[k].ok === false; })
      .map(function (k) { return p.checks[k].label + (p.checks[k].detail ? ': ' + p.checks[k].detail : ''); })
      .join('\n');
  }

  function checksCell(p) {
    if (p.deleted_at || !p.checks) return '';
    var keys = Object.keys(p.checks).filter(function (k) { return p.checks[k].ok !== null; });
    var passed = keys.filter(function (k) { return p.checks[k].ok; }).length;
    var cls = passed === keys.length ? 'ok' : 'bad';
    return '<span class="badge ' + cls + '" title="' + esc(failingNames(p)) + '">' + passed + '/' + keys.length + '</span>';
  }

  function tick(on, letter, needed) {
    if (!needed) return '<span class="muted">' + letter + '</span>';
    return '<span class="' + (on ? 'tick-yes' : 'tick-no') + '">' + letter + (on ? '✓' : '✗') + '</span>';
  }

  function renderAll() {
    var q = aSearch.value.trim().toLowerCase();
    var changedSince = aChanged.value ?
      new Date(Date.now() - parseInt(aChanged.value, 10) * 86400000).toISOString() : '';
    var rows = pages.filter(function (p) {
      var removedView = aProblem.value === 'removed';
      if (removedView !== !!p.deleted_at) return false;
      if (aType.value && p.type !== aType.value) return false;
      if (aCat.value && p.category !== aCat.value) return false;
      // removed pages are never "live", so the live filter would hide them all
      if (!removedView && aLive.value === 'live' && p.live_status !== 'live') return false;
      if (!removedView && aLive.value === 'notlive' && !TR.isProblem(p)) return false;
      if (changedSince && !(p.last_changed >= changedSince)) return false;
      if (aProblem.value === 'checks' && !(p.checks_failed > 0)) return false;
      if (aProblem.value === 'unlisted' && listedOk(p)) return false;
      if (q && ((p.title || '') + ' ' + p.path).toLowerCase().indexOf(q) === -1) return false;
      return true;
    }).sort(function (a, b) { return (a.last_changed || '') < (b.last_changed || '') ? 1 : -1; });

    document.getElementById('a-count').textContent = rows.length + ' of ' + pages.length + ' pages';
    var tbody = document.getElementById('all-rows');
    if (!rows.length) { tbody.innerHTML = '<tr><td colspan="8" class="empty">No pages match.</td></tr>'; return; }
    tbody.innerHTML = rows.map(function (p) {
      var isGuide = p.type === 'guide';
      var listed = p.noindex ? '<span class="muted small">noindex</span>' :
        '<span class="ticks">' + tick(p.in_sitemap, 'S', true) + tick(p.in_guide_nav, 'N', isGuide) +
        tick(p.in_guides_index, 'G', isGuide) + '</span>';
      var isOpen = !!openPaths[p.path];
      return '<tr class="row-link page-row' + (isOpen ? ' open' : '') + '" data-path="' + esc(p.path) + '" aria-expanded="' + isOpen + '">' +
        '<td class="chev">' + (isOpen ? '▾' : '▸') + '</td>' +
        '<td><strong>' + esc(p.title || p.path) + '</strong><div class="sub">' + esc(p.path) + '</div></td>' +
        '<td class="small">' + esc(TR.TYPES[p.type] || p.type || '') + (p.category ? '<div class="sub">' + esc(p.category) + '</div>' : '') + '</td>' +
        '<td class="nowrap small">' + OH.fmtDate(p.first_added) + '</td>' +
        '<td class="small">' + OH.fmtDate(p.last_changed) + '<div class="sub">' + esc(p.last_message || '') + '</div></td>' +
        '<td>' + TR.pageLive(p.live_status) + '</td>' +
        '<td class="nowrap">' + listed + '</td>' +
        '<td>' + checksCell(p) + '</td>' +
        '</tr>' +
        (isOpen ? '<tr class="page-changes"><td></td><td colspan="7">' + changesPanel(p) + '</td></tr>' : '');
    }).join('');
  }

  // ── Changes under a page ──────────────────────────────────────────────
  function changesPanel(p) {
    var links = '<div class="panel-links small">' +
      '<a href="/admin/pages/page.html?path=' + encodeURIComponent(p.path) + '">Full page details</a>' +
      (p.deleted_at ? '' : ' · <a href="https://www.onlinehotelier.com' + esc(p.path) + '" target="_blank" rel="noopener">Open live page ↗</a>') +
      '</div>';
    var list = changesByPath[p.path];
    if (list === undefined) return '<p class="muted small">Loading changes…</p>';
    if (list === null) return '<p class="muted small">Could not load changes.</p>' + links;
    if (!list.length) return '<p class="muted small">No recorded changes.</p>' + links;
    return '<ul class="timeline">' + list.map(function (ch) {
      return '<li><div class="meta">' + OH.fmtDateTime(ch.committed_at) + (ch.author ? ' · ' + esc(ch.author) : '') +
        ' · <span class="mono">' + esc(ch.commit_sha.slice(0, 7)) + '</span></div>' +
        '<div>' + TR.changeType(ch.change_type) + ' ' + TR.changeLive(ch.live_status) +
        (ch.kinds && ch.kinds.length ? ' <span class="small muted">' + esc(TR.kinds(ch.kinds)) + '</span>' : '') +
        (ch.old_path ? ' <span class="small muted">from ' + esc(ch.old_path) + '</span>' : '') + '</div>' +
        '<div class="body small">' + esc(ch.message || '') + '</div></li>';
    }).join('') + '</ul>' + links;
  }

  async function toggle(path) {
    if (openPaths[path]) { delete openPaths[path]; renderAll(); return; }
    openPaths[path] = true;
    renderAll();
    if (changesByPath[path] !== undefined) return;
    try {
      changesByPath[path] = await OH.db.select('changes',
        'select=commit_sha,committed_at,author,message,change_type,old_path,kinds,live_status' +
        '&path=eq.' + encodeURIComponent(path) + '&order=committed_at.desc&limit=100');
    } catch (ex) {
      changesByPath[path] = null;
    }
    renderAll();
  }

  document.getElementById('all-rows').addEventListener('click', function (e) {
    if (e.target.closest('a')) return;
    var row = e.target.closest('tr.page-row');
    if (row) toggle(row.dataset.path);
  });

  [aSearch].forEach(function (el) { el.addEventListener('input', renderAll); });
  [aType, aCat, aLive, aChanged, aProblem].forEach(function (el) { el.addEventListener('change', renderAll); });

  // ── Load ──────────────────────────────────────────────────────────────
  try {
    var results = await Promise.all([
      OH.db.select('pages', 'select=*&order=last_changed.desc.nullslast'),
      OH.db.select('sync_runs', 'select=*&order=started_at.desc&limit=1')
    ]);
    pages = results[0];
    if (!pages.length) {
      document.getElementById('all-rows').innerHTML =
        '<tr><td colspan="8" class="empty">No data yet. It fills in after the first GitHub page-tracker run.</td></tr>';
      return;
    }
    renderStats(results[1][0]);
    fillFilterOptions();
    renderAll();
  } catch (ex) {
    document.getElementById('all-rows').innerHTML = '<tr><td colspan="8" class="empty">Could not load: ' + esc(ex.message) + '</td></tr>';
  }
})();
