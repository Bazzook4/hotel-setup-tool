export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // Whitelist allowed parameters
  const allowed = ['q', 'check_in_date', 'check_out_date', 'adults', 'currency', 'gl', 'hl'];
  const params = new URLSearchParams();
  params.set('engine', 'google_hotels');
  params.set('api_key', apiKey);

  for (const key of allowed) {
    if (req.query[key]) {
      params.set(key, req.query[key]);
    }
  }

  // Validate required params
  if (!params.get('q')) {
    return res.status(400).json({ error: 'Missing search query (q)' });
  }

  try {
    const response = await fetch('https://serpapi.com/search.json?' + params.toString());
    const data = await response.json();

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Failed to fetch hotel data' });
  }
}
