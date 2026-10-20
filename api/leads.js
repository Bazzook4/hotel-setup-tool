// POST /api/leads: records a WhatsApp enquiry in the admin CRM.
// Called with navigator.sendBeacon from wa-widget.js, the contact form and the
// PMS page CTAs, just before WhatsApp opens. The widget and contact form send
// the visitor's name and mobile number (both required); the privacy page
// says so. Always answers 204 so it never
// reveals anything, and never blocks the enquiry itself.
// Design: ops/dashboard/ARCHITECTURE.md §6.1.

import { supabaseConfig, parseBody, hashIp } from './_lib/admin.js';

const MAX_BYTES = 4096;
const FIELDS = ['ref', 'source', 'page_path', 'referrer', 'utm_source', 'utm_medium',
  'utm_campaign', 'service', 'inventory', 'location', 'managed', 'message', 'name', 'phone'];

function isSameSite(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = req.headers.origin;
  if (origin) return origin === `https://${host}` || origin === `http://${host}`;
  const site = req.headers['sec-fetch-site'];
  return !site || site === 'same-origin';
}

// The answer is always 204; X-Capture says what happened (stored, skipped,
// not_configured, rejected, error) without revealing anything about a lead.
function done(res, status) {
  res.setHeader('X-Capture', status);
  return res.status(204).end();
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  if (!isSameSite(req)) return done(res, 'skipped');

  const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  if (raw.length > MAX_BYTES) return done(res, 'skipped');

  const body = parseBody(req);
  if (!body || body.website) return done(res, 'skipped'); // honeypot filled: a bot

  const cfg = supabaseConfig();
  // trim: a pasted env value often carries a trailing newline or space
  const secret = (process.env.LEAD_CAPTURE_SECRET || '').trim();
  if (!cfg || !secret) return done(res, 'not_configured');

  const payload = {};
  for (const k of FIELDS) {
    if (typeof body[k] === 'string' && body[k].trim()) payload[k] = body[k].trim();
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.headers['x-real-ip'] || req.socket?.remoteAddress;

  try {
    const r = await fetch(`${cfg.url}/rest/v1/rpc/capture_lead`, {
      method: 'POST',
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
        'Content-Type': 'application/json',
        'Content-Profile': 'site_admin',
      },
      body: JSON.stringify({ p_secret: secret, p_ip_hash: hashIp(ip, secret), p_payload: payload }),
    });
    if (!r.ok) {
      console.error('capture_lead failed', r.status, await r.text());
      return done(res, r.status === 401 || r.status === 403 ? 'rejected' : 'error');
    }
  } catch (err) {
    console.error('capture_lead error', err.message);
    return done(res, 'error');
  }
  return done(res, 'stored');
}
