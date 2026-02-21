// In-memory rate limiter (same approach as hotels.js)
const rateMap = new Map();
const RATE_LIMIT = 3;
const RATE_WINDOW = 3600000;

function getRateLimitKey(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';
}

function checkRateLimit(ip, cost) {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { start: now, count: cost });
    return { allowed: true, remaining: RATE_LIMIT - cost };
  }

  if (entry.count + cost > RATE_LIMIT) {
    const resetIn = Math.ceil((entry.start + RATE_WINDOW - now) / 60000);
    return { allowed: false, remaining: RATE_LIMIT - entry.count, resetIn };
  }

  entry.count += cost;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap) {
    if (now - entry.start > RATE_WINDOW) rateMap.delete(ip);
  }
}, 600000);

// Haversine distance in km
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Extract city/area from address for nearby search
function extractArea(address) {
  if (!address) return null;
  const parts = address.split(',').map(s => s.trim());
  // Remove last part (country), and the part with pincode/state
  // Typical: "Street, Area, City, State Pincode, Country"
  if (parts.length >= 3) {
    // Find the city — usually 2nd or 3rd from end, before state+pincode
    const filtered = parts.filter(p => !/^\d{6}$/.test(p) && !/india$/i.test(p));
    // Remove state+pincode combo (e.g., "Tamil Nadu 643001")
    const clean = filtered.filter(p => !/\b\d{6}\b/.test(p));
    // Take the last 2 meaningful parts as area
    if (clean.length >= 2) {
      return clean.slice(-2).join(', ');
    }
    return clean[clean.length - 1] || parts[Math.floor(parts.length / 2)];
  }
  return parts[0];
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // This endpoint costs 2 credits
  const ip = getRateLimitKey(req);
  const limit = checkRateLimit(ip, 2);
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT);
  res.setHeader('X-RateLimit-Remaining', limit.remaining);

  if (!limit.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Competitor analysis uses 2 credits. You have ' + limit.remaining + ' remaining. Try again in ' + limit.resetIn + ' minutes.'
    });
  }

  const q = req.query.q;
  if (!q) {
    return res.status(400).json({ error: 'Missing hotel name (q)' });
  }

  const radius = parseFloat(req.query.radius) || 5;
  const commonParams = {
    engine: 'google_hotels',
    api_key: apiKey,
    check_in_date: req.query.check_in_date,
    check_out_date: req.query.check_out_date,
    adults: req.query.adults || '2',
    currency: req.query.currency || 'INR',
    gl: req.query.gl || 'in',
    hl: req.query.hl || 'en'
  };

  try {
    // Step 1: Search for the user's property
    const step1Params = new URLSearchParams({ ...commonParams, q });
    const step1Res = await fetch('https://serpapi.com/search.json?' + step1Params.toString());
    const step1Data = await step1Res.json();

    // Must be a property detail response (not a listing)
    const isDetail = !step1Data.properties && (step1Data.featured_prices || step1Data.prices);
    if (!isDetail) {
      return res.status(400).json({
        error: 'Could not find a specific property for "' + q + '". Please enter your exact hotel name (e.g., "Taj Bangalore" instead of "hotels in Bangalore").',
        type: 'not_specific'
      });
    }

    // Extract property data
    const gps = step1Data.gps_coordinates;
    const allPrices = [];

    (step1Data.featured_prices || []).forEach(fp => {
      allPrices.push({
        source: fp.source || '',
        logo: fp.logo || '',
        official: fp.official || false,
        rate_per_night: fp.rate_per_night ? { extracted_lowest: fp.rate_per_night.extracted_lowest } : null,
        rooms: (fp.rooms || []).map(r => ({
          name: r.name || '',
          rate_per_night: r.rate_per_night ? { extracted_lowest: r.rate_per_night.extracted_lowest } : null
        }))
      });
    });

    (step1Data.prices || []).forEach(pr => {
      if (allPrices.some(fp => fp.source === pr.source)) return;
      allPrices.push({
        source: pr.source || '',
        logo: pr.logo || '',
        official: pr.official || false,
        rate_per_night: pr.rate_per_night ? { extracted_lowest: pr.rate_per_night.extracted_lowest } : null,
        rooms: []
      });
    });

    const myLowest = step1Data.rate_per_night?.extracted_lowest
      || allPrices.reduce((min, p) => {
        const r = p.rate_per_night?.extracted_lowest;
        return r && r < min ? r : min;
      }, Infinity);

    const myProperty = {
      name: step1Data.name || '',
      description: step1Data.description || '',
      overall_rating: step1Data.overall_rating || null,
      reviews: step1Data.reviews || 0,
      hotel_class: step1Data.hotel_class || null,
      extracted_hotel_class: step1Data.extracted_hotel_class || null,
      address: step1Data.address || '',
      gps: gps || null,
      check_in_time: step1Data.check_in_time || null,
      check_out_time: step1Data.check_out_time || null,
      lowestRate: myLowest === Infinity ? null : myLowest,
      allPrices,
      images: (step1Data.images || []).slice(0, 3).map(img => ({ thumbnail: img.thumbnail || img.original_image }))
    };

    // Step 2: Search for nearby competitors
    const area = extractArea(step1Data.address);
    if (!area) {
      return res.status(200).json({
        myProperty,
        competitors: [],
        insights: null,
        remaining: limit.remaining,
        warning: 'Could not determine area from address. Showing your property details only.'
      });
    }

    const nearbyQuery = 'hotels near ' + area;
    const step2Params = new URLSearchParams({ ...commonParams, q: nearbyQuery });
    const step2Res = await fetch('https://serpapi.com/search.json?' + step2Params.toString());
    const step2Data = await step2Res.json();

    const rawCompetitors = step2Data.properties || [];

    // Process competitors: calculate distance, filter by radius, exclude self
    const competitors = rawCompetitors
      .map(p => {
        const compGps = p.gps_coordinates;
        let distance = null;
        if (gps && compGps) {
          distance = haversine(gps.latitude, gps.longitude, compGps.latitude, compGps.longitude);
        }

        const lowestRate = p.rate_per_night?.extracted_lowest || null;

        return {
          name: p.name || '',
          overall_rating: p.overall_rating || null,
          reviews: p.reviews || 0,
          hotel_class: p.hotel_class || null,
          extracted_hotel_class: p.extracted_hotel_class || null,
          distance_km: distance !== null ? Math.round(distance * 10) / 10 : null,
          lowestRate,
          priceDiff: (lowestRate && myProperty.lowestRate) ? lowestRate - myProperty.lowestRate : null,
          priceDiffPercent: (lowestRate && myProperty.lowestRate && myProperty.lowestRate > 0)
            ? Math.round(((lowestRate - myProperty.lowestRate) / myProperty.lowestRate) * 100)
            : null,
          image: (p.images || []).slice(0, 1).map(img => img.thumbnail)[0] || null,
          amenities: (p.amenities || []).slice(0, 5)
        };
      })
      // Exclude self (fuzzy name match)
      .filter(c => c.name.toLowerCase() !== myProperty.name.toLowerCase())
      // Filter by radius (if distance available)
      .filter(c => c.distance_km === null || c.distance_km <= radius)
      // Sort by distance
      .sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));

    // Generate insights
    const competitorsWithRates = competitors.filter(c => c.lowestRate);
    const avgCompetitorRate = competitorsWithRates.length > 0
      ? Math.round(competitorsWithRates.reduce((s, c) => s + c.lowestRate, 0) / competitorsWithRates.length)
      : null;

    const avgCompetitorRating = competitorsWithRates.length > 0
      ? (competitors.filter(c => c.overall_rating).reduce((s, c) => s + c.overall_rating, 0) / competitors.filter(c => c.overall_rating).length).toFixed(1)
      : null;

    let insights = null;
    if (avgCompetitorRate && myProperty.lowestRate) {
      const diff = myProperty.lowestRate - avgCompetitorRate;
      const diffPercent = Math.round((diff / avgCompetitorRate) * 100);
      const cheaperCount = competitorsWithRates.filter(c => c.lowestRate < myProperty.lowestRate).length;

      insights = {
        avgCompetitorRate,
        avgCompetitorRating: avgCompetitorRating ? parseFloat(avgCompetitorRating) : null,
        myRate: myProperty.lowestRate,
        myRating: myProperty.overall_rating,
        positionPercent: Math.abs(diffPercent),
        position: diff > 0 ? 'above' : diff < 0 ? 'below' : 'at',
        cheaperCount,
        expensiveCount: competitorsWithRates.filter(c => c.lowestRate > myProperty.lowestRate).length,
        totalCompetitors: competitors.length,
        competitorsWithRates: competitorsWithRates.length,
        searchArea: area
      };
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      myProperty,
      competitors,
      insights,
      remaining: limit.remaining
    });

  } catch (err) {
    return res.status(502).json({ error: 'Failed to fetch competitor data. Please try again.' });
  }
}
