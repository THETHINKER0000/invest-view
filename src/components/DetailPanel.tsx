import { LineChart, Line, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { StockData, Narrative } from '../types';
import { fmtPrice, fmtChg, generateDetailData } from '../lib/format';
import NarrativePanel from './NarrativePanel';

interface Props {
  stock: StockData;
  narrative: Narrative | null;
}

const NEWS_ITEMS = [
  { time: '2H', text: (name: string) => `${name}, 신규 대규모 계약 체결 소식` },
  { time: '6H', text: (_: string) => '분기 실적 가이던스 상향 — 시장 기대 상회' },
  { time: '1D', text: (_: string) => '주요 IB, 목표주가 조정 리포트 발간' },
];

export default function DetailPanel({ stock, narrative }: Props) {
  const chartData = generateDetailData(stock.t.charCodeAt(0));
  const up = stock.chg >= 0;
  const targetPrice = (stock.price * 1.12).toFixed(2);

  return (
    <div style={{
      background: 'var(--bg-1)', border: '1px solid var(--line)',
      borderRadius: 9, padding: 22,
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 18, paddingBottom: 15, borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 6, background: 'var(--bg)',
            border: '1px solid var(--line-2)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 12,
          }}>{stock.t.slice(0, 2)}</div>
          <h3 style={{ fontFamily: 'var(--mono)', fontSize: 17, fontWeight: 600 }}>
            {stock.t} · {stock.name}
          </h3>
        </div>
        <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--gray-d)', letterSpacing: '.1em' }}>
          {stock.sec.toUpperCase()}
        </span>
      </div>

      {/* 통계 행 */}
      <div style={{ display: 'flex', gap: 30, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { k: '현재가', v: fmtPrice(stock.price), col: undefined },
          { k: '당일 등락', v: fmtChg(stock.chg), col: up ? 'var(--white)' : 'var(--gray)' },
          { k: '52주 변동', v: '+62.4%', col: undefined },
          { k: '목표주가', v: `$${targetPrice}`, col: undefined },
          { k: '컨센서스', v: 'HOLD', col: 'var(--signal)' },
        ].map(({ k, v, col }) => (
          <div key={k}>
            <div style={{ fontSize: 9, color: 'var(--gray-d)', letterSpacing: '.12em', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>{k}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 15, marginTop: 4, fontWeight: 500, color: col ?? 'var(--white)' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* 차트 */}
      <div style={{
        height: 180, background: 'var(--bg)', borderRadius: 7,
        border: '1px solid var(--line)', padding: 12,
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip
              contentStyle={{
                background: '#101012', border: '1px solid #2E2E33',
                borderRadius: 6, fontFamily: 'IBM Plex Mono', fontSize: 11,
              }}
              labelStyle={{ display: 'none' }}
              formatter={(v) => [`$${Number(v).toFixed(2)}`, '']}
            />
            <Line type="monotone" dataKey="v" stroke="#F4F4F5" strokeWidth={1.6} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 하단 2열: 서사 | 뉴스 */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 16, marginTop: 16,
      }} className="detail-cols">
        <NarrativePanel narrative={narrative} />

        {/* 뉴스 */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 7, padding: 15 }}>
          {NEWS_ITEMS.map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, padding: '9px 0',
              borderBottom: i < NEWS_ITEMS.length - 1 ? '1px solid var(--line)' : 'none',
              fontSize: 12.5,
            }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--gray-d)', whiteSpace: 'nowrap', minWidth: 50 }}>
                {item.time}
              </span>
              <span style={{ color: 'var(--white)' }}>{item.text(stock.name)}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) { .detail-cols { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
