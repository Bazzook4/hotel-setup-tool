(async function () {
  'use strict';
  await OH.requireAdmin('pages');
  var esc = OH.esc;
  var path = OH.param('path');
  if (!path) { document.querySelector('main').innerHTML = '<div class="alert">No page selected.</div>'; return; }
  var q = encodeURIComponent(path);

  function kv(rows) {
    return rows.filter(function (r) { return r[1] !== '' && r[1] != null; })
      .map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
  }
  function yes(v) { return v ? '<span class="tick-yes">Yes</span>' : '<span class="tick-no">No</span>'; }

  try {
    var results = await Promise.all([
      OH.db.select('pages', 'select=*&path=eq.' + q),
      OH.db.select('changes', 'select=*&path=eq.' + q + '&order=committed_at.desc&limit=200'),
      OH.db.select('leads', 'select=id,ref,name,hotel_name,status,value_inr,created_at&page_path=eq.' + q + '&order=created_at.desc'),
      OH.db.select('live_checks', 'select=*&path=eq.' + q + '&order=checked_at.desc&limit=60')
    ]);
  } catch (ex) {
    document.querySelector('main').innerHTML = '<div class="alert">Could not load: ' + esc(ex.message) + '</div>';
    return;
  }
  var p = results[0][0];
  var changes = results[1], leads = results[2], checks = results[3];
  if (!p) { document.querySelector('main').innerHTML = '<div class="alert">This page is not in the tracker.</div>'; return; }

  document.title = (p.title || p.path) + ' | OnlineHotelier Admin';
  document.getElementById('p-title').textContent = p.title || p.path;
  document.getElementById('p-sub').innerHTML = esc(p.path) + ' · ' + esc(TR.TYPES[p.type] || '') +
    (p.category ? ' · ' + esc(p.category) : '') + ' · ' + TR.pageLive(p.live_status);
  var open = document.getElementById('p-open');
  open.href = 'https://www.onlinehotelier.com' + p.path;

  var isGuide = p.type === 'guide';
  document.getElementById('p-status').innerHTML = kv([
    ['Live', TR.pageLive(p.live_status) + (p.live_redirect_to ? ' → ' + esc(p.live_redirect_to) : '') +
      (p.live_checked_at ? '<div class="sub">checked ' + OH.fmtDateTime(p.live_checked_at) + '</div>' : '')],
    ['Added', OH.fmtDate(p.first_added)],
    ['Last changed', OH.fmtDateTime(p.last_changed) + (p.last_message ? '<div class="sub">' + esc(p.last_message) + '</div>' : '')],
    ['Removed', p.deleted_at ? OH.fmtDate(p.deleted_at) : ''],
    ['In sitemap', p.noindex ? '<span class="muted">noindex page</span>' : yes(p.in_sitemap)],
    ['In guide menu', isGuide ? yes(p.in_guide_nav) : ''],
    ['On /guides/ page', isGuide ? yes(p.in_guides_index) : '']
  ]);

  var c = p.checks || {};
  var keys = Object.keys(c);
  document.getElementById('p-checks').innerHTML = keys.length ? keys.map(function (k) {
    var item = c[k];
    var cls = item.ok === null ? 'na' : item.ok ? 'pass' : 'fail';
    var icon = item.ok === null ? '–' : item.ok ? '✓' : '✗';
    return '<li class="' + cls + '"><span class="icon">' + icon + '</span><span>' + esc(item.label) +
      (item.detail ? '<div class="sub">' + esc(item.detail) + '</div>' : '') + '</span></li>';
  }).join('') : '<li class="na">Not checked.</li>';

  document.getElementById('p-details').innerHTML = kv([
    ['Title', esc(p.title) + (p.title_len ? ' <span class="muted small">(' + p.title_len + ' chars)</span>' : '')],
    ['Meta description', esc(p.meta_desc) + (p.meta_len ? ' <span class="muted small">(' + p.meta_len + ' chars)</span>' : '')],
    ['H1', esc(p.h1)],
    ['Words', p.word_count ? p.word_count.toLocaleString('en-IN') : ''],
    ['Schema', esc((p.schema_types || []).join(', '))],
    ['Canonical', esc(p.canonical)],
    ['Internal links', p.internal_links_out != null ? p.internal_links_out + ' out · ' + (p.internal_links_in || 0) + ' in' : '']
  ]);

  document.getElementById('p-changes').innerHTML = changes.length ? changes.map(function (ch) {
    return '<li><div class="meta">' + OH.fmtDateTime(ch.committed_at) + ' · ' + esc(ch.author || '') +
      ' · <span class="mono">' + esc(ch.commit_sha.slice(0, 7)) + '</span></div>' +
      '<div>' + TR.changeType(ch.change_type) + ' ' + TR.changeLive(ch.live_status) +
      (ch.kinds && ch.kinds.length ? ' <span class="small muted">' + esc(TR.kinds(ch.kinds)) + '</span>' : '') +
      (ch.old_path ? ' <span class="small muted">from ' + esc(ch.old_path) + '</span>' : '') + '</div>' +
      '<div class="body small">' + esc(ch.message || '') + '</div></li>';
  }).join('') : '<li class="muted">No recorded changes.</li>';

  document.getElementById('p-leads').innerHTML = leads.length
    ? '<ul class="timeline">' + leads.map(function (l) {
        return '<li><a href="/admin/leads/lead.html?id=' + l.id + '">' + esc(l.name || l.hotel_name || l.ref || ('Lead #' + l.id)) + '</a> ' +
          CRM.statusBadge(l.status) + (l.value_inr ? ' ' + OH.fmtInr(l.value_inr) : '') +
          '<div class="meta">' + OH.fmtDateTime(l.created_at) + '</div></li>';
      }).join('') + '</ul>'
    : '<p class="muted">No enquiries recorded from this page yet.</p>';

  document.getElementById('p-live').innerHTML = checks.length
    ? '<table><thead><tr><th>Checked</th><th>HTTP</th><th>Matches repo</th></tr></thead><tbody>' +
      checks.map(function (k) {
        return '<tr><td class="small">' + OH.fmtDateTime(k.checked_at) + '</td><td>' + esc(k.http_status) +
          (k.redirect_to ? ' → ' + esc(k.redirect_to) : '') + '</td><td>' +
          (k.matches_repo == null ? '–' : k.matches_repo ? '<span class="tick-yes">Yes</span>' : '<span class="tick-no">No</span>') +
          '</td></tr>';
      }).join('') + '</tbody></table>'
    : '<p class="muted">No live checks yet.</p>';
})();
