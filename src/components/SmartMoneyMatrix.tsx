import holdingsJson from '../../data/holdings.json';
import entitiesJson from '../../config/entities.json';
import type { Entity } from '../types';
import Chip from './Chip';

const entities = entitiesJson as Entity[];

interface Props {
  tickers: string[];
  onPick: (entity: Entity) => void;
}

export default function SmartMoneyMatrix({ tickers, onPick }: Props) {
  const { quarter, matrix } = holdingsJson;

  return (
    <>
      <div style={{
        marginBottom: 11, display: 'flex', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10, color: 'var(--gray)', fontFamily: 'var(--mono)' }}>
          ◆ 기준일 {quarter} — SEC 13F는 분기 종료 후 최대 45일 시차 · 투자자 이름 클릭 시 포트폴리오 열람
        </span>
        {/* 범례 — 상승(빨강) / 하락(파랑) */}
        <span style={{ display: 'flex', gap: 14 }}>
          {[{ color: '#F0473E', label: '상승' }, { color: '#3E8BF0', label: '하락' }].map(({ color, label }) => (
            <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--gray)' }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: color, display: 'inline-block' }} />
              {label}
            </span>
          ))}
        </span>
      </div>

      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 9, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, minWidth: 560 }}>
          <thead>
            <tr>
              <th style={thStyle('left')}>투자자</th>
              {tickers.map((c) => <th key={c} style={thStyle('right')}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {matrix.map((inv) => {
              const entity = entities.find((e) => e.id === inv.id);
              return (
                <tr key={inv.id} className="matrix-row">
                  <td
                    style={{ ...tdStyle('left'), fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => entity && onPick(entity)}
                    className="inv-cell-td"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <Chip size="s" kind="company" name={inv.name} domain={inv.domain} />
                      <div>
                        {inv.name}
                        <div style={{ fontSize: 9, color: 'var(--gray-d)', fontWeight: 400, marginTop: 1 }}>
                          {inv.firm}{'  ▸ 포트폴리오'}
                        </div>
                      </div>
                    </div>
                  </td>
                  {tickers.map((c) => {
                    const v = (inv.rows as Record<string, string>)[c];
                    const color = v
                      ? (v.includes('▲') ? '#F0473E' : '#3E8BF0')
                      : '#2E2E33';
                    return (
                      <td key={c} style={{ ...tdStyle('right'), fontFamily: 'var(--mono)', color }}>
                        {v || '—'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        .matrix-row:hover { background: var(--bg-2); }
        .inv-cell-td:hover { color: var(--signal) !important; }
        th, td { border-bottom: 1px solid var(--line); }
      `}</style>
    </>
  );
}

function thStyle(align: 'left' | 'right'): React.CSSProperties {
  return {
    padding: '10px 13px', textAlign: align, fontSize: 9, letterSpacing: '.1em',
    color: 'var(--gray-d)', textTransform: 'uppercase', fontWeight: 600,
    background: 'var(--bg)', fontFamily: 'var(--mono)',
  };
}
function tdStyle(align: 'left' | 'right'): React.CSSProperties {
  return { padding: '10px 13px', textAlign: align };
}
