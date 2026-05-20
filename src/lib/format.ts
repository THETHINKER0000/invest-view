export function fmtPrice(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtChg(chg: number) {
  const sign = chg >= 0 ? '+' : '';
  return `${sign}${chg.toFixed(2)}%`;
}

export function generateSparkData(seed: number, length = 20): { v: number }[] {
  const data: { v: number }[] = [];
  let v = 50 + (seed % 30);
  for (let i = 0; i < length; i++) {
    v += Math.sin(i / 2 + seed) * 4 + (Math.random() - 0.5) * 8;
    v = Math.max(20, Math.min(90, v));
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
