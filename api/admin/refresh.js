// POST /api/admin/refresh
// Swaps the refresh-token cookie for a new access token and a rotated cookie.
// Every admin page calls this on load; it is how a reload stays signed in.

import {
  COOKIE, supabaseConfig, sameOrigin, readCookie, authCall,
  setRefreshCookie, clearRefreshCookie, sessionPayload,
} from '../_lib/admin.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Forbidden' });

  const cfg = supabaseConfig();
  if (!cfg) return res.status(503).json({ error: 'Admin is not configured yet' });

  const token = readCookie(req, COOKIE);
  if (!token) return res.status(401).json({ error: 'Not signed in' });

  const r = await authCall(cfg, 'token?grant_type=refresh_token', { body: { refresh_token: token } });
  if (!r.ok || !r.data?.access_token) {
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'Session expired' });
  }

  setRefreshCookie(res, r.data.refresh_token);
  return res.status(200).json(sessionPayload(r.data));
}
