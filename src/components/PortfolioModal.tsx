import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { Entity } from '../types';
import { DONUT_PALETTE } from '../lib/format';
import Chip from './Chip';

interface Props {
  entity: Entity | null;
  onClose: () => void;
  onJump?: (id: string) => void;
}

export default function PortfolioModal({ entity, onClose, onJump }: Props) {
  if (!entity) return null;

  const pieData = entity.holdings.map((h) => ({ name: h.t, value: h.pct }));

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.78)', zIndex: 50,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '48px 20px', overflowY: 'auto', backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-1)', border: '1px solid var(--line-2)',
          borderRadius: 11, width: '100%', maxWidth: 880, padding: 26,
        }}
        onClick={(e) => e.stopPropagation()}
        className="fade-in"
      >
        {/* 헤더 */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          paddingBottom: 18, borderBottom: '1px solid var(--line)', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <Chip
              size="xl"
              kind={entity.kind === 'FUND' ? 'company' : 'person'}
              name={entity.name}
              domain={entity.domain}
              photo={entity.photo}
              seed={entity.name}
              round={entity.kind === 'PERSON'}
            />
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 600, letterSpacing: '.01em' }}>{entity.name}</h2>
              <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 3, fontFamily: 'var(--mono)' }}>{entity.role}</div>
              <span style={{
                display: 'inline-block', fontSize: 9, fontFamily: 'var(--mono)',
                color: 'var(--gray)', border: '1px solid var(--line-2)',
                padding: '2px 7px', borderRadius: 3, letterSpacing: '.08em', marginTop: 7,
              }}>
                {entity.kind === 'FUND' ? '운용사 / 펀드' : '개인 / INDIVIDUAL'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-2)', border: '1px solid var(--line)',
              color: 'var(--gray)', width: 30, height: 30, borderRadius: 6,
              cursor: 'pointer', fontSize: 13,
            }}
          >✕</button>
        </div>

        {/* redirect: 캐시 우드 → ARK 안내 */}
        {entity.redirect ? (
          <div style={{ padding: '10px 2px' }}>
            <p style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.7 }}>
              개인은 13F 보고 의무가 없습니다. 캐시 우드의 투자 포트폴리오는 본인 개인 자산이 아니라
              ARK Invest가 운용하는 펀드입니다.
            </p>
            <button
              style={{
                marginTop: 14, background: 'var(--white)', color: '#000',
                border: 'none', borderRadius: 6, padding: '9px 16px', cursor: 'pointer',
                fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600,
              }}
              onClick={() => onJump?.(entity.redirect!)}
            >
              → ARK Invest 포트폴리오 보기
            </button>
          </div>
        ) : (
          <>
            {/* 요약 바 */}
            <div style={{ display: 'flex', gap: 34, marginBottom: 22, flexWrap: 'wrap' }}>
              {[
                { k: '운용 규모', v: entity.aum, signal: false },
                { k: '보유 종목', v: String(entity.positions), signal: false },
                { k: '데이터 출처', v: entity.src, signal: true },
              ].map(({ k, v, signal }) => (
                <div key={k}>
                  <div style={{ fontSize: 9, color: 'var(--gray-d)', letterSpacing: '.12em', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>{k}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 18, marginTop: 4, fontWeight: 500, color: signal ? 'var(--signal)' : 'var(--white)' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* 도넛 + 리스트 */}
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 26 }} className="pf-body">
              {/* 도넛 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 240, height: 240, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData} dataKey="value" nameKey="name"
                        cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                        paddingAngle={1.5} stroke="#000" strokeWidth={2}
                        isAnimationActive={false}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={DONUT_PALETTE[i % DONUT_PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#101012', border: '1px solid #2E2E33', borderRadius: 6, fontFamily: 'IBM Plex Mono', fontSize: 11 }}
                        formatter={(v, name) => [`${v}%`, String(name)]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)', textAlign: 'center', fontFamily: 'var(--mono)',
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{entity.aum}</div>
                    <div style={{ fontSize: 9, color: 'var(--gray-d)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 2 }}>TOTAL</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--gray-d)', fontFamily: 'var(--mono)', letterSpacing: '.06em' }}>
                  상위 보유 비중
                </div>
              </div>

              {/* 보유 리스트 */}
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflowY: 'auto', paddingRight: 4 }}>
                  {entity.holdings.map((h, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px',
                      border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg-2)',
                      transition: 'background .12s',
                    }} className="holding-row">
                      <Chip size="l" kind="company" name={h.name} domain={h.domain} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7 }}>
                          {h.name}
                          <span style={{ fontFamily: 'var(--mono)', color: 'var(--gray)', fontSize: 11 }}>{h.t}</span>
                        </div>
                        <div style={{ height: 3, background: 'var(--bg)', borderRadius: 2, marginTop: 5, overflow: 'hidden' }}>
                          <span style={{
                            display: 'block', height: '100%',
                            background: DONUT_PALETTE[i % DONUT_PALETTE.length],
                            width: `${Math.min(h.pct, 100)}%`,
                          }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontFamily: 'var(--mono)', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{h.pct}%</div>
                        <div style={{ fontSize: 10, color: 'var(--gray)', marginTop: 2 }}>{h.amt}</div>
                        {h.chg && (
                          <div style={{
                            fontSize: 9, marginTop: 2,
                            color: h.chg.includes('+') ? 'var(--white)'
                              : h.chg.includes('-') ? 'var(--signal)'
                              : 'var(--gray-d)',
                          }}>{h.chg}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 하단 주석 */}
                <div style={{
                  fontSize: 10, color: 'var(--gray-d)', marginTop: 16, fontFamily: 'var(--mono)',
                  lineHeight: 1.6, borderTop: '1px solid var(--line)', paddingTop: 12,
                }}>
                  {entity.kind === 'FUND'
                    ? '◆ 13F는 분기별 롱 포지션 스냅샷 — 공매도·옵션·현금·해외주식 미포함. 최대 45일 시차.'
                    : '◆ 개인은 13F 의무 없음 — Form 4·13D/G 기반. 비상장 지분은 추정치이며 정확도가 낮습니다.'}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .holding-row:hover { background: var(--bg-3) !important; }
        @media (max-width: 680px) { .pf-body { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
