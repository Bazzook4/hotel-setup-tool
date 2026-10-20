(async function () {
  'use strict';
  await OH.requireAdmin('leads');
  var esc = OH.esc;
  var id = parseInt(OH.param('id'), 10);
  var lead = null;

  var form = document.getElementById('lead-form');
  var statusSel = document.getElementById('l-status');
  statusSel.innerHTML = CRM.options(CRM.STATUSES);
  document.getElementById('n-type').innerHTML = CRM.options(CRM.ACTIVITY_TYPES, 'note');

  var EDITABLE = ['status', 'next_follow_up', 'value_inr', 'lost_reason', 'name', 'phone', 'email',
    'hotel_name', 'city', 'rooms', 'service'];

  function toggleLost() {
    document.getElementById('lost-field').classList.toggle('hidden', statusSel.value !== 'lost');
  }
  statusSel.addEventListener('change', toggleLost);

  function fill() {
    document.getElementById('lead-title').textContent =
      lead.name || lead.hotel_name || lead.phone || (lead.ref ? 'Enquiry ' + lead.ref : 'Lead #' + lead.id);
    document.getElementById('lead-sub').innerHTML =
      (lead.ref ? '<span class="mono">' + esc(lead.ref) + '</span> · ' : '') +
      esc(CRM.label(CRM.SOURCES, lead.source)) + ' · received ' + OH.fmtDateTime(lead.created_at) +
      ' · ' + CRM.statusBadge(lead.status);
    EDITABLE.forEach(function (k) {
      var el = form.elements[k];
      if (el) el.value = lead[k] == null ? '' : lead[k];
    });
    toggleLost();

    var captured = [
      ['Page', lead.page_path ? '<a href="/admin/pages/page.html?path=' + encodeURIComponent(lead.page_path) + '">' + esc(lead.page_path) + '</a>' : ''],
      ['Service picked', esc(lead.service || '')],
      ['Inventory', esc(lead.inventory || '')],
      ['Location', esc(lead.location || '')],
      ['Management', esc(lead.managed || '')],
      ['Message', esc(lead.message || '')],
      ['Came from', esc(lead.referrer || '')],
      ['Campaign', esc([lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' / '))]
    ].filter(function (r) { return r[1]; });
    document.getElementById('captured').innerHTML = captured.length
      ? captured.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('')
      : '<dd class="muted">Added by hand.</dd>';
  }

  async function loadTimeline() {
    var items = await OH.db.select('lead_activities', 'select=*&lead_id=eq.' + id + '&order=at.desc');
    var el = document.getElementById('timeline');
    var created = '<li><div class="meta">' + OH.fmtDateTime(lead.created_at) + '</div><div class="body">Lead received</div></li>';
    el.innerHTML = items.map(function (a) {
      var type = a.type === 'status_change' ? 'Status change' : CRM.label(CRM.ACTIVITY_TYPES, a.type);
      return '<li><div class="meta">' + OH.fmtDateTime(a.at) + ' · ' + esc(type) +
        (a.user_email ? ' · ' + esc(a.user_email) : '') + '</div>' +
        '<div class="body">' + esc(a.body || '') + '</div></li>';
    }).join('') + created;
  }

  async function load() {
    var rows = await OH.db.select('leads', 'select=*&id=eq.' + id);
    if (!rows.length) {
      document.querySelector('main').innerHTML = '<div class="alert">Lead not found.</div><a href="/admin/leads/">Back to leads</a>';
      return false;
    }
    lead = rows[0];
    fill();
    await loadTimeline();
    return true;
  }

  async function save(patch, message) {
    var err = document.getElementById('lead-error');
    err.classList.add('hidden');
    try {
      lead = await OH.db.update('leads', 'id=eq.' + id, patch);
      fill();
      await loadTimeline();
      OH.toast(message || 'Saved');
    } catch (ex) {
      err.textContent = /lost_reason/.test(ex.message) ? 'Add the reason this lead was lost.' : ex.message;
      err.classList.remove('hidden');
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var patch = {};
    EDITABLE.forEach(function (k) {
      var v = String(form.elements[k].value).trim();
      patch[k] = v === '' ? null : (k === 'rooms' || k === 'value_inr') ? parseInt(v, 10) : v;
    });
    patch.status = patch.status || 'new';
    if (patch.status === 'lost' && !patch.lost_reason) {
      var err = document.getElementById('lead-error');
      err.textContent = 'Add the reason this lead was lost.';
      err.classList.remove('hidden');
      return;
    }
    save(patch);
  });

  async function addActivity(type, body) {
    await OH.db.insert('lead_activities', { lead_id: id, type: type, body: body });
    await loadTimeline();
  }

  document.getElementById('note-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var body = document.getElementById('n-body').value.trim();
    if (!body) return;
    try {
      await addActivity(document.getElementById('n-type').value, body);
      this.reset();
      OH.toast('Added to timeline');
    } catch (ex) { OH.toast(ex.message); }
  });

  document.getElementById('q-whatsapp').addEventListener('click', async function () {
    var body = window.prompt('What was said on WhatsApp?');
    if (!body) return;
    var patch = lead.status === 'new' ? { status: 'contacted' } : null;
    await addActivity('whatsapp', body);
    if (patch) await save(patch, 'Logged, marked contacted');
    else OH.toast('Logged');
  });

  document.getElementById('q-follow').addEventListener('click', function () {
    var d = new Date(OH.todayIso() + 'T00:00:00');
    d.setDate(d.getDate() + 3);
    var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    save({ next_follow_up: iso }, 'Follow-up set for ' + OH.fmtDate(iso));
  });

  document.getElementById('q-won').addEventListener('click', function () {
    var v = window.prompt('Deal value in ₹ (leave blank if not known)', lead.value_inr || '');
    if (v === null) return;
    var n = parseInt(String(v).replace(/[^\d]/g, ''), 10);
    save({ status: 'won', value_inr: isNaN(n) ? lead.value_inr : n, next_follow_up: null }, 'Marked won');
  });

  document.getElementById('delete-btn').addEventListener('click', async function () {
    var word = lead.ref || 'DELETE';
    var typed = window.prompt('This cannot be undone. Type ' + word + ' to delete this lead.');
    if (typed === null) return;
    if (typed.trim().toUpperCase() !== word.toUpperCase()) { OH.toast('Not deleted'); return; }
    await OH.db.remove('leads', 'id=eq.' + id);
    window.location.href = '/admin/leads/';
  });

  if (!id) { document.querySelector('main').innerHTML = '<div class="alert">No lead selected.</div>'; return; }
  try { await load(); } catch (ex) { OH.toast(ex.message); }
})();
