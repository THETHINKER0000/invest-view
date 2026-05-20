import { useState, useEffect } from 'react';
import type { StockData } from '../types';
import tickersJson from '../../config/tickers.json';
import { generateSparkData } from '../lib/format';

const DUMMY_PRICES: Record<string, { price: number; chg: number }> = {
  TSLA: { price: 248.50, chg: 2.14 },
  PLTR: { price: 97.80,  chg: 4.62 },
  RKLB: { price: 28.34,  chg: -1.88 },
  IONQ: { price: 42.10,  chg: 6.71 },
  BMNR: { price: 54.20,  chg: -3.42 },
  JOBY: { price: 9.85,   chg: 1.03 },
  ABCL: { price: 4.62,   chg: -0.64 },
  HIMS: { price: 38.90,  chg: 5.27 },
  NTRA: { price: 152.30, chg: 0.88 },
  TEM:  { price: 61.40,  chg: 3.15 },
  NVDA: { price: 138.40, chg: 1.92 },
  ASTS: { price: 24.10,  chg: 7.30 },
};

function getPrice(t: string) {
  return DUMMY_PRICES[t] ?? { price: Math.random() * 100 + 10, chg: (Math.random() - 0.5) * 10 };
}

function buildStock(ticker: { t: string; name: string; sec: string }): StockData {
  const p = getPrice(ticker.t);
  return { ...ticker, ...p, sparkData: generateSparkData(ticker.t.charCodeAt(0)) };
}

const LS_ORDER = 'desk:order';
const LS_EXTRA = 'desk:extra';

export function useWatchlist() {
  const [order, setOrder] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem(LS_ORDER);
      return s ? JSON.parse(s) : tickersJson.map((t) => t.t);
    } catch { return tickersJson.map((t) => t.t); }
  });

  const [extra, setExtra] = useState<{ t: string; name: string; sec: string }[]>(() => {
    try {
      const s = localStorage.getItem(LS_EXTRA);
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(LS_ORDER, JSON.stringify(order)); }, [order]);
  useEffect(() => { localStorage.setItem(LS_EXTRA, JSON.stringify(extra)); }, [extra]);

  const allTickers = [
    ...tickersJson,
    ...extra.filter((e) => !tickersJson.find((t) => t.t === e.t)),
  ];

  const stocks: StockData[] = order
    .map((t) => allTickers.find((tk) => tk.t === t))
    .filter(Boolean)
    .map((tk) => buildStock(tk!));

  function reorder(from: string, to: string) {
    setOrder((prev) => {
      const arr = [...prev];
      const fi = arr.indexOf(from);
      const ti = arr.indexOf(to);
      if (fi === -1 || ti === -1) return arr;
      arr.splice(fi, 1);
      arr.splice(ti, 0, from);
      return arr;
    });
  }

  function addStock(ticker: { t: string; name: string; sec: string }) {
    if (order.includes(ticker.t)) return;
    setExtra((prev) => [...prev, ticker]);
    setOrder((prev) => [...prev, ticker.t]);
  }

  function removeStock(t: string) {
    setOrder((prev) => prev.filter((x) => x !== t));
  }

  return { stocks, reorder, addStock, removeStock };
}
