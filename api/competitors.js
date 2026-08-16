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

// ---------------------------------------------------------------------------
// Compset matching engine
// ---------------------------------------------------------------------------
// A compset is not "everything nearby". It is the set of hotels a guest would
// realistically substitute for yours. We score substitutability on class,
// rating, amenities and distance. Price is deliberately NOT a match component:
// filtering the set by price would make the price comparison circular. Price is
// applied separately as a wide sanity guard to drop hostels and palaces.

const WEIGHTS = { class: 0.35, rating: 0.25, amenities: 0.25, distance: 0.15 };

// Amenities that actually change which hotel a guest picks, weighted by how
// much they drive substitution for the Indian market.
const AMENITY_WEIGHTS = [
  { key: 'pool', weight: 3, match: /swimming pool|\bpool\b/i },
  { key: 'restaurant', weight: 3, match: /restaurant|dining|multi-?cuisine/i },
  { key: 'airport_shuttle', weight: 3, match: /airport shuttle|airport transfer/i },
  { key: 'gym', weight: 2, match: /fitness|gym\b/i },
  { key: 'spa', weight: 2, match: /\bspa\b|massage/i },
  { key: 'bar', weight: 2, match: /\bbar\b|lounge/i },
  { key: 'business', weight: 2, match: /business (centre|center)|conference|banquet|meeting room/i },
  { key: 'breakfast', weight: 2, match: /breakfast/i },
  { key: 'room_service', weight: 1, match: /room service/i },
  { key: 'parking', weight: 1, match: /parking/i },
  { key: 'wifi', weight: 1, match: /wi-?fi|internet/i },
  { key: 'ac', weight: 1, match: /air conditioning|air-conditioned/i }
];

function amenityProfile(list) {
  const joined = (list || []).join(' | ');
  const profile = {};
  for (const a of AMENITY_WEIGHTS) {
    profile[a.key] = a.match.test(joined);
  }
  return profile;
}

// Star class: full credit for same class, partial at +/-1, zero beyond.
function scoreClass(mine, theirs) {
  if (!mine || !theirs) return null;
  const gap = Math.abs(mine - theirs);
  if (gap === 0) return 1;
  if (gap <= 1) return 0.5;
  return 0;
}

// Guest rating: full credit within 0.3, tapering linearly to zero at 1.0.
function scoreRating(mine, theirs) {
  if (!mine || !theirs) return null;
  const gap = Math.abs(mine - theirs);
  if (gap <= 0.3) return 1;
  if (gap >= 1.0) return 0;
  return 1 - ((gap - 0.3) / 0.7);
}

// Weighted Jaccard overlap over the amenities that matter.
function scoreAmenities(mine, theirs, theirRawCount) {
  // Google Hotels often returns no amenities for budget Indian properties.
  // Scoring an absent list as zero would wrongly exclude real competitors,
  // so we return null and redistribute the weight instead.
  if (!theirRawCount) return null;
  let shared = 0;
  let union = 0;
  for (const a of AMENITY_WEIGHTS) {
    const m = mine[a.key];
    const t = theirs[a.key];
    if (m && t) shared += a.weight;
    if (m || t) union += a.weight;
  }
  if (union === 0) return null;
  return shared / union;
}

// Linear decay across the effective radius.
function scoreDistance(distanceKm, radiusKm) {
  if (distanceKm === null || distanceKm === undefined) return null;
  if (distanceKm >= radiusKm) return 0;
  return 1 - (distanceKm / radiusKm);
}

// Combine components, redistributing the weight of any that could not be
// scored so a missing data point never silently pushes a hotel below threshold.
function combineScore(components) {
  let totalWeight = 0;
  let weighted = 0;
  for (const [key, value] of Object.entries(components)) {
    if (value === null || value === undefined) continue;
    totalWeight += WEIGHTS[key];
    weighted += WEIGHTS[key] * value;
  }
  if (totalWeight === 0) return { score: null, confidence: 0 };
  return {
    score: Math.round((weighted / totalWeight) * 100),
    confidence: Math.round(totalWeight * 100)
  };
}

