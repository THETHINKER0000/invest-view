import type { StockData, Narrative } from '../types';
import { fmtPrice, generateDetailData } from '../lib/format';
import NarrativePanel from './NarrativePanel';
import Chip from './Chip';
import PeriodChart from './PeriodChart';

interface Props {
  stock: StockData;
  narrative: Narrative | null;
  apiKey: string;
}

const NEWS_ITEMS = [
  { time: '2H', text: (name: string) => `${name}, 신규 대규모 계약 체결 소식` },
  { time: '6H', text: () => '분기 실적 가이던스 상향 — 시장 기대 상회' },
  { time: '1D', text: () => '주요 IB, 목표주가 조정 리포트 발간' },
];

export default function DetailPanel({ stock, narrative, apiKey }: Props) {
  const chartData = generateDetailData(stock.t.charCodeAt(0));
  const up = stock.chg >= 0;
  const upColor = up ? 'var(--up)' : 'var(--down)';

  const stats = [
    { k: '현재가', v: fmtPrice(stock.price), col: 'var(--white)' },
    { k: '당일 등락', v: `${up ? '+' : ''}${stock.chg.toFixed(2)}%`, col: upColor },
    { k: '52주 변동', v: '+62.4%', col: 'var(--up)' },
    { k: '목표주가', v: `$${(stock.price * 1.12).toFixed(2)}`, col: 'var(--white)' },
    { k: '컨센서스', v: 'HOLD', col: 'var(--signal)' },
    ...(stock.high != null ? [{ k: '당일 고가', v: fmtPrice(stock.high), col: 'var(--white)' }] : []),
    ...(stock.low != null ? [{ k: '당일 저가', v: fmtPrice(stock.low), col: 'var(--white)' }] : []),
  ];

  return (
    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 9, padding: 22 }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 18, paddingBottom: 15, borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <Chip size="l" kind="company" name={stock.t} domain={stock.domain} />
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
        {stats.map(({ k, v, col }) => (
          <div key={k}>
            <div style={{ fontSize: 9, color: 'var(--gray-d)', letterSpacing: '.12em', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>{k}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 15, marginTop: 4, fontWeight: 500, color: col }}>{v}</div>
          </div>
        ))}
      </div>

      {/* 차트 */}
      <PeriodChart
        symbol={stock.t}
        apiKey={apiKey}
        dummyData={chartData}
        up={up}
        currentPrice={stock.price}
      />

      {/* 하단 2열: 서사 | 뉴스 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 16, marginTop: 16 }} className="detail-cols">
        <NarrativePanel narrative={narrative} />
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
              <span>{item.text(stock.name)}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`@media(max-width:860px){.detail-cols{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
