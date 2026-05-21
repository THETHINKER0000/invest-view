import { useState } from 'react';
import type { PrivateAsset } from '../types';
import Chip from './Chip';

const LS_KEY = 'desk:private';

const DEFAULTS: PrivateAsset[] = [
  {
    id: 'spacex',
    name: 'SpaceX',
    sector: '우주 / 발사체',
    valuation: '$350B',
    note: '2025년 8월 내부 거래 기준 추정 밸류에이션. 비상장 / 공시 없음. Starship 상업화 가속.',
    lastUpdated: '2025-08',
  },
  {
    id: 'xai',
    name: 'xAI',
    sector: 'AI 연구 / 스타트업',
    valuation: '$50B',
    note: 'Grok 출시 후 2024년 펀딩 라운드 기준. X(트위터) 데이터 독점 접근권 보유.',
    lastUpdated: '2024-12',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    sector: 'AI / LLM',
    valuation: '$157B',
    note: '2024년 10월 $6.6B 라운드 기준. Microsoft와 전략적 파트너십. ChatGPT 월 2억 유저.',
    lastUpdated: '2024-10',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    sector: 'AI / 안전 연구',
    valuation: '$61.5B',
    note: 'Amazon $4B 투자 포함 2024년 최신 라운드 기준. Claude 모델 기업 채택 급증.',
    lastUpdated: '2024-11',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    sector: '결제 인프라',
    valuation: '$65B',
    note: '2023년 차기 라운드 기준. 2024년 IPO 예측 지속. 연간 매출 $15B+ 추정.',
    lastUpdated: '2024-03',
  },
  {
    id: 'anduril',
    name: 'Anduril Industries',
    sector: '방산 테크',
    valuation: '$28B',
    note: 'Palmer Luckey 창업. 2024년 $1.5B Series F. 미군 자율무기 계약 확대 중.',
    lastUpdated: '2024-08',
  },
];

function load(): PrivateAsset[] {
  try {
    const s = localStorage.getItem(LS_KEY);
    return s ? JSON.parse(s) : DEFAULTS;
  } catch { return DEFAULTS; }
}

function save(items: PrivateAsset[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

const DOMAIN_MAP: Record<string, string> = {
  spacex: 'spacex.com',
  xai: 'x.ai',
  openai: 'openai.com',
  anthropic: 'anthropic.com',
  stripe: 'stripe.com',
  anduril: 'anduril.com',
};

export default function PrivateWatchlist() {
  const [items, setItems] = useState<PrivateAsset[]>(load);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', sector: '', valuation: '', note: '' });

  function update(next: PrivateAsset[]) {
    setItems(next);
    save(next);
  }

  function handleAdd() {
    if (!form.name.trim()) return;
    const item: PrivateAsset = {
      id: Date.now().toString(),
      name: form.name,
      sector: form.sector,
      valuation: form.valuation,
      note: form.note,
      lastUpdated: new Date().toISOString().slice(0, 7),
    };
    update([...items, item]);
    setForm({ name: '', sector: '', valuation: '', note: '' });
    setAdding(false);
  }

  function handleRemove(id: string) {
    update(items.filter((i) => i.id !== id));
  }

  return (
    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 9, padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--gray-d)', fontFamily: 'var(--mono)', letterSpacing: '.1em' }}>
          ◆ 비상장 / 공시 없음 — 수동 입력 밸류에이션. 추정치이며 정확도를 보장하지 않습니다.
        </div>
        <button
          onClick={() => setAdding(!adding)}
          style={{
            background: 'var(--bg-2)', border: '1px solid var(--line-2)',
            color: 'var(--signal)', fontFamily: 'var(--mono)', fontSize: 11,
            padding: '6px 12px', borderRadius: 6, cursor: 'pointer', letterSpacing: '.06em',
          }}
        >+ 추가</button>
      </div>

      {/* 추가 폼 */}
      {adding && (
        <div style={{
          background: 'var(--bg-2)', border: '1px solid var(--line-2)',
          borderRadius: 7, padding: 16, marginBottom: 14,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        }}>
          {[
            { key: 'name', label: '회사명', placeholder: 'Databricks' },
            { key: 'sector', label: '섹터', placeholder: 'AI / 데이터' },
            { key: 'valuation', label: '밸류에이션', placeholder: '$43B (추정)' },
            { key: 'note', label: '메모', placeholder: '출처 또는 근거' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <div style={{ fontSize: 9, color: 'var(--gray-d)', fontFamily: 'var(--mono)', letterSpacing: '.1em', marginBottom: 4 }}>{label}</div>
              <input
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                style={{
                  width: '100%', background: 'var(--bg)', border: '1px solid var(--line)',
                  borderRadius: 5, color: 'var(--white)', fontFamily: 'var(--mono)',
                  fontSize: 12, padding: '7px 10px', outline: 'none',
                }}
              />
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={() => setAdding(false)} style={btnStyle('secondary')}>취소</button>
            <button onClick={handleAdd} style={btnStyle('primary')}>저장</button>
          </div>
        </div>
      )}

      {/* 리스트 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 10 }}>
        {items.map((item) => {
          const domain = DOMAIN_MAP[item.id];
          return (
            <div key={item.id} style={{
              background: 'var(--bg-2)', border: '1px solid var(--line)',
              borderRadius: 7, padding: '13px 15px', position: 'relative',
            }}
              className="private-card"
            >
              <button
                className="remove-btn"
                style={{
                  position: 'absolute', top: 8, right: 8, width: 18, height: 18,
                  borderRadius: 4, background: 'var(--bg)', color: 'var(--gray-d)',
                  border: '1px solid var(--line)', fontSize: 10, display: 'none',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
                onClick={() => handleRemove(item.id)}
              >✕</button>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Chip size="m" kind="company" name={item.name} domain={domain} />
                  <div>
                    <div style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--gray)', marginTop: 1 }}>{item.sector}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600 }}>{item.valuation}</div>
                  <div style={{ fontSize: 9, color: 'var(--gray-d)', fontFamily: 'var(--mono)', marginTop: 2 }}>
                    {item.lastUpdated} 기준
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray)', lineHeight: 1.55 }}>{item.note}</div>
              <div style={{
                fontSize: 9, color: 'var(--signal)', fontFamily: 'var(--mono)',
                marginTop: 8, letterSpacing: '.08em',
              }}>비상장 · 추정치</div>
            </div>
          );
        })}
      </div>

      <style>{`
        .private-card:hover .remove-btn { display: flex !important; }
      `}</style>
    </div>
  );
}

function btnStyle(variant: 'primary' | 'secondary'): React.CSSProperties {
  return {
    background: variant === 'primary' ? 'var(--white)' : 'var(--bg)',
    color: variant === 'primary' ? 'var(--bg)' : 'var(--gray)',
    border: '1px solid ' + (variant === 'primary' ? 'var(--white)' : 'var(--line)'),
    fontFamily: 'var(--mono)', fontSize: 11, padding: '7px 14px',
    borderRadius: 6, cursor: 'pointer', letterSpacing: '.04em',
  };
}
