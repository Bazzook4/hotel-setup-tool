// Shared helpers for /api/admin/* and /api/leads.
// Files under api/_lib are not deployed as functions (underscore prefix).
// Design: ops/dashboard/ARCHITECTURE.md §5 (session) and §6.1 (lead capture).

import { createHmac } from 'node:crypto';

export const COOKIE = '__Secure-oh_admin_rt';
const COOKIE_MAX_AGE = 7 * 24 * 3600; // idle timeout: rotated on every page load

export function supabaseConfig() {
  // Accept the project URL with or without the /rest/v1 suffix the Supabase
  // dashboard shows next to it.
  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/\/(rest|auth)\/v1$/, '');
  const anonKey = (process.env.SUPABASE_ANON_KEY || '').trim();
  return url && anonKey ? { url, anonKey } : null;
}

// Same-origin check for state-changing requests. The browser always sends
// Origin on POST; anything from another site is refused.
export function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (!origin || !host) return false;
  if (origin === `https://${host}`) return true;
  return /^localhost(:\d+)?$/.test(host) && origin === `http://${host}`;
}

export function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) {
      return decodeURIComponent(part.slice(i + 1).trim());
    }
  }
  return null;
}

// The refresh token lives only in this cookie: HttpOnly so no script on any
// page can read it, and Path=/api/admin so it is sent nowhere else.
export function setRefreshCookie(res, token) {
  res.setHeader('Set-Cookie',
    `${COOKIE}=${encodeURIComponent(token)}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`);
}

export function clearRefreshCookie(res) {
  res.setHeader('Set-Cookie',
    `${COOKIE}=; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
}

export async function authCall(cfg, path, { body, token } = {}) {
  const headers = { apikey: cfg.anonKey, 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(`${cfg.url}/auth/v1/${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await r.json(); } catch { /* empty body */ }
  return { ok: r.ok, status: r.status, data };
}

export function sessionPayload(data) {
  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
    user: { id: data.user?.id, email: data.user?.email },
  };
}

export function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  return null;
}

export function hashIp(ip, secret) {
  return createHmac('sha256', secret).update(ip || 'unknown').digest('hex');
}
