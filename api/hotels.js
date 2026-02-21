// In-memory rate limiter (resets on cold start, ~5-15 min on Vercel)
const rateMap = new Map();
const RATE_LIMIT = 3;        // max searches per window (250/mo free plan)
const RATE_WINDOW = 3600000; // 1 hour in ms

function getRateLimitKey(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { start: now, count: 1 });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (entry.count >= RATE_LIMIT) {
    const resetIn = Math.ceil((entry.start + RATE_WINDOW - now) / 60000);
    return { allowed: false, remaining: 0, resetIn };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

// Clean up old entries periodically (prevent memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap) {
    if (now - entry.start > RATE_WINDOW) rateMap.delete(ip);
  }
}, 600000); // every 10 min

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // Rate limit check
  const ip = getRateLimitKey(req);
  const limit = checkRateLimit(ip);
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT);
  res.setHeader('X-RateLimit-Remaining', limit.remaining);

  if (!limit.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded. You can make ' + RATE_LIMIT + ' searches per hour. Try again in ' + limit.resetIn + ' minutes.'
    });
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

    // Strip response to only what the UI needs
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
    return res.status(200).json({ properties, remaining: limit.remaining });
  } catch (err) {
    return res.status(502).json({ error: 'Failed to fetch hotel data' });
  }
}
