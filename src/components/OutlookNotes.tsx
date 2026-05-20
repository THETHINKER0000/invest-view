import { useState, useEffect } from 'react';
import type { StockData } from '../types';

const LS_KEY = 'desk:notes';

function loadNotes(): Record<string, string> {
  try {
    const s = localStorage.getItem(LS_KEY);
    return s ? JSON.parse(s) : {};
  } catch { return {}; }
}

interface Props {
  stocks: StockData[];
}

export default function OutlookNotes({ stocks }: Props) {
  const [notes, setNotes] = useState<Record<string, string>>(loadNotes);
  const [selected, setSelected] = useState<string>(stocks[0]?.t ?? '');

  useEffect(() => {
    if (!selected && stocks.length > 0) setSelected(stocks[0].t);
  }, [stocks, selected]);

  function update(t: string, val: string) {
    const next = { ...notes, [t]: val };
    setNotes(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }

  const currentStock = stocks.find((s) => s.t === selected);

  return (
    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 9, padding: 22 }}>
      {/* 탭 선택 */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {stocks.map((s) => (
          <button
            key={s.t}
            onClick={() => setSelected(s.t)}
            style={{
              background: selected === s.t ? 'var(--bg-3)' : 'var(--bg-2)',
              border: '1px solid ' + (selected === s.t ? 'var(--line-2)' : 'var(--line)'),
              color: selected === s.t ? 'var(--white)' : 'var(--gray)',
              fontFamily: 'var(--mono)', fontSize: 11, padding: '5px 11px',
              borderRadius: 5, cursor: 'pointer', letterSpacing: '.04em',
              position: 'relative',
            }}
          >
            {s.t}
            {notes[s.t]?.trim() && (
              <span style={{
                position: 'absolute', top: -3, right: -3, width: 6, height: 6,
                background: 'var(--signal)', borderRadius: '50%',
              }} />
            )}
          </button>
        ))}
      </div>

      {currentStock && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600 }}>{currentStock.t}</div>
            <div style={{ fontSize: 11, color: 'var(--gray)' }}>· {currentStock.name}</div>
            <span style={{ fontSize: 9, color: 'var(--signal)', fontFamily: 'var(--mono)', marginLeft: 'auto', letterSpacing: '.06em' }}>
              localStorage 저장
            </span>
          </div>
          <textarea
            value={notes[selected] ?? ''}
            onChange={(e) => update(selected, e.target.value)}
            placeholder={`${currentStock.name}에 대한 미래 전망, 개인 메모를 자유롭게 입력하세요.\n\n예: 2026년 Q3 로보택시 상용화 여부 확인 필요. FSD 구독자 수 추적할 것.`}
            style={{
              width: '100%', minHeight: 160, background: 'var(--bg)',
              border: '1px solid var(--line)', borderRadius: 7,
              color: 'var(--white)', fontFamily: 'var(--sans)', fontSize: 13,
              padding: 14, lineHeight: 1.65, resize: 'vertical', outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--line-2)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
          />
          <div style={{ fontSize: 10, color: 'var(--gray-d)', fontFamily: 'var(--mono)', marginTop: 8, letterSpacing: '.04em' }}>
            {notes[selected]?.trim() ? `${notes[selected].trim().length}자 저장됨` : '내용 없음'}
          </div>
        </div>
      )}
    </div>
  );
}
