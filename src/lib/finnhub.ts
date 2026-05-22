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

function getFinnhubPeriodParams(period: Period): { resolution: string; from: number; to: number } {
  const now = Math.floor(Date.now() / 1000);
  const day = 86400;
  switch (period) {
    case '1D':  return { resolution: 'D', from: now - 5 * day, to: now };
    case '1W':  return { resolution: 'D', from: now - 7 * day, to: now };
    case '1M':  return { resolution: 'D', from: now - 30 * day, to: now };
    case '3M':  return { resolution: 'D', from: now - 90 * day, to: now };
    case '1Y':  return { resolution: 'W', from: now - 365 * day, to: now };
    case '5Y':  return { resolution: 'W', from: now - 5 * 365 * day, to: now };
  }
}

function getYahooPeriodParams(period: Period): { interval: string; range: string } {
  switch (period) {
    case '1D':  return { interval: '1d', range: '5d' };
    case '1W':  return { interval: '1d', range: '1mo' };
    case '1M':  return { interval: '1d', range: '1mo' };
    case '3M':  return { interval: '1d', range: '3mo' };
    case '1Y':  return { interval: '1wk', range: '1y' };
    case '5Y':  return { interval: '1mo', range: '5y' };
  }
}

async function fetchFinnhubCandles(
  symbol: string,
  period: Period,
  key: string,
): Promise<{ t: number; v: number }[] | null> {
  try {
    const { resolution, from, to } = getFinnhubPeriodParams(period);
    const url = `${BASE}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}&token=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.s === 'no_data' || !Array.isArray(data.t) || data.t.length === 0) return null;
    return (data.t as number[]).map((ts: number, i: number) => ({
      t: ts * 1000,
      v: (data.c as number[])[i],
    }));
  } catch {
    return null;
  }
}

async function fetchYahooCandles(
  symbol: string,
  period: Period,
): Promise<{ t: number; v: number }[] | null> {
  try {
    const { interval, range } = getYahooPeriodParams(period);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;
    const timestamps = result.timestamp as number[] | undefined;
    const closes = result.indicators?.quote?.[0]?.close as (number | null)[] | undefined;
    if (!timestamps || !closes || timestamps.length === 0) return null;
    const points = timestamps
      .map((ts, i) => ({ t: ts * 1000, v: closes[i] }))
      .filter((p): p is { t: number; v: number } => p.v !== null && p.v !== undefined && !isNaN(p.v));

    // For 1W period slice to last 7 calendar days
    if (period === '1W') {
      const cutoff = Date.now() - 7 * 86400 * 1000;
      return points.filter((p) => p.t >= cutoff);
    }
    return points;
  } catch {
    return null;
  }
}

export async function fetchCandles(
  symbol: string,
  period: Period,
  key: string,
): Promise<{ t: number; v: number }[] | null> {
  // Try Finnhub first; fall back to Yahoo Finance if unavailable
  if (key) {
    const finnhubData = await fetchFinnhubCandles(symbol, period, key);
    if (finnhubData && finnhubData.length > 0) return finnhubData;
  }
  return fetchYahooCandles(symbol, period);
}
