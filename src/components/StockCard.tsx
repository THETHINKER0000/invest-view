import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { StockData } from '../types';
import { fmtPrice } from '../lib/format';
import Chip from './Chip';

interface Props {
  stock: StockData;
  active: boolean;
  onSelect: (t: string) => void;
  onRemove: (t: string) => void;
}

export default function StockCard({ stock, active, onSelect, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stock.t });

  const up = stock.chg >= 0;
  const color = up ? 'var(--up)' : 'var(--down)';

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: active ? 'var(--bg-3)' : 'var(--bg-2)',
        border: `1px solid ${active ? 'var(--white)' : 'var(--line)'}`,
        borderRadius: 9,
        padding: 15,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 152,
        position: 'relative',
        transition: 'border-color .15s, background .15s, transform .12s',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
      onClick={() => onSelect(stock.t)}
      className="stock-card"
    >
      {/* 제거 버튼 */}
      <button
        className="remove-btn"
        style={{
          position: 'absolute', top: 8, right: 8, width: 18, height: 18,
          borderRadius: 4, background: 'var(--bg)', color: 'var(--gray-d)',
          border: '1px solid var(--line)', fontSize: 10, display: 'none',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}
        title="제거"
        onClick={(e) => { e.stopPropagation(); onRemove(stock.t); }}
      >✕</button>

      {/* 상단: 드래그 핸들 + 티커 + 로고 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span
            {...attributes}
            {...listeners}
            title="드래그로 이동"
            style={{
              color: 'var(--gray-d)', fontSize: 13, lineHeight: 0.5,
              letterSpacing: -1, cursor: 'grab', userSelect: 'none',
              padding: '4px 2px',
            }}
            onClick={(e) => e.stopPropagation()}
          >⠿⠿</span>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 15, letterSpacing: '.04em' }}>
              {stock.t}
            </div>
            <div style={{ fontSize: 10, color: 'var(--gray)', marginTop: 2 }}>{stock.sec}</div>
          </div>
        </div>
        {/* ticker 첫 2글자를 이니셜로 — Clearbit 로드 실패 시 TS, PL 등 표시 */}
        <Chip size="m" kind="company" name={stock.t} domain={stock.domain} />
      </div>

      {/* 가격 */}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 21, fontWeight: 500, marginTop: 'auto', paddingTop: 8, letterSpacing: '.01em' }}>
        {fmtPrice(stock.price)}
      </div>

      {/* 등락 */}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, marginTop: 2, display: 'flex', gap: 7, color }}>
        <span>{up ? '▲ ' : '▼ '}{Math.abs(stock.chg).toFixed(2)}%</span>
        <span style={{ color: 'var(--gray-d)' }}>
          {up ? '+' : '-'}${Math.abs(stock.price * stock.chg / 100).toFixed(2)}
        </span>
      </div>

      {/* 스파크라인 */}
      <div style={{ marginTop: 7, height: 28 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stock.sparkData}>
            <defs>
              <linearGradient id={`sg${stock.t}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={up ? '#F4F4F5' : '#5E5E66'} stopOpacity={0.22} />
                <stop offset="100%" stopColor={up ? '#F4F4F5' : '#5E5E66'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={up ? '#F4F4F5' : '#55555C'}
              strokeWidth={1.4}
              fill={`url(#sg${stock.t})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <style>{`
        .stock-card:hover .remove-btn { display: flex !important; }
        .stock-card:hover { background: var(--bg-3) !important; border-color: var(--line-2) !important; }
      `}</style>
    </div>
  );
}
