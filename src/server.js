import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// API: Calculate Occupancy Pricing Slabs
app.post('/api/occupancy/calculate', (req, res) => {
  const { inventory, usualOccupancy, peakOccupancy, baseRate, maxRate } = req.body;

  // Validate inputs
  if (!inventory || !usualOccupancy || !peakOccupancy || !baseRate || !maxRate) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const totalRooms = parseInt(inventory);
  const usualOcc = parseFloat(usualOccupancy);
  const peakOcc = parseFloat(peakOccupancy);
  const base = parseFloat(baseRate);
  const max = parseFloat(maxRate);

  // Calculate room thresholds based on occupancy percentages
  // Slab 2 ends at (usual occupancy - 10%)
  // Slab 3 ends at peak occupancy
  // Slab 4 covers the remaining rooms
  const slab2EndOcc = usualOcc - 10; // 10% less than usual
  const slab2EndRooms = Math.max(2, Math.round((slab2EndOcc / 100) * totalRooms));
  const slab3EndRooms = Math.round((peakOcc / 100) * totalRooms);

  // Determine number of slabs (4 if inventory <= 35, 5 if > 35)
  const numSlabs = totalRooms > 35 ? 5 : 4;

  const slabs = [];

  // Total price increase needed from base to max
  const totalPriceIncrease = max - base;

  // Slab 1: Always 0-1 (empty to first booking) - no increment
  slabs.push({
    start: 0,
    end: 1,
    increment: 0,
    description: 'Base rate - No increment for first booking'
  });

  if (numSlabs === 4) {
    // 4 Slab Strategy
    // Slab 2: 2 to (usual - 10%) - gradual increase, ~20% of total increase
    // Slab 3: (usual - 10% + 1) to peak - moderate increase, ~35% of total increase
    // Slab 4: (peak + 1) to total - aggressive increase, ~45% of total increase

    const slab2Rooms = slab2EndRooms - 2 + 1;
    const slab3Rooms = slab3EndRooms - slab2EndRooms;
    const slab4Rooms = totalRooms - slab3EndRooms;

    // Distribute price increase: 20% / 35% / 45%
    const slab2TotalIncrease = totalPriceIncrease * 0.20;
    const slab3TotalIncrease = totalPriceIncrease * 0.35;
    const slab4TotalIncrease = totalPriceIncrease * 0.45;

    slabs.push({
      start: 2,
      end: slab2EndRooms,
      increment: slab2Rooms > 0 ? Math.round(slab2TotalIncrease / slab2Rooms) : 0,
      description: `Below usual occupancy (${slab2EndOcc}%) - Gradual increase`
    });

    slabs.push({
      start: slab2EndRooms + 1,
      end: slab3EndRooms,
      increment: slab3Rooms > 0 ? Math.round(slab3TotalIncrease / slab3Rooms) : 0,
      description: `Usual to peak occupancy (${peakOcc}%) - Moderate increase`
    });

    slabs.push({
      start: slab3EndRooms + 1,
      end: totalRooms,
      increment: slab4Rooms > 0 ? Math.round(slab4TotalIncrease / slab4Rooms) : 0,
      description: 'Above peak - Premium pricing'
    });

  } else {
    // 5 Slab Strategy (for larger properties > 35 rooms)
    // More granular breakdown
    const midUsualRooms = Math.round(((usualOcc - 20) / 100) * totalRooms); // usual - 20%

    const slab2Rooms = midUsualRooms - 2 + 1;
    const slab3Rooms = slab2EndRooms - midUsualRooms;
    const slab4Rooms = slab3EndRooms - slab2EndRooms;
    const slab5Rooms = totalRooms - slab3EndRooms;

    // Distribute price increase: 10% / 20% / 30% / 40%
    const slab2TotalIncrease = totalPriceIncrease * 0.10;
    const slab3TotalIncrease = totalPriceIncrease * 0.20;
    const slab4TotalIncrease = totalPriceIncrease * 0.30;
    const slab5TotalIncrease = totalPriceIncrease * 0.40;

    slabs.push({
      start: 2,
      end: midUsualRooms,
      increment: slab2Rooms > 0 ? Math.round(slab2TotalIncrease / slab2Rooms) : 0,
      description: `Low occupancy (below ${usualOcc - 20}%) - Minimal increase`
    });

    slabs.push({
      start: midUsualRooms + 1,
      end: slab2EndRooms,
      increment: slab3Rooms > 0 ? Math.round(slab3TotalIncrease / slab3Rooms) : 0,
      description: `Approaching usual (${slab2EndOcc}%) - Light increase`
    });

    slabs.push({
      start: slab2EndRooms + 1,
      end: slab3EndRooms,
      increment: slab4Rooms > 0 ? Math.round(slab4TotalIncrease / slab4Rooms) : 0,
      description: `Usual to peak (${peakOcc}%) - Moderate increase`
    });

    slabs.push({
      start: slab3EndRooms + 1,
      end: totalRooms,
      increment: slab5Rooms > 0 ? Math.round(slab5TotalIncrease / slab5Rooms) : 0,
      description: 'Above peak - Premium pricing'
    });
  }

  // Calculate rates at each occupancy point for the chart
  const ratesData = [];
  let currentRate = base;
  for (let occ = 0; occ <= totalRooms; occ++) {
    const slab = slabs.find(s => occ >= s.start && occ <= s.end);
    if (slab && occ > 0) {
      currentRate += slab.increment;
    }
    ratesData.push({ occupancy: occ, rate: Math.round(currentRate) });
  }

  // Generate recommendations
  const recommendations = [];
  const occupancyGap = peakOcc - usualOcc;

  if (occupancyGap > 30) {
    recommendations.push({
      type: 'insight',
      icon: '🔍',
      message: `Your peak occupancy (${peakOcc}%) is significantly higher than usual (${usualOcc}%). Consider more aggressive pricing during peak periods.`
    });
  }

  if (usualOcc < 50) {
    recommendations.push({
      type: 'suggestion',
      icon: '💭',
      message: 'With usual occupancy below 50%, focus on competitive base rates to drive volume. Consider promotional rates for low-occupancy periods.'
    });
  }

  if (usualOcc > 75) {
    recommendations.push({
      type: 'opportunity',
      icon: '🎯',
      message: 'High usual occupancy indicates strong demand. You have room to increase base rates or be more aggressive with occupancy-based increments.'
    });
  }

  if (totalRooms < 20) {
    recommendations.push({
      type: 'strategy',
      icon: '📋',
      message: 'Small property with limited inventory. Each room sold significantly impacts remaining availability - consider steeper increments in upper slabs.'
    });
  }

  if (totalRooms > 50) {
    recommendations.push({
      type: 'strategy',
      icon: '📋',
      message: 'Large property with good inventory buffer. You can afford more gradual pricing to maintain competitiveness in early slabs.'
    });
  }

  // Format slabs for display with rate ranges
  const formattedSlabs = slabs.map((slab, index) => {
    let rateAtStart = base;
    for (let i = 0; i < index; i++) {
      const prevSlab = slabs[i];
      rateAtStart += prevSlab.increment * (prevSlab.end - prevSlab.start + (i === 0 ? 1 : 1));
    }
    const roomsInSlab = slab.end - slab.start + 1;
    const totalSlabIncrease = slab.increment * roomsInSlab;
    const rateAtEnd = rateAtStart + totalSlabIncrease;

    return {
      ...slab,
      slabNumber: index + 1,
      roomsInSlab: roomsInSlab,
      totalIncrease: Math.round(totalSlabIncrease),
      stepPerRoom: slab.increment,
      rateStart: Math.round(rateAtStart),
      rateEnd: Math.round(rateAtEnd)
    };
  });

  res.json({
    success: true,
    slabs: formattedSlabs,
    ratesData,
    recommendations,
    config: {
      inventory: totalRooms,
      usualOccupancy: usualOcc,
      peakOccupancy: peakOcc,
      baseRate: base,
      maxRate: max,
      numSlabs
    }
  });
});