// Median and quartiles — resistant to the single luxury outlier that would
// wreck a mean on a small set.
function quantile(sortedValues, q) {
  if (sortedValues.length === 0) return null;
  const pos = (sortedValues.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedValues[base + 1] !== undefined) {
    return sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base]);
  }
  return sortedValues[base];
}

// Density-based radius. City hotels cluster tightly; leisure properties are
// spread out. We read the actual spread rather than asking the user to guess.
function autoRadius(distances) {
  const valid = distances.filter(d => d !== null && d !== undefined).sort((a, b) => a - b);
  if (valid.length < 5) return 10;
  const median = quantile(valid, 0.5);
  if (median <= 2) return 4;    // dense urban cluster
  if (median <= 5) return 6;    // suburban / tier-2 city
  if (median <= 12) return 15;  // leisure belt
  return 25;                    // remote / hill station
}

function priceGuardReason(rate, myRate) {
  if (!rate || !myRate) return null;
  const ratio = rate / myRate;
  if (ratio > 2) return 'Rate is ' + ratio.toFixed(1) + 'x yours, a different market segment';
  if (ratio < 0.5) return 'Rate is ' + (1 / ratio).toFixed(1) + 'x below yours, a different market segment';
  return null;
}

function classGapReason(mine, theirs) {
  if (!mine || !theirs) return null;
  const gap = Math.abs(mine - theirs);
  if (gap >= 2) return theirs + '-star vs your ' + mine + '-star';
  return null;
}

