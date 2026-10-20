(async function () {
  'use strict';
  await OH.requireAdmin('leads');
  var esc = OH.esc;
  var leads = [];

  var fSearch = document.getElementById('f-search');
  var fStatus = document.getElementById('f-status');
  var fSource = document.getElementById('f-source');
  var fPage = document.getElementById('f-page');
  fStatus.insertAdjacentHTML('beforeend', CRM.options(CRM.STATUSES));
  fSource.insertAdjacentHTML('beforeend', CRM.options(CRM.SOURCES));

  async function load() {
    leads = await OH.db.select('leads', 'select=*&order=created_at.desc&limit=5000');
    renderStats();
    render();
  }

  function renderStats() {
    var monthStart = OH.todayIso().slice(0, 8) + '01';
    var open = leads.filter(CRM.isOpen);
    var overdue = leads.filter(CRM.isOverdue);
    var wonThisMonth = leads.filter(function (l) {
      return l.status === 'won' && l.closed_at && l.closed_at.slice(0, 10) >= monthStart;
    });
    var newThisMonth = leads.filter(function (l) { return l.created_at.slice(0, 10) >= monthStart; });
    var wonValue = wonThisMonth.reduce(function (s, l) { return s + (l.value_inr || 0); }, 0);
    var stats = [
      ['Open leads', open.length],
      ['Overdue follow-ups', overdue.length],
      ['New this month', newThisMonth.length],
      ['Won this month', wonThisMonth.length],
      ['Won value this month', OH.fmtInr(wonValue)]
    ];
    document.getElementById('stats').innerHTML = stats.map(function (s) {
      return '<div class="stat"><div class="label">' + s[0] + '</div><div class="value">' + esc(s[1]) + '</div></div>';
    }).join('');
  }

  function matches(l) {
    var st = fStatus.value;
    if (st === 'open' && !CRM.isOpen(l)) return false;
    if (st && st !== 'open' && l.status !== st) return false;
    if (fSource.value && l.source !== fSource.value) return false;
    var p = fPage.value.trim().toLowerCase();
    if (p && (l.page_path || '').toLowerCase().indexOf(p) === -1) return false;
    var q = fSearch.value.trim().toLowerCase();
    if (q) {
      var hay = [l.ref, l.name, l.phone, l.email, l.hotel_name, l.city, l.location, l.service]
        .join(' ').toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function render() {
    var rows = leads.filter(matches);
    // Overdue follow-ups first, then newest first.
    rows.sort(function (a, b) {
      var oa = CRM.isOverdue(a) ? 0 : 1, ob = CRM.isOverdue(b) ? 0 : 1;
      if (oa !== ob) return oa - ob;
      return a.created_at < b.created_at ? 1 : -1;
    });
    var tbody = document.getElementById('rows');
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty">' +
        (leads.length ? 'No leads match these filters.' : 'No leads yet. Website enquiries appear here automatically.') +
        '</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(function (l) {
      var who = l.name || l.hotel_name
        ? esc(l.name || '') + (l.hotel_name ? '<div class="sub">' + esc(l.hotel_name) + (l.city ? ', ' + esc(l.city) : '') + '</div>' : '')
        : '<span class="muted">Not identified yet</span>' + (l.location ? '<div class="sub">' + esc(l.location) + '</div>' : '');
      var follow = l.next_follow_up
        ? (CRM.isOverdue(l) ? '<span class="badge bad">' + OH.fmtDate(l.next_follow_up) + '</span>' : OH.fmtDate(l.next_follow_up))
        : '';
      return '<tr class="row-link' + (CRM.isOverdue(l) ? ' overdue' : '') + '" data-id="' + l.id + '">' +
        '<td class="mono nowrap">' + esc(l.ref || '—') + '</td>' +
        '<td>' + who + '</td>' +
        '<td>' + esc(l.service || '') + '<div class="sub">' + esc(CRM.label(CRM.SOURCES, l.source)) + '</div></td>' +
        '<td class="small">' + esc(l.page_path || '') + '</td>' +
        '<td>' + CRM.statusBadge(l.status) + '</td>' +
        '<td class="nowrap">' + follow + '</td>' +
        '<td class="nowrap">' + OH.fmtInr(l.value_inr) + '</td>' +
        '<td class="nowrap small">' + OH.fmtDateTime(l.created_at) + '</td>' +
        '</tr>';
    }).join('');
  }

  document.getElementById('rows').addEventListener('click', function (e) {
    var tr = e.target.closest('tr[data-id]');
    if (tr) window.location.href = '/admin/leads/lead.html?id=' + tr.dataset.id;
  });
  [fSearch, fPage].forEach(function (el) { el.addEventListener('input', render); });
  [fStatus, fSource].forEach(function (el) { el.addEventListener('change', render); });

  // ── Add lead ──────────────────────────────────────────────────────────
  var dialog = document.getElementById('add-dialog');
  var form = document.getElementById('add-form');
  document.getElementById('a-source').innerHTML = CRM.options(CRM.SOURCES, 'whatsapp_direct', CRM.MANUAL_SOURCES);
  document.getElementById('add-btn').addEventListener('click', function () { form.reset(); dialog.showModal(); });
  document.getElementById('add-cancel').addEventListener('click', function () { dialog.close(); });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var err = document.getElementById('add-error');
    err.classList.add('hidden');
    var row = {};
    new FormData(form).forEach(function (v, k) {
      v = String(v).trim();
      if (v) row[k] = k === 'rooms' ? parseInt(v, 10) : v;
    });
    if (!row.name && !row.phone && !row.hotel_name) {
      err.textContent = 'Add at least a name, phone or hotel name.';
      err.classList.remove('hidden');
      return;
    }
    try {
      var lead = await OH.db.insert('leads', row);
      window.location.href = '/admin/leads/lead.html?id=' + lead.id;
    } catch (ex) {
      err.textContent = ex.message;
      err.classList.remove('hidden');
    }
  });

  // ── CSV export (also the backup: the free Supabase plan has none) ─────
  document.getElementById('export-btn').addEventListener('click', function () {
    var cols = ['id', 'ref', 'created_at', 'status', 'name', 'phone', 'email', 'hotel_name', 'city', 'rooms',
      'service', 'source', 'page_path', 'location', 'inventory', 'managed', 'message', 'value_inr',
      'lost_reason', 'next_follow_up', 'closed_at', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign'];
    var cell = function (v) {
      v = v == null ? '' : String(v);
      if (/^[=+\-@]/.test(v)) v = "'" + v; // stop spreadsheet formula injection
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    };
    var csv = [cols.join(',')].concat(leads.map(function (l) {
      return cols.map(function (c) { return cell(l[c]); }).join(',');
    })).join('\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'onlinehotelier-leads-' + OH.todayIso() + '.csv';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  try { await load(); } catch (ex) {
    document.getElementById('rows').innerHTML = '<tr><td colspan="8" class="empty">Could not load leads: ' + esc(ex.message) + '</td></tr>';
  }
})();