// API: Calculate Inventory Reallocation Recommendations
app.post('/api/inventory/calculate', (req, res) => {
  const { totalRooms, roomTypes } = req.body;

  // Validate inputs
  if (!totalRooms || !roomTypes || roomTypes.length === 0) {
    return res.status(400).json({ error: 'Total rooms and room types are required' });
  }

  // Sort room types by base price (lowest first = base category)
  const sortedTypes = [...roomTypes].sort((a, b) => a.basePrice - b.basePrice);
  const baseCategory = sortedTypes[0];

  const recommendations = [];
  const reallocationConfig = [];

  // First pass: determine which room types should be in the pool
  sortedTypes.forEach((roomType, index) => {
    const priceDiff = roomType.basePrice - baseCategory.basePrice;
    const priceDiffPercent = baseCategory.basePrice > 0
      ? Math.round((priceDiff / baseCategory.basePrice) * 100)
      : 0;

    let shouldReallocate = false;
    let reason = '';

    if (index === 0) {
      // Base category - always include in reallocation
      shouldReallocate = true;
      reason = 'Base category - primary room type, gets priority in pool allocation';
    } else if (priceDiffPercent <= 15) {
      // Small price difference (≤15%) - good candidate
      shouldReallocate = true;
      reason = `Only ${priceDiffPercent}% price difference - similar value perception, ideal for pooling`;
    } else if (priceDiffPercent <= 30) {
      // Moderate price difference (15-30%) - consider with caution
      shouldReallocate = true;
      reason = `${priceDiffPercent}% price difference - moderate gap, can pool but monitor guest expectations`;
    } else if (priceDiffPercent <= 50) {
      // Significant price difference (30-50%) - optional
      shouldReallocate = false;
      reason = `${priceDiffPercent}% price difference - significant gap, may devalue premium positioning`;
      recommendations.push({
        type: 'caution',
        icon: '⚠️',
        message: `${roomType.name}: ${priceDiffPercent}% higher than base. Including in pool may train guests to expect free upgrades.`
      });
    } else {
      // Large price difference (>50%) - not recommended
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

  // Calculate pool and percentages for reallocatable types
  const poolTypes = reallocationConfig.filter(r => r.shouldReallocate);
  const poolSize = poolTypes.reduce((sum, r) => sum + r.count, 0);

  // Calculate suggested percentage for each pooled type
  // Base category gets higher percentage, others proportionally less
  let remainingPercent = 100;
  poolTypes.forEach((roomType, index) => {
    const naturalPercent = Math.round((roomType.count / poolSize) * 100);

    if (index === 0) {
      // Base category: give it more weight (its natural % + bonus)
      // The idea is base category should show more availability
      const bonus = Math.min(20, Math.round((100 - naturalPercent) * 0.3));
      roomType.poolPercent = Math.min(naturalPercent + bonus, 80);
    } else if (index === poolTypes.length - 1) {
      // Last type gets whatever remains
      roomType.poolPercent = remainingPercent;
    } else {
      // Middle types: slightly less than natural proportion
      roomType.poolPercent = Math.max(10, Math.round(naturalPercent * 0.8));
    }

    remainingPercent -= roomType.poolPercent;

    // Calculate reallocated count based on percentage
    roomType.reallocatedCount = Math.round((roomType.poolPercent / 100) * poolSize);
  });

  // Adjust to ensure total = poolSize
  const totalAllocated = poolTypes.reduce((sum, r) => sum + r.reallocatedCount, 0);
  if (totalAllocated !== poolSize && poolTypes.length > 0) {
    poolTypes[0].reallocatedCount += (poolSize - totalAllocated);
  }

  // Update main config with pool percentages
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

  // Add pool summary recommendation
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

  // Non-pool types insights
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
});

app.listen(PORT, () => {
  console.log(`\n🏨 RMS Setup Tool running at http://localhost:${PORT}\n`);
});
