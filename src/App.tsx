import { useState } from 'react';
import Header from './components/Header';
import SectionLabel from './components/SectionLabel';
import SearchZone from './components/SearchZone';
import MarketGrid from './components/MarketGrid';
import DetailPanel from './components/DetailPanel';
import SmartMoneyMatrix from './components/SmartMoneyMatrix';
import PortfolioModal from './components/PortfolioModal';
import PrivateWatchlist from './components/PrivateWatchlist';
import OutlookNotes from './components/OutlookNotes';
import MarketPulse from './components/MarketPulse';
import { useWatchlist } from './hooks/useWatchlist';
import narrativesJson from '../config/narratives.json';
import entitiesJson from '../config/entities.json';
import type { Entity, Narrative } from './types';

const narratives = narrativesJson as Record<string, Narrative>;
const entities = entitiesJson as Entity[];

export default function App() {
  const { stocks, reorder, addStock, removeStock } = useWatchlist();
  const [active, setActive] = useState<string>('TSLA');
  const [modalEntity, setModalEntity] = useState<Entity | null>(null);

  const selectedStock = stocks.find((s) => s.t === active) ?? stocks[0];
  const narrative = selectedStock ? (narratives[selectedStock.t] ?? null) : null;
  const ownedTickers = new Set(stocks.map((s) => s.t));
  const matrixTickers = stocks.map((s) => s.t).slice(0, 8);

  function handleJump(id: string) {
    const found = entities.find((e) => e.id === id);
    if (found) setModalEntity(found);
  }

  return (
    <>
      <Header />
      <main className="main" style={{ padding: '28px', maxWidth: 1340, margin: '0 auto' }}>
        <SectionLabel highlight="/ 실시간 지표" first>마켓 펄스</SectionLabel>
        <MarketPulse />

        <SectionLabel highlight="/ 기술 혁신주">마켓 그리드</SectionLabel>
        <SearchZone
          ownedTickers={ownedTickers}
          onAdd={addStock}
          onOpenEntity={setModalEntity}
        />
        <MarketGrid
          stocks={stocks}
          active={active}
          onSelect={setActive}
          onRemove={removeStock}
          onReorder={reorder}
        />

        {selectedStock && (
          <>
            <SectionLabel highlight={`/ ${selectedStock.t}`}>종목 상세</SectionLabel>
            <DetailPanel stock={selectedStock} narrative={narrative} />
          </>
        )}

        <SectionLabel highlight="/ 13F 기관 보유">스마트머니 트래커</SectionLabel>
        <SmartMoneyMatrix tickers={matrixTickers} onPick={setModalEntity} />

        <SectionLabel highlight="/ 유니콘 · 비공개 · 수동입력">비상장 워치리스트</SectionLabel>
        <PrivateWatchlist />

        <SectionLabel highlight="/ localStorage 저장">미래 전망 노트</SectionLabel>
        <OutlookNotes stocks={stocks} />
      </main>

      <footer style={{
        textAlign: 'center', color: 'var(--gray-d)', fontSize: 10,
        padding: '36px 28px', borderTop: '1px solid var(--line)', marginTop: 46,
        fontFamily: 'var(--mono)', lineHeight: 1.8, letterSpacing: '.03em',
      }}>
        INNOVATOR&rsquo;S DESK — 개인 참고용 대시보드. 투자 권유가 아니며 데이터 정확성을 보장하지 않습니다.<br />
        데이터 출처: FINNHUB · SEC EDGAR (13F / FORM 4 / 13D-G) · COINGECKO · 로고 CLEARBIT · 아바타 DICEBEAR
      </footer>

      <PortfolioModal
        entity={modalEntity}
        onClose={() => setModalEntity(null)}
        onJump={handleJump}
      />
    </>
  );
}
