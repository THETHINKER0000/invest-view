import { useState, useEffect, useRef } from 'react';
import searchPool from '../../config/search_pool.json';
import entitiesJson from '../../config/entities.json';
import type { Entity } from '../types';
import Chip from './Chip';

const entities = entitiesJson as Entity[];

interface Props {
  ownedTickers: Set<string>;
  onAdd: (ticker: { t: string; name: string; sec: string; domain?: string }) => void;
  onOpenEntity: (entity: Entity) => void;
}

export default function SearchZone({ ownedTickers, onAdd, onOpenEntity }: Props) {
  const [mode, setMode] = useState<'stock' | 'entity'>('stock');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // click-outside → 드롭다운 닫기
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const stockMatches = query.trim() && mode === 'stock'
    ? searchPool.filter(
        (p) => !ownedTickers.has(p.t) &&
          (p.t.toLowerCase().includes(query.toLowerCase()) ||
           p.name.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const entityMatches = query.trim() && mode === 'entity'
    ? entities.filter(
        (en) =>
          en.name.toLowerCase().includes(query.toLowerCase()) ||
          en.role.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const hasResults = open && (stockMatches.length > 0 || entityMatches.length > 0);

  function switchMode(m: 'stock' | 'entity') {
    setMode(m);
    setQuery('');
    setOpen(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
      {/* 탭 */}
      <div style={{ display: 'flex', gap: 2 }}>
        {(['stock', 'entity'] as const).map((m, i) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            style={{
              background: mode === m ? 'var(--white)' : 'var(--bg-1)',
              border: '1px solid ' + (mode === m ? 'var(--white)' : 'var(--line)'),
              color: mode === m ? 'var(--bg)' : 'var(--gray)',
              fontFamily: 'var(--mono)', fontSize: 11, padding: '7px 14px', cursor: 'pointer',
              letterSpacing: '.05em', transition: 'all .15s',
              borderRadius: i === 0 ? '6px 0 0 6px' : '0 6px 6px 0',
            }}
          >
            {m === 'stock' ? '종목 검색' : '투자자 / 펀드 검색'}
          </button>
        ))}
      </div>

      {/* 입력 + 드롭다운 */}
      <div ref={containerRef} style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 13, top: 11, color: 'var(--gray-d)', fontSize: 15, pointerEvents: 'none' }}>⌕</span>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={
            mode === 'stock'
              ? '기술주 검색해서 추가 — 티커 또는 기업명 (예: NVDA, Tempus)'
              : '펀드·투자자·인물 검색 (예: ARK, Berkshire, Cathie Wood, Elon Musk)'
          }
          style={{
            width: '100%', background: 'var(--bg-1)', border: '1px solid var(--line)',
            borderRadius: 7, color: 'var(--white)', fontFamily: 'var(--mono)', fontSize: 13,
            padding: '11px 14px 11px 36px', letterSpacing: '.02em', outline: 'none',
          }}
          onMouseDown={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--line-2)'; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--line)'; }}
        />

        {hasResults && (
          <div style={{
            position: 'absolute', top: 46, left: 0, right: 0,
            background: 'var(--bg-2)', border: '1px solid var(--line-2)',
            borderRadius: 7, zIndex: 25, overflow: 'hidden',
            boxShadow: '0 16px 44px rgba(0,0,0,.7)',
          }}>
            {/* 종목 결과 */}
            {stockMatches.map((p) => (
              <div
                key={p.t}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onAdd(p); setQuery(''); setOpen(false); }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid var(--line)',
                }}
                className="result-row"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <Chip size="s" kind="company" name={p.name} domain={p.domain} />
                  <div>
                    <div style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 13 }}>{p.t}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 1 }}>{p.name} · {p.sec}</div>
                  </div>
                </div>
                <span style={{ fontSize: 10, color: 'var(--white)', fontFamily: 'var(--mono)', letterSpacing: '.06em' }}>
                  + 그리드에 추가
                </span>
              </div>
            ))}

            {/* 투자자/펀드 결과 */}
            {entityMatches.map((en) => (
              <div
                key={en.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onOpenEntity(en); setQuery(''); setOpen(false); }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid var(--line)',
                }}
                className="result-row"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <Chip
                    size="s"
                    kind={en.kind === 'FUND' ? 'company' : 'person'}
                    name={en.name}
                    domain={en.domain}
                    photo={en.photo}
                    seed={en.name}
                    round={en.kind === 'PERSON'}
                  />
                  <div>
                    <div style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 13 }}>{en.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 1 }}>{en.role}</div>
                  </div>
                </div>
                <span style={{
                  fontSize: 9, color: 'var(--gray)', fontFamily: 'var(--mono)',
                  border: '1px solid var(--line)', padding: '2px 6px', borderRadius: 3, letterSpacing: '.08em',
                }}>{en.kind}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .result-row:hover { background: var(--bg-3); }
        .result-row:last-child { border-bottom: none !important; }
      `}</style>
    </div>
  );
}
