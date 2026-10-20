// GET /api/admin/config: the Supabase URL and anon key for the admin pages.
// Both are public by design; RLS on every table is what protects the data.

import { supabaseConfig } from '../_lib/admin.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const cfg = supabaseConfig();
  if (!cfg) return res.status(503).json({ error: 'Admin is not configured yet' });
  return res.status(200).json({ url: cfg.url, anonKey: cfg.anonKey });
}
