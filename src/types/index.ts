export interface Ticker {
  t: string;
  name: string;
  sec: string;
  domain?: string;
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
  domain?: string;
}

export interface Entity {
  id: string;
  name: string;
  kind: 'FUND' | 'PERSON';
  role: string;
  aum: string;
  positions: number | string;
  src: string;
  domain?: string | null;
  photo?: string | null;
  /** FUND에 대해 매니저 얼굴 아바타를 표시할 때 사용할 seed */
  managerSeed?: string | null;
  redirect?: string;
  holdings: Holding[];
}

export interface MatrixInvestor {
  id: string;
  name: string;
  firm: string;
  domain?: string;
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
