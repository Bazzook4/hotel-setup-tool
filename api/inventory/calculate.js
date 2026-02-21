export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { totalRooms, roomTypes } = req.body;

  if (!totalRooms || !roomTypes || roomTypes.length === 0) {
    return res.status(400).json({ error: 'Total rooms and room types are required' });
  }

  const sortedTypes = [...roomTypes].sort((a, b) => a.basePrice - b.basePrice);
  const baseCategory = sortedTypes[0];

  const recommendations = [];
  const reallocationConfig = [];

  sortedTypes.forEach((roomType, index) => {
    const priceDiff = roomType.basePrice - baseCategory.basePrice;
    const priceDiffPercent = baseCategory.basePrice > 0
      ? Math.round((priceDiff / baseCategory.basePrice) * 100)
      : 0;

    let shouldReallocate = false;
    let reason = '';

    if (index === 0) {
      shouldReallocate = true;
      reason = 'Base category - primary room type, gets priority in pool allocation';
    } else if (priceDiffPercent <= 15) {
      shouldReallocate = true;
      reason = `Only ${priceDiffPercent}% price difference - similar value perception, ideal for pooling`;
    } else if (priceDiffPercent <= 30) {
      shouldReallocate = true;
      reason = `${priceDiffPercent}% price difference - moderate gap, can pool but monitor guest expectations`;
    } else if (priceDiffPercent <= 50) {
      shouldReallocate = false;
      reason = `${priceDiffPercent}% price difference - significant gap, may devalue premium positioning`;
      recommendations.push({
        type: 'caution',
        icon: '⚠️',
        message: `${roomType.name}: ${priceDiffPercent}% higher than base. Including in pool may train guests to expect free upgrades.`
      });
    } else {
      shouldReallocate = false;
      reason = `${priceDiffPercent}% price difference - too large, will erode premium brand value`;
      recommendations.push({
        type: 'warning',
        icon: '🚫',
        message: `${roomType.name}: ${priceDiffPercent}% premium. Keep OUT of reallocation pool to protect premium positioning.`
      });
    }

    reallocationConfig.push({
      name: roomType.name,
      count: roomType.count,
      basePrice: roomType.basePrice,
      priceDiff,
      priceDiffPercent,
      shouldReallocate,
      reason
    });
  });

  const poolTypes = reallocationConfig.filter(r => r.shouldReallocate);
  const poolSize = poolTypes.reduce((sum, r) => sum + r.count, 0);

  let remainingPercent = 100;
  poolTypes.forEach((roomType, index) => {
    const naturalPercent = Math.round((roomType.count / poolSize) * 100);

    if (index === 0) {
      const bonus = Math.min(20, Math.round((100 - naturalPercent) * 0.3));
      roomType.poolPercent = Math.min(naturalPercent + bonus, 80);
    } else if (index === poolTypes.length - 1) {
      roomType.poolPercent = remainingPercent;
    } else {
      roomType.poolPercent = Math.max(10, Math.round(naturalPercent * 0.8));
    }

    remainingPercent -= roomType.poolPercent;
    roomType.reallocatedCount = Math.round((roomType.poolPercent / 100) * poolSize);
  });

  const totalAllocated = poolTypes.reduce((sum, r) => sum + r.reallocatedCount, 0);
  if (totalAllocated !== poolSize && poolTypes.length > 0) {
    poolTypes[0].reallocatedCount += (poolSize - totalAllocated);
  }

  reallocationConfig.forEach(rt => {
    const poolType = poolTypes.find(p => p.name === rt.name);
    if (poolType) {
      rt.poolPercent = poolType.poolPercent;
      rt.reallocatedCount = poolType.reallocatedCount;
      rt.inPool = true;
    } else {
      rt.poolPercent = 0;
      rt.reallocatedCount = 0;
      rt.inPool = false;
    }
  });

  if (poolTypes.length >= 2) {
    const poolNames = poolTypes.map(p => p.name).join(' + ');
    recommendations.unshift({
      type: 'success',
      icon: '✅',
      message: `Reallocation Pool Created: ${poolNames} = ${poolSize} rooms total`
    });

    recommendations.push({
      type: 'info',
      icon: '🔄',
      message: `Pool will dynamically redistribute: ${poolTypes.map(p => `${p.name} → ${p.reallocatedCount} (${p.poolPercent}%)`).join(', ')}`
    });
  } else if (poolTypes.length === 1) {
    recommendations.push({
      type: 'info',
      icon: 'ℹ️',
      message: 'Only one room type eligible for pooling. Add another similar-priced room type to enable reallocation.'
    });
  }

  if (sortedTypes.length === 1) {
    recommendations.push({
      type: 'info',
      icon: 'ℹ️',
      message: 'Single room type property - inventory reallocation not applicable. Focus on occupancy-based pricing.'
    });
  }

  const nonPoolTypes = reallocationConfig.filter(r => !r.shouldReallocate);
  if (nonPoolTypes.length > 0) {
    recommendations.push({
      type: 'insight',
      icon: '💎',
      message: `${nonPoolTypes.map(n => n.name).join(', ')} kept separate - premium inventory protected (${nonPoolTypes.reduce((s,n) => s + n.count, 0)} rooms)`
    });
  }

  res.json({
    success: true,
    reallocationConfig,
    recommendations,
    pool: {
      types: poolTypes.map(p => ({
        name: p.name,
        originalCount: p.count,
        poolPercent: p.poolPercent,
        reallocatedCount: p.reallocatedCount
      })),
      totalSize: poolSize
    },
    summary: {
      totalRooms,
      roomTypeCount: roomTypes.length,
      pooledTypes: poolTypes.length,
      poolSize: poolSize,
      nonPooledRooms: totalRooms - poolSize,
      baseCategory: baseCategory.name
    }
  });
}
