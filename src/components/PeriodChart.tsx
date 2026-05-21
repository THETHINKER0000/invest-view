import { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { fetchCandles } from '../lib/finnhub';
import type { Period } from '../lib/finnhub';

interface Props {
  symbol: string;
  apiKey: string;
  dummyData: { v: number }[];
  up: boolean;
  currentPrice: number;
}

const PERIODS: { label: string; value: Period }[] = [
  { label: '1일', value: '1D' },
  { label: '1주', value: '1W' },
  { label: '1개월', value: '1M' },
  { label: '3개월', value: '3M' },
  { label: '1년', value: '1Y' },
  { label: '5년', value: '5Y' },
];

function formatTick(ts: number, period: Period): string {
  const d = new Date(ts);
  switch (period) {
    case '1D': {
      const hh = d.getHours().toString().padStart(2, '0');
      const mm = d.getMinutes().toString().padStart(2, '0');
      return `${hh}:${mm}`;
    }
    case '1W':
      return `${d.getMonth() + 1}/${d.getDate()}`;
    case '1M':
    case '3M':
      return `${d.getMonth() + 1}월 ${d.getDate()}일`;
    case '1Y': {
      const yy = d.getFullYear().toString().slice(2);
      const mo = (d.getMonth() + 1).toString().padStart(2, '0');
      return `${yy}.${mo}`;
    }
    case '5Y':
      return `${d.getFullYear()}`;
  }
}

function formatTooltipDate(ts: number, period: Period): string {
  const d = new Date(ts);
  if (period === '1D') {
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
}

interface ChartPoint {
  t: number;
  v: number;
}

export default function PeriodChart({ symbol, apiKey, dummyData, up: upProp, currentPrice }: Props) {
  const [period, setPeriod] = useState<Period>('3M');
  const [liveData, setLiveData] = useState<ChartPoint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setLiveData(null);
      return;
    }

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    fetchCandles(symbol, period, apiKey).then((data) => {
      if (controller.signal.aborted) return;
      setLiveData(data);
      setLoading(false);
    });

    return () => { controller.abort(); };
  }, [symbol, period, apiKey]);

  // Decide which data to render
  const hasLive = liveData !== null && liveData.length > 0;
  const chartData: ChartPoint[] = hasLive
    ? liveData
    : dummyData.map((d, i) => ({ t: i, v: d.v }));

  // Determine color based on first vs last price
  const startPrice = chartData.length > 0 ? chartData[0].v : currentPrice;
  const isUp = hasLive ? (currentPrice >= startPrice) : upProp;
  const strokeColor = isUp ? 'var(--up)' : 'var(--down)';

  const gradientId = `grad-${symbol}`;

  return (
    <div style={{ position: 'relative' }}>
      {/* Period buttons */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
        {PERIODS.map(({ label, value }) => {
          const active = period === value;
          return (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              style={{
                padding: '3px 9px',
                background: active ? 'var(--bg-3)' : 'var(--bg-2)',
                border: `1px solid ${active ? 'var(--line-2)' : 'var(--line)'}`,
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: 'var(--mono)',
                fontSize: 10,
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--white)' : 'var(--gray)',
                letterSpacing: '.04em',
                transition: 'all .12s',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Chart area */}
      <div style={{
        height: 160, background: 'var(--bg)', borderRadius: 7,
        border: '1px solid var(--line)', padding: '8px 4px 4px',
        position: 'relative',
      }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,.45)', borderRadius: 7, zIndex: 2,
            fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--gray-d)',
            letterSpacing: '.08em',
          }}>
            불러오는 중...
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="t"
              tickFormatter={(t) => (hasLive ? formatTick(t as number, period) : '')}
              tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: 'var(--gray-d)' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              hide
              domain={['dataMin * 0.98', 'dataMax * 1.02']}
            />
            <Tooltip
              contentStyle={{
                background: '#101012', border: '1px solid #2E2E33',
                borderRadius: 6, fontFamily: 'IBM Plex Mono', fontSize: 11,
              }}
              labelFormatter={(t) => hasLive ? formatTooltipDate(t as number, period) : ''}
              formatter={(v) => [`$${Number(v).toFixed(2)}`, '가격']}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke={strokeColor}
              strokeWidth={1.6}
              fill={`url(#${gradientId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* No API key badge */}
      {!apiKey && (
        <div style={{
          marginTop: 6, fontSize: 9, color: 'var(--gray-d)',
          fontFamily: 'var(--mono)', letterSpacing: '.06em',
          textAlign: 'right',
        }}>
          실시간 데이터 없음 · API 키 설정 필요
        </div>
      )}
    </div>
  );
}
