import { useEffect, useState } from 'react';

const UP = '#F0473E';

export default function Header() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('ko-KR'));

  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString('ko-KR')), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 28px', borderBottom: '1px solid var(--line)',
      background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 11 }}>
        <span style={{
          width: 8, height: 8, border: '1px solid var(--white)', borderRadius: '50%',
          position: 'relative', display: 'inline-block', flexShrink: 0, alignSelf: 'center',
        }}>
          <span style={{
            position: 'absolute', inset: 2, background: 'var(--white)', borderRadius: '50%',
            animation: 'pulse 3s infinite',
          }} />
        </span>
        <h1 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '.28em', fontFamily: 'var(--mono)' }}>
          INNOVATOR&rsquo;S DESK
        </h1>
      </div>
      <div style={{ display: 'flex', gap: 26, fontSize: 11, color: 'var(--gray)', letterSpacing: '.04em' }}>
        <div>UPDATED <b style={{ color: 'var(--white)', fontFamily: 'var(--mono)', fontWeight: 500 }}>{time}</b></div>
        <div>BTC <b style={{ color: UP, fontFamily: 'var(--mono)', fontWeight: 500 }}>$104,820</b></div>
        <div>S&amp;P 500 <b style={{ color: UP, fontFamily: 'var(--mono)', fontWeight: 500 }}>+0.42%</b></div>
      </div>
    </header>
  );
}
