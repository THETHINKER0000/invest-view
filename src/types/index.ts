export interface Ticker {
  t: string;
  name: string;
  sec: string;
}

export interface StockData extends Ticker {
  price: number;
  chg: number;
  sparkData?: { v: number }[];
}

export interface Narrative {
  headline: string;
  core: string;
  direction: string;
  bull: string;
  bear: string;
  keywords: string[];
}

export interface Holding {
  t: string;
  name: string;
  pct: number;
  amt: string;
  chg: string;
}

export interface Entity {
  id: string;
  name: string;
  kind: 'FUND' | 'PERSON';
  role: string;
  aum: string;
  positions: number | string;
  src: string;
  holdings: Holding[];
}

export interface MatrixRow {
  id: string;
  name: string;
  firm: string;
  rows: Record<string, string>;
}

export interface PrivateAsset {
  id: string;
  name: string;
  sector: string;
  valuation: string;
  note: string;
  lastUpdated: string;
}
