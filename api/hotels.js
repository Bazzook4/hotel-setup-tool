export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const allowed = ['q', 'check_in_date', 'check_out_date', 'adults', 'currency', 'gl', 'hl'];
  const params = new URLSearchParams();
  params.set('engine', 'google_hotels');
  params.set('api_key', apiKey);

  for (const key of allowed) {
    if (req.query[key]) {
      params.set(key, req.query[key]);
    }
  }

  if (!params.get('q')) {
    return res.status(400).json({ error: 'Missing search query (q)' });
  }

  try {
    const response = await fetch('https://serpapi.com/search.json?' + params.toString());
    const data = await response.json();

    // Strip response to only what the UI needs — hide raw API payload
    const properties = (data.properties || []).map(p => ({
      type: p.type || 'hotel',
      name: p.name || '',
      description: p.description || '',
      overall_rating: p.overall_rating || null,
      reviews: p.reviews || 0,
      hotel_class: p.hotel_class || null,
      extracted_hotel_class: p.extracted_hotel_class || null,
      free_cancellation: p.free_cancellation || false,
      amenities: (p.amenities || []).slice(0, 5),
      rate_per_night: p.rate_per_night ? {
        extracted_lowest: p.rate_per_night.extracted_lowest
      } : null,
      prices: (p.prices || []).map(pr => ({
        source: pr.source,
        logo: pr.logo,
        rate_per_night: pr.rate_per_night ? {
          extracted_lowest: pr.rate_per_night.extracted_lowest
        } : null
      })),
      images: (p.images || []).slice(0, 1).map(img => ({
        thumbnail: img.thumbnail
      }))
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ properties });
  } catch (err) {
    return res.status(502).json({ error: 'Failed to fetch hotel data' });
  }
}
