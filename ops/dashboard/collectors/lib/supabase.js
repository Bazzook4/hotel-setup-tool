// Calls the secret-checked tracker functions in Supabase (migration 003).
export function trackerConfig() {
  const url = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const secret = process.env.TRACKER_SECRET;
  return url && anonKey && secret ? { url, anonKey, secret } : null;
}

export async function rpc(cfg, fn, args) {
  const r = await fetch(`${cfg.url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: cfg.anonKey,
      Authorization: `Bearer ${cfg.anonKey}`,
      'Content-Type': 'application/json',
      'Content-Profile': 'site_admin'
    },
    body: JSON.stringify({ p_secret: cfg.secret, ...args })
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${fn} failed (${r.status}): ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}
