(async function () {
  'use strict';
  await OH.requireAdmin('pages');
  var esc = OH.esc;
  var pages = [];
  var byPath = {};
  var changes = [];
  var loadedDays = 0;

  // ── Tabs ──────────────────────────────────────────────────────────────
  document.querySelectorAll('.tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.tabs button').forEach(function (x) { x.classList.toggle('active', x === b); });
      document.getElementById('tab-recent').classList.toggle('hidden', b.dataset.tab !== 'recent');
      document.getElementById('tab-all').classList.toggle('hidden', b.dataset.tab !== 'all');
    });
  });

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

  // ── Recent changes ────────────────────────────────────────────────────
  var rDays = document.getElementById('r-days');
  var rType = document.getElementById('r-type');
  var rLive = document.getElementById('r-live');

  async function loadChanges() {
    var days = parseInt(rDays.value, 10);
    if (days <= loadedDays) return;
    var since = new Date(Date.now() - days * 86400000).toISOString();
    changes = await OH.db.select('changes',
      'select=commit_sha,path,committed_at,author,message,change_type,old_path,kinds,live_status' +
      '&committed_at=gte.' + encodeURIComponent(since) + '&order=committed_at.desc&limit=1000');
    loadedDays = days;
  }

  function renderRecent() {
    var since = new Date(Date.now() - parseInt(rDays.value, 10) * 86400000).toISOString();
    var rows = changes.filter(function (c) {
      if (c.committed_at < since) return false;
      if (rType.value && c.change_type !== rType.value) return false;
      if (rLive.value && c.live_status !== rLive.value) return false;
      return true;
    });
    var tbody = document.getElementById('recent-rows');
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty">No page changes in this period.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(function (c) {
      var p = byPath[c.path] || {};
      return '<tr>' +
        '<td class="nowrap small">' + OH.fmtDateTime(c.committed_at) + '</td>' +
        '<td>' + TR.pageLink(c.path, p.title) + '<div class="sub">' + esc(c.path) +
          (c.old_path ? ' (from ' + esc(c.old_path) + ')' : '') + '</div></td>' +
        '<td>' + TR.changeType(c.change_type) + '</td>' +
        '<td class="small">' + esc(TR.kinds(c.kinds)) + '</td>' +
        '<td class="small">' + esc(c.message || '') + '<div class="sub mono">' + esc(c.commit_sha.slice(0, 7)) + '</div></td>' +
        '<td>' + TR.changeLive(c.live_status) + '</td>' +
        '</tr>';
    }).join('');
  }

  rDays.addEventListener('change', async function () { await loadChanges(); renderRecent(); });
  [rType, rLive].forEach(function (el) { el.addEventListener('change', renderRecent); });

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
      if (aLive.value === 'live' && p.live_status !== 'live') return false;
      if (aLive.value === 'notlive' && !TR.isProblem(p)) return false;
      if (changedSince && !(p.last_changed >= changedSince)) return false;
      if (aProblem.value === 'checks' && !(p.checks_failed > 0)) return false;
      if (aProblem.value === 'unlisted' && listedOk(p)) return false;
      if (q && ((p.title || '') + ' ' + p.path).toLowerCase().indexOf(q) === -1) return false;
      return true;
    }).sort(function (a, b) { return (a.last_changed || '') < (b.last_changed || '') ? 1 : -1; });

    document.getElementById('a-count').textContent = rows.length + ' of ' + pages.length + ' pages';
    var tbody = document.getElementById('all-rows');
    if (!rows.length) { tbody.innerHTML = '<tr><td colspan="7" class="empty">No pages match.</td></tr>'; return; }
    tbody.innerHTML = rows.map(function (p) {
      var isGuide = p.type === 'guide';
      var listed = p.noindex ? '<span class="muted small">noindex</span>' :
        '<span class="ticks">' + tick(p.in_sitemap, 'S', true) + tick(p.in_guide_nav, 'N', isGuide) +
        tick(p.in_guides_index, 'G', isGuide) + '</span>';
      return '<tr>' +
        '<td>' + TR.pageLink(p.path, p.title) + '<div class="sub">' + esc(p.path) + '</div></td>' +
        '<td class="small">' + esc(TR.TYPES[p.type] || p.type || '') + (p.category ? '<div class="sub">' + esc(p.category) + '</div>' : '') + '</td>' +
        '<td class="nowrap small">' + OH.fmtDate(p.first_added) + '</td>' +
        '<td class="small">' + OH.fmtDate(p.last_changed) + '<div class="sub">' + esc(p.last_message || '') + '</div></td>' +
        '<td>' + TR.pageLive(p.live_status) + '</td>' +
        '<td class="nowrap">' + listed + '</td>' +
        '<td>' + checksCell(p) + '</td>' +
        '</tr>';
    }).join('');
  }

  [aSearch].forEach(function (el) { el.addEventListener('input', renderAll); });
  [aType, aCat, aLive, aChanged, aProblem].forEach(function (el) { el.addEventListener('change', renderAll); });

  // ── Load ──────────────────────────────────────────────────────────────
  try {
    var results = await Promise.all([
      OH.db.select('pages', 'select=*&order=last_changed.desc.nullslast'),
      OH.db.select('sync_runs', 'select=*&order=started_at.desc&limit=1')
    ]);
    pages = results[0];
    pages.forEach(function (p) { byPath[p.path] = p; });
    if (!pages.length) {
      document.getElementById('recent-rows').innerHTML =
        '<tr><td colspan="6" class="empty">No data yet. It fills in after the first GitHub page-tracker run.</td></tr>';
      return;
    }
    renderStats(results[1][0]);
    fillFilterOptions();
    await loadChanges();
    renderRecent();
    renderAll();
  } catch (ex) {
    document.getElementById('recent-rows').innerHTML = '<tr><td colspan="6" class="empty">Could not load: ' + esc(ex.message) + '</td></tr>';
  }
})();
