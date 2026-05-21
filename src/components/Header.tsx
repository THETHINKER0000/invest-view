import { useEffect, useState } from 'react';

const MARKET_STRIP = [
  { label: 'BTC',     value: '$104,820', up: true },
  { label: 'ETH',     value: '$3,842',   up: true },
  { label: 'S&P 500', value: '+0.42%',   up: true },
  { label: 'NASDAQ',  value: '+0.31%',   up: true },
  { label: 'GOLD',    value: '$3,318',   up: true },
];

interface Props {
  onApiKey: () => void;
}

export default function Header({ onApiKey }: Props) {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('ko-KR'));

  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString('ko-KR')), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header style={{
      borderBottom: '1px solid var(--line)',
      background: 'rgba(0,0,0,.88)', backdropFilter: 'blur(8px)',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      {/* 상단: 로고 + 시각 */}
      <div className="hdr-top" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 28px', borderBottom: '1px solid var(--line)', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          {/* 라이브 펄스 */}
          <span style={{
            width: 8, height: 8, border: '1px solid var(--up)', borderRadius: '50%',
            position: 'relative', display: 'inline-block', flexShrink: 0,
          }}>
            <span style={{
              position: 'absolute', inset: 2, background: 'var(--up)', borderRadius: '50%',
              animation: 'pulse 2.4s infinite',
            }} />
          </span>
          <h1 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '.28em', fontFamily: 'var(--mono)' }}>
            INNOVATOR&rsquo;S DESK
          </h1>
          <span style={{
            fontSize: 9, color: 'var(--up)', fontFamily: 'var(--mono)',
            border: '1px solid var(--up)', borderRadius: 3,
            padding: '1px 5px', letterSpacing: '.1em',
          }}>LIVE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 11, color: 'var(--gray)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--gray-d)', letterSpacing: '.06em' }}>
            {time}
          </div>
          <div style={{ fontSize: 10, color: 'var(--gray-d)', fontFamily: 'var(--mono)', letterSpacing: '.06em' }}>
            2026 Q1 · SEC 13F 기준
          </div>
          <button
            onClick={onApiKey}
            style={{
              fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--gray)',
              border: '1px solid var(--line)', borderRadius: 3,
              padding: '1px 6px', background: 'none', cursor: 'pointer',
              letterSpacing: '.08em',
            }}
          >
            ⚙ API 키
          </button>
        </div>
      </div>

      {/* 하단: 마켓 스트립 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        padding: '0 28px', overflowX: 'auto',
      }}>
        {MARKET_STRIP.map(({ label, value, up }, i) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px 8px 0',
            borderRight: i < MARKET_STRIP.length - 1 ? '1px solid var(--line)' : 'none',
            marginRight: i < MARKET_STRIP.length - 1 ? 18 : 0,
          }}>
            <span style={{ fontSize: 9, color: 'var(--gray-d)', fontFamily: 'var(--mono)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
              {label}
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: up ? 'var(--up)' : 'var(--down)', letterSpacing: '.02em' }}>
              {value}
            </span>
          </div>
        ))}
        <div className="hdr-disclaim" style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--gray-d)', fontFamily: 'var(--mono)', letterSpacing: '.06em', paddingLeft: 18, whiteSpace: 'nowrap' }}>
          ◆ 참고용 · 투자 권유 아님
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .hdr-top h1 { font-size: 12px !important; letter-spacing: .18em !important; }
          .hdr-top { padding: 11px 16px !important; }
          .hdr-disclaim { display: none; }
        }
      `}</style>
    </header>
  );
}
