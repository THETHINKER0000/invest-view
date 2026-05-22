export function fmtPrice(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtChg(chg: number) {
  const sign = chg >= 0 ? '+' : '';
  return `${sign}${chg.toFixed(2)}%`;
}

function lcg(seed: number) {
  let s = (seed * 1664525 + 1013904223) & 0x7fffffff;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function generateSparkData(
  seed: number,
  length = 20,
  startPrice?: number,
  endPrice?: number,
): { v: number }[] {
  const rng = lcg(seed);
  const hasAnchors = startPrice !== undefined && endPrice !== undefined;

  if (hasAnchors) {
    // Realistic walk from prevClose → currentPrice with noise proportional to move
    const spread = Math.abs(endPrice - startPrice);
    const vol = Math.max(spread * 0.4, endPrice * 0.008);
    const data: { v: number }[] = [];
    let v = startPrice;
    for (let i = 0; i < length; i++) {
      const progress = i / (length - 1);
      const target = startPrice + (endPrice - startPrice) * progress;
      v = target + (rng() - 0.5) * vol * 2;
      data.push({ v });
    }
    // Force last point to exact current price
    data[data.length - 1] = { v: endPrice };
    return data;
  }

  // Fallback: normalized random walk
  const data: { v: number }[] = [];
  let v = 50 + (seed % 30);
  for (let i = 0; i < length; i++) {
    v += Math.sin(i / 2 + seed) * 4 + (rng() - 0.5) * 10;
    v = Math.max(10, Math.min(95, v));
    data.push({ v });
  }
  return data;
}

export function generateDetailData(seed: number, length = 60): { v: number }[] {
  const data: { v: number }[] = [];
  let v = 62 + (seed % 20);
  for (let i = 0; i < length; i++) {
    v += Math.sin(i / 8 + seed) * 3 + i * 0.2 + (Math.random() - 0.48) * 4;
    v = Math.max(30, Math.min(160, v));
    data.push({ v });
  }
  return data;
}

export const DONUT_PALETTE = ['#F4F4F5', '#C4C4C8', '#999AA0', '#6F7077', '#4A4B51', '#2E2E33'];
