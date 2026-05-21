export type Period = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

export function getFinnhubKey(): string {
  return (import.meta.env.VITE_FINNHUB_KEY as string) || localStorage.getItem('desk:finnhub_key') || '';
}

export function setFinnhubKey(key: string) {
  localStorage.setItem('desk:finnhub_key', key);
}

const BASE = 'https://finnhub.io/api/v1';

export interface QuoteResult {
  price: number;
  chg: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
}

export async function fetchQuote(symbol: string, key: string): Promise<QuoteResult | null> {
  try {
    const url = `${BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    // Finnhub returns: c=current, dp=change%, h=high, l=low, o=open, pc=prevClose
    if (typeof data.c !== 'number' || data.c === 0) return null;
    return {
      price: data.c,
      chg: data.dp ?? 0,
      high: data.h ?? data.c,
      low: data.l ?? data.c,
      open: data.o ?? data.c,
      prevClose: data.pc ?? data.c,
    };
  } catch {
    return null;
  }
}

function getPeriodParams(period: Period): { resolution: string; from: number; to: number } {
  const now = Math.floor(Date.now() / 1000);
  const day = 86400;
  switch (period) {
    case '1D':
      return { resolution: '5', from: now - day, to: now };
    case '1W':
      return { resolution: '60', from: now - 7 * day, to: now };
    case '1M':
      return { resolution: 'D', from: now - 30 * day, to: now };
    case '3M':
      return { resolution: 'D', from: now - 90 * day, to: now };
    case '1Y':
      return { resolution: 'W', from: now - 365 * day, to: now };
    case '5Y':
      return { resolution: 'W', from: now - 5 * 365 * day, to: now };
  }
}

export async function fetchCandles(
  symbol: string,
  period: Period,
  key: string,
): Promise<{ t: number; v: number }[] | null> {
  try {
    const { resolution, from, to } = getPeriodParams(period);
    const url = `${BASE}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}&token=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.s === 'no_data' || !Array.isArray(data.t) || data.t.length === 0) return null;
    // data.t = timestamps (seconds), data.c = close prices
    return (data.t as number[]).map((ts: number, i: number) => ({
      t: ts * 1000, // convert to ms
      v: (data.c as number[])[i],
    }));
  } catch {
    return null;
  }
}
