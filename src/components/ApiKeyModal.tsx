import { useState } from 'react';
import { setFinnhubKey } from '../lib/finnhub';

interface Props {
  currentKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
}

export default function ApiKeyModal({ currentKey, onSave, onClose }: Props) {
  const [value, setValue] = useState('');

  function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) return;
    setFinnhubKey(trimmed);
    onSave(trimmed);
  }

  const maskedKey = currentKey
    ? currentKey.slice(0, 4) + '****'
    : null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,.72)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        background: 'var(--bg-1)', border: '1px solid var(--line-2)',
        borderRadius: 10, padding: '28px 28px 24px',
        width: 420, maxWidth: '92vw', position: 'relative',
      }}>
        {/* X button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--gray)', fontSize: 16, lineHeight: 1,
            fontFamily: 'var(--mono)', padding: '2px 6px',
          }}
        >
          ✕
        </button>

        <h2 style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, letterSpacing: '.12em', marginBottom: 10 }}>
          API 키 설정
        </h2>

        <p style={{ fontSize: 12, color: 'var(--gray)', lineHeight: 1.6, marginBottom: 14 }}>
          Finnhub 무료 API 키로 실시간 가격·차트 활성화
        </p>

        <p style={{ fontSize: 11, color: 'var(--gray-d)', fontFamily: 'var(--mono)', marginBottom: 18, letterSpacing: '.04em' }}>
          키 발급: finnhub.io/register
        </p>

        {maskedKey && (
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--line)',
            borderRadius: 5, padding: '7px 11px', marginBottom: 14,
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--gray)',
            letterSpacing: '.06em',
          }}>
            현재 키: {maskedKey}
          </div>
        )}

        <input
          type="text"
          placeholder="API 키를 입력하세요"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'var(--bg)', border: '1px solid var(--line)',
            borderRadius: 5, padding: '9px 12px',
            fontFamily: 'var(--mono)', fontSize: 12,
            color: 'var(--white)', outline: 'none',
            letterSpacing: '.04em', marginBottom: 14,
          }}
        />

        <button
          onClick={handleSave}
          disabled={!value.trim()}
          style={{
            width: '100%', padding: '10px 0',
            background: value.trim() ? 'var(--bg-3)' : 'var(--bg)',
            border: `1px solid ${value.trim() ? 'var(--line-2)' : 'var(--line)'}`,
            borderRadius: 5, cursor: value.trim() ? 'pointer' : 'default',
            fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600,
            color: value.trim() ? 'var(--white)' : 'var(--gray-d)',
            letterSpacing: '.08em', transition: 'all .15s',
          }}
        >
          저장
        </button>
      </div>
    </div>
  );
}
