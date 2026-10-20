// POST /api/admin/login { email, password }
// Signs in with Supabase Auth, keeps the refresh token in an HttpOnly cookie,
// and returns only the short-lived access token.

import {
  supabaseConfig, sameOrigin, parseBody, authCall, setRefreshCookie, sessionPayload,
} from '../_lib/admin.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Forbidden' });

  const cfg = supabaseConfig();
  if (!cfg) return res.status(503).json({ error: 'Admin is not configured yet' });

  const body = parseBody(req) || {};
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || !password) return res.status(400).json({ error: 'Enter your email and password' });

  const r = await authCall(cfg, 'token?grant_type=password', { body: { email, password } });
  if (r.status === 429) return res.status(429).json({ error: 'Too many attempts. Wait a few minutes and try again.' });
  if (!r.ok || !r.data?.access_token) return res.status(401).json({ error: 'Invalid email or password' });

  setRefreshCookie(res, r.data.refresh_token);
  return res.status(200).json(sessionPayload(r.data));
}
