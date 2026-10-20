/*
 * OnlineHotelier admin: session, database calls and small UI helpers.
 *
 * The access token is kept in this script's memory only and never written to
 * localStorage or sessionStorage, because /admin/ shares its origin with every
 * public page (and GA4). The refresh token is an HttpOnly cookie that only
 * /api/admin/* can see. See ops/dashboard/ARCHITECTURE.md §5.
 */
(function () {
  'use strict';

  var config = null;     // { url, anonKey }
  var token = null;      // access token, memory only
  var user = null;       // { id, email }
  var refreshTimer = null;

  function api(path, opts) {
    opts = opts || {};
    return fetch(path, {
      method: opts.method || 'POST',
      credentials: 'same-origin',
      headers: Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {}),
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
  }

  async function loadConfig() {
    if (config) return config;
    var r = await fetch('/api/admin/config', { credentials: 'same-origin' });
    if (!r.ok) throw new Error('not_configured');
    config = await r.json();
    return config;
  }

  function useSession(data) {
    token = data.access_token;
    user = data.user;
    clearTimeout(refreshTimer);
    var ms = Math.max(60, (data.expires_in || 3600) - 120) * 1000;
    refreshTimer = setTimeout(refresh, ms);
  }

  async function refresh() {
    var r = await api('/api/admin/refresh');
    if (!r.ok) { token = null; return false; }
    useSession(await r.json());
    return true;
  }

  async function login(email, password) {
    var r = await api('/api/admin/login', { body: { email: email, password: password } });
    var data = await r.json().catch(function () { return {}; });
    if (!r.ok) throw new Error(data.error || 'Sign-in failed');
    useSession(data);
  }

  async function logout() {
    try {
      await api('/api/admin/logout', { headers: token ? { Authorization: 'Bearer ' + token } : {} });
    } finally {
      token = null;
      window.location.href = '/admin/';
    }
  }

  // ── Database (PostgREST, schema site_admin) ────────────────────────────

  async function request(method, path, body, extraHeaders, retried) {
    await loadConfig();
    var headers = Object.assign({
      apikey: config.anonKey,
      Authorization: 'Bearer ' + token,
      'Accept-Profile': 'site_admin',
      'Content-Profile': 'site_admin',
      'Content-Type': 'application/json'
    }, extraHeaders || {});
    var r = await fetch(config.url + '/rest/v1/' + path, {
      method: method,
      headers: headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (r.status === 401 && !retried && await refresh()) {
      return request(method, path, body, extraHeaders, true);
    }
    if (r.status === 401) { window.location.href = '/admin/?expired=1'; throw new Error('Session expired'); }
    var text = await r.text();
    var data = text ? JSON.parse(text) : null;
    if (!r.ok) throw new Error((data && (data.message || data.hint)) || ('Request failed (' + r.status + ')'));
    return data;
  }

  var db = {
    select: function (table, query) { return request('GET', table + (query ? '?' + query : '')); },
    insert: function (table, row) {
      return request('POST', table, row, { Prefer: 'return=representation' }).then(function (d) { return d[0]; });
    },
    update: function (table, query, patch) {
      return request('PATCH', table + '?' + query, patch, { Prefer: 'return=representation' }).then(function (d) { return d[0]; });
    },
    remove: function (table, query) { return request('DELETE', table + '?' + query); },
    rpc: function (fn, args) { return request('POST', 'rpc/' + fn, args || {}); }
  };

  async function changePassword(newPassword) {
    await loadConfig();
    var r = await fetch(config.url + '/auth/v1/user', {
      method: 'PUT',
      headers: { apikey: config.anonKey, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword })
    });
    if (!r.ok) {
      var d = await r.json().catch(function () { return {}; });
      throw new Error(d.msg || d.message || d.error_description || 'Could not change the password');
    }
  }

  // ── UI helpers ─────────────────────────────────────────────────────────

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var IST = { timeZone: 'Asia/Kolkata' };
  function fmtDate(v) {
    if (!v) return '';
    return new Date(v).toLocaleDateString('en-IN', Object.assign({ day: 'numeric', month: 'short', year: 'numeric' }, IST));
  }
  function fmtDateTime(v) {
    if (!v) return '';
    return new Date(v).toLocaleString('en-IN', Object.assign({ day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }, IST));
  }
  function fmtInr(n) {
    if (n == null || n === '') return '';
    return '₹' + Number(n).toLocaleString('en-IN');
  }
  function todayIso() {
    return new Date().toLocaleDateString('en-CA', IST); // YYYY-MM-DD in IST
  }
  function daysAgo(v) {
    return Math.floor((Date.now() - new Date(v).getTime()) / 86400000);
  }

  function toast(msg) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2600);
  }

  function param(name) { return new URLSearchParams(window.location.search).get(name); }

  function renderTopbar(active) {
    var bar = document.createElement('header');
    bar.className = 'topbar';
    bar.innerHTML =
      '<span class="brand">OnlineHotelier Admin</span>' +
      '<nav>' +
        '<a href="/admin/leads/"' + (active === 'leads' ? ' class="active"' : '') + '>Leads</a>' +
        '<a href="/admin/pages/"' + (active === 'pages' ? ' class="active"' : '') + '>Pages</a>' +
      '</nav>' +
      '<div class="who"><span>' + esc(user && user.email) + '</span>' +
        '<a href="/admin/account/">Account</a>' +
        '<button type="button" id="oh-logout">Sign out</button></div>';
    document.body.insertBefore(bar, document.body.firstChild);
    document.getElementById('oh-logout').addEventListener('click', logout);
  }

  // Every protected page calls this first. It restores the session from the
  // cookie, confirms the user is on the admin list, then draws the top bar.
  async function requireAdmin(active) {
    try { await loadConfig(); } catch (e) {
      document.body.classList.remove('hidden');
      document.body.innerHTML = '<main><div class="alert">The admin area is not configured yet (Supabase keys missing in Vercel).</div></main>';
      throw e;
    }
    if (!(await refresh())) {
      window.location.href = '/admin/?next=' + encodeURIComponent(window.location.pathname + window.location.search);
      throw new Error('redirecting');
    }
    var isAdmin = await db.rpc('is_admin');
    if (isAdmin !== true) {
      document.body.classList.remove('hidden');
      document.body.innerHTML = '<main><div class="alert">This account does not have access to the admin area.</div>' +
        '<button class="btn secondary" id="oh-out">Sign out</button></main>';
      document.getElementById('oh-out').addEventListener('click', logout);
      throw new Error('not_admin');
    }
    renderTopbar(active);
    document.body.classList.remove('hidden');
    return user;
  }

  window.OH = {
    loadConfig: loadConfig, refresh: refresh, login: login, logout: logout,
    requireAdmin: requireAdmin, changePassword: changePassword, db: db,
    esc: esc, fmtDate: fmtDate, fmtDateTime: fmtDateTime, fmtInr: fmtInr,
    todayIso: todayIso, daysAgo: daysAgo, toast: toast, param: param,
    user: function () { return user; }
  };
})();
