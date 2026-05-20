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
import { useWatchlist } from './hooks/useWatchlist';
import narrativesJson from '../config/narratives.json';
import type { Entity, Narrative } from './types';

const narratives = narrativesJson as Record<string, Narrative>;

export default function App() {
  const { stocks, reorder, addStock, removeStock } = useWatchlist();
  const [active, setActive] = useState<string>('TSLA');
  const [modalEntity, setModalEntity] = useState<Entity | null>(null);

  const selectedStock = stocks.find((s) => s.t === active) ?? stocks[0];
  const narrative = selectedStock ? (narratives[selectedStock.t] ?? null) : null;
  const ownedTickers = new Set(stocks.map((s) => s.t));
  const matrixTickers = stocks.map((s) => s.t).slice(0, 8);

  return (
    <>
      <Header />
      <main style={{ padding: '28px', maxWidth: 1340, margin: '0 auto' }}>
        <SectionLabel highlight="/ 기술 혁신주" first>마켓 그리드</SectionLabel>
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

        <SectionLabel highlight="/ SpaceX · xAI · 수동입력">비상장 워치리스트</SectionLabel>
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
        데이터 출처: FINNHUB · SEC EDGAR (13F / FORM 4 / 13D-G) · COINGECKO
      </footer>

      <PortfolioModal entity={modalEntity} onClose={() => setModalEntity(null)} />
    </>
  );
}
