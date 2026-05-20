import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, rectSortingStrategy,
} from '@dnd-kit/sortable';
import type { StockData } from '../types';
import StockCard from './StockCard';

interface Props {
  stocks: StockData[];
  active: string;
  onSelect: (t: string) => void;
  onRemove: (t: string) => void;
  onReorder: (from: string, to: string) => void;
}

export default function MarketGrid({ stocks, active, onSelect, onRemove, onReorder }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active: a, over } = event;
    if (over && a.id !== over.id) {
      onReorder(String(a.id), String(over.id));
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={stocks.map((s) => s.t)} strategy={rectSortingStrategy}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}
          className="market-grid"
        >
          {stocks.map((s) => (
            <StockCard
              key={s.t}
              stock={s}
              active={s.t === active}
              onSelect={onSelect}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
      <style>{`
        @media (max-width: 1100px) { .market-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media (max-width: 820px)  { .market-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 520px)  { .market-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </DndContext>
  );
}
