export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { inventory, usualOccupancy, peakOccupancy, baseRate, maxRate } = req.body;

  if (!inventory || !usualOccupancy || !peakOccupancy || !baseRate || !maxRate) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const totalRooms = parseInt(inventory);
  const usualOcc = parseFloat(usualOccupancy);
  const peakOcc = parseFloat(peakOccupancy);
  const base = parseFloat(baseRate);
  const max = parseFloat(maxRate);

  const slab2EndOcc = usualOcc - 10;
  const slab2EndRooms = Math.max(2, Math.round((slab2EndOcc / 100) * totalRooms));
  const slab3EndRooms = Math.round((peakOcc / 100) * totalRooms);

  const numSlabs = totalRooms > 35 ? 5 : 4;
  const slabs = [];
  const totalPriceIncrease = max - base;

  slabs.push({
    start: 0,
    end: 1,
    increment: 0,
    description: 'Base rate - No increment for first booking'
  });

  if (numSlabs === 4) {
    const slab2Rooms = slab2EndRooms - 2 + 1;
    const slab3Rooms = slab3EndRooms - slab2EndRooms;
    const slab4Rooms = totalRooms - slab3EndRooms;

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
    const midUsualRooms = Math.round(((usualOcc - 20) / 100) * totalRooms);

    const slab2Rooms = midUsualRooms - 2 + 1;
    const slab3Rooms = slab2EndRooms - midUsualRooms;
    const slab4Rooms = slab3EndRooms - slab2EndRooms;
    const slab5Rooms = totalRooms - slab3EndRooms;

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

  const ratesData = [];
  let currentRate = base;
  for (let occ = 0; occ <= totalRooms; occ++) {
    const slab = slabs.find(s => occ >= s.start && occ <= s.end);
    if (slab && occ > 0) {
      currentRate += slab.increment;
    }
    ratesData.push({ occupancy: occ, rate: Math.round(currentRate) });
  }

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
}