// Positioning stats built on the primary compset only. Median and percentile
// replace the mean: on a set of 6-12 hotels a single luxury listing moves a
// mean enough to invert the recommendation.
function buildInsights(primary, myProperty, area, meta) {
  const withRates = primary.filter(c => c.lowestRate);
  const myRate = myProperty.lowestRate;

  if (withRates.length === 0 || !myRate) {
    return {
      myRate: myRate || null,
      myRating: myProperty.overall_rating,
      compsetSize: primary.length,
      competitorsWithRates: 0,
      thinSample: true,
      searchArea: area,
      ...meta
    };
  }

  const rates = withRates.map(c => c.lowestRate).sort((a, b) => a - b);
  const median = Math.round(quantile(rates, 0.5));
  const q1 = Math.round(quantile(rates, 0.25));
  const q3 = Math.round(quantile(rates, 0.75));

  const cheaperCount = rates.filter(r => r < myRate).length;
  const percentile = Math.round((cheaperCount / rates.length) * 100);

  const diff = myRate - median;
  const diffPercent = median > 0 ? Math.round((diff / median) * 100) : 0;

  const ratedComps = primary.filter(c => c.overall_rating);
  const medianRating = ratedComps.length
    ? parseFloat(quantile(ratedComps.map(c => parseFloat(c.overall_rating)).sort((a, b) => a - b), 0.5).toFixed(1))
    : null;

  return {
    myRate,
    myRating: myProperty.overall_rating,
    medianRate: median,
    q1,
    q3,
    minRate: rates[0],
    maxRate: rates[rates.length - 1],
    percentile,
    position: diff > 0 ? 'above' : diff < 0 ? 'below' : 'at',
    positionPercent: Math.abs(diffPercent),
    cheaperCount,
    expensiveCount: rates.filter(r => r > myRate).length,
    medianCompetitorRating: medianRating,
    compsetSize: primary.length,
    competitorsWithRates: withRates.length,
    // Below six close matches the sample cannot support a pricing directive.
    thinSample: primary.length < 6,
    searchArea: area,
    ...meta
  };
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

    const myClass = myProperty.extracted_hotel_class || parseInt(myProperty.hotel_class) || null;
    const myRating = myProperty.overall_rating ? parseFloat(myProperty.overall_rating) : null;
    const myAmenities = amenityProfile(step1Data.amenities || []);
    const myAmenityCount = (step1Data.amenities || []).length;

    // First pass: geometry only, so we can read the density before scoring.
    const staged = rawCompetitors
      .map(p => {
        const compGps = p.gps_coordinates;
        let distance = null;
        if (gps && compGps) {
          distance = haversine(gps.latitude, gps.longitude, compGps.latitude, compGps.longitude);
        }
        return { raw: p, distance };
      })
      // Exclude self (fuzzy name match)
      .filter(s => (s.raw.name || '').toLowerCase().trim() !== myProperty.name.toLowerCase().trim());

    // Auto radius unless the user pinned one explicitly.
    const effectiveRadius = req.query.radius
      ? radius
      : autoRadius(staged.map(s => s.distance));

    const competitors = staged
      .filter(s => s.distance === null || s.distance <= effectiveRadius)
      .map(({ raw: p, distance }) => {
        const lowestRate = p.rate_per_night?.extracted_lowest || null;
        const theirClass = p.extracted_hotel_class || parseInt(p.hotel_class) || null;
        const theirRating = p.overall_rating ? parseFloat(p.overall_rating) : null;
        const theirAmenityList = p.amenities || [];
        const theirAmenities = amenityProfile(theirAmenityList);

        const components = {
          class: scoreClass(myClass, theirClass),
          rating: scoreRating(myRating, theirRating),
          amenities: myAmenityCount
            ? scoreAmenities(myAmenities, theirAmenities, theirAmenityList.length)
            : null,
          distance: scoreDistance(distance, effectiveRadius)
        };

        const { score, confidence } = combineScore(components);

        // Price guard sits outside the score. It removes hotels from a
        // different market segment without letting price drive the match.
        const guardReason = priceGuardReason(lowestRate, myProperty.lowestRate);
        const classReason = classGapReason(myClass, theirClass);

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
          amenities: theirAmenityList.slice(0, 5),
          match: {
            score,
            confidence,
            components: {
              class: components.class === null ? null : Math.round(components.class * WEIGHTS.class * 100),
              rating: components.rating === null ? null : Math.round(components.rating * WEIGHTS.rating * 100),
              amenities: components.amenities === null ? null : Math.round(components.amenities * WEIGHTS.amenities * 100),
              distance: components.distance === null ? null : Math.round(components.distance * WEIGHTS.distance * 100)
            }
          },
          priceGuarded: !!guardReason,
          excludeReason: guardReason || classReason || null
        };
      })
      .sort((a, b) => (b.match.score || 0) - (a.match.score || 0));

    // Target 6 primary matches. If strict matching does not reach that, relax
    // the threshold in steps rather than showing an error, and record which
    // step got us there so the UI can label the set honestly.
    const PRIMARY_THRESHOLD = 80;
    const MIN_COMPSET = 6;
    const eligible = competitors.filter(c => !c.priceGuarded && c.match.score !== null);

    let appliedThreshold = PRIMARY_THRESHOLD;
    let relaxed = false;
    for (const step of [80, 75, 70]) {
      appliedThreshold = step;
      relaxed = step !== PRIMARY_THRESHOLD;
      if (eligible.filter(c => c.match.score >= step).length >= MIN_COMPSET) break;
    }
    const primary = eligible.filter(c => c.match.score >= appliedThreshold);

    const insights = buildInsights(primary, myProperty, area, {
      appliedThreshold,
      relaxed,
      effectiveRadius,
      radiusAuto: !req.query.radius,
      excludedCount: competitors.length - primary.length
    });

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      myProperty,
      competitors,
      insights,
      matching: {
        appliedThreshold,
        relaxed,
        effectiveRadius,
        radiusAuto: !req.query.radius,
        weights: WEIGHTS,
        minCompset: MIN_COMPSET
      },
      remaining: limit.remaining
    });

  } catch (err) {
    return res.status(502).json({ error: 'Failed to fetch competitor data. Please try again.' });
  }
}
