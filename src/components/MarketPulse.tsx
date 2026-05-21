const FEAR_GREED = 45;

const SECTORS = [
  { name: 'AI / 반도체', pct: 2.4, up: true },
  { name: '크립토',      pct: 3.1, up: true },
  { name: '우주 / 방산', pct: 1.8, up: true },
  { name: '바이오',      pct: -0.6, up: false },
  { name: 'eVTOL',      pct: -1.2, up: false },
  { name: '핀테크',      pct: 0.9, up: true },
];

const MACRO = [
  { label: 'VIX',       value: '18.2', note: '낮음', up: true },
  { label: 'DXY',       value: '104.3', note: '달러 강세', up: false },
  { label: '10Y 금리',  value: '4.41%', note: '유지', up: null },
  { label: '금',        value: '$3,318', note: '▲ 0.4%', up: true },
];

function fearLabel(n: number) {
  if (n <= 20) return '극도 공포';
  if (n <= 40) return '공포';
  if (n <= 60) return '중립';
  if (n <= 80) return '탐욕';
  return '극도 탐욕';
}
function fearColor(n: number) {
  if (n <= 25) return '#3E8BF0';
  if (n <= 45) return '#6CA0D8';
  if (n <= 55) return 'var(--signal)';
  if (n <= 75) return '#E5923A';
  return '#F0473E';
}

export default function MarketPulse() {
  const fg = FEAR_GREED;
  const fColor = fearColor(fg);

  return (
    <div style={{
      background: 'var(--bg-1)', border: '1px solid var(--line)',
      borderRadius: 9, padding: '18px 22px', display: 'flex',
      gap: 28, flexWrap: 'wrap', alignItems: 'center',
    }}>

      {/* Fear & Greed gauge */}
      <div style={{ flexShrink: 0, minWidth: 200 }}>
        <div style={{ fontSize: 9, color: 'var(--gray-d)', fontFamily: 'var(--mono)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          공포 / 탐욕 지수
        </div>
        <div style={{ position: 'relative', height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'visible', marginBottom: 6 }}>
          {/* gradient track */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 3,
            background: 'linear-gradient(to right, #3E8BF0, #6CA0D8 25%, #A78BFA 50%, #E5923A 75%, #F0473E)',
            opacity: 0.35,
          }} />
          {/* thumb */}
          <div style={{
            position: 'absolute', top: '50%', left: `${fg}%`,
            transform: 'translate(-50%, -50%)',
            width: 12, height: 12, borderRadius: '50%',
            background: fColor, border: '2px solid var(--bg-1)',
            boxShadow: `0 0 6px ${fColor}`,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 600, color: fColor }}>{fg}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: fColor, letterSpacing: '.06em' }}>{fearLabel(fg)}</div>
        </div>
      </div>

      <div style={{ width: 1, background: 'var(--line)', alignSelf: 'stretch', flexShrink: 0 }} />

      {/* Macro indicators */}
      <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        {MACRO.map(({ label, value, note, up }) => (
          <div key={label}>
            <div style={{ fontSize: 9, color: 'var(--gray-d)', fontFamily: 'var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, color: up === null ? 'var(--white)' : up ? 'var(--up)' : 'var(--down)' }}>{value}</div>
            <div style={{ fontSize: 9, color: 'var(--gray-d)', fontFamily: 'var(--mono)', marginTop: 1 }}>{note}</div>
          </div>
        ))}
      </div>

      <div style={{ width: 1, background: 'var(--line)', alignSelf: 'stretch', flexShrink: 0 }} />

      {/* Sector bars */}
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ fontSize: 9, color: 'var(--gray-d)', fontFamily: 'var(--mono)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          섹터 성과
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {SECTORS.map(({ name, pct, up }) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--gray)', fontFamily: 'var(--mono)', width: 90, flexShrink: 0 }}>{name}</div>
              <div style={{ flex: 1, height: 3, background: 'var(--bg)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: up ? '50%' : `${50 - Math.min(Math.abs(pct) * 8, 50)}%`,
                  width: `${Math.min(Math.abs(pct) * 8, 50)}%`,
                  height: '100%',
                  background: up ? 'var(--up)' : 'var(--down)',
                  borderRadius: 2,
                }} />
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: up ? 'var(--up)' : 'var(--down)', width: 42, textAlign: 'right', flexShrink: 0 }}>
                {up ? '+' : ''}{pct}%
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
