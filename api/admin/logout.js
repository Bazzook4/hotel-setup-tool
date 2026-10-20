// POST /api/admin/logout (Authorization: Bearer <access token>)
// Revokes this session at Supabase and clears the refresh cookie.

import { supabaseConfig, sameOrigin, authCall, clearRefreshCookie } from '../_lib/admin.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Forbidden' });

  clearRefreshCookie(res);

  const cfg = supabaseConfig();
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (cfg && token) {
    await authCall(cfg, 'logout?scope=local', { token }).catch(() => {});
  }
  return res.status(204).end();
}
