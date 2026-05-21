import type { Narrative } from '../types';

const GENERIC: Narrative = {
  headline: '이 종목의 <em>서사를 직접</em> 써보세요',
  core: '검색으로 추가된 종목입니다. 카피라이터 관점의 서사를 직접 작성해 채워 넣을 수 있습니다.',
  direction: '(방향성 메모 입력 가능)',
  bull: '(강세 시나리오)',
  bear: '(약세 시나리오)',
  keywords: ['직접', '추가'],
};

interface Props {
  narrative: Narrative | null;
}

export default function NarrativePanel({ narrative }: Props) {
  const n = narrative ?? GENERIC;

  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--line)',
      borderLeft: '2px solid var(--signal)', borderRadius: 7, padding: 17,
    }}>
      <div style={{
        fontSize: 9, letterSpacing: '.2em', color: 'var(--gray)',
        fontWeight: 600, textTransform: 'uppercase', marginBottom: 11, fontFamily: 'var(--mono)',
      }}>
        서사 / NARRATIVE
      </div>

      {/* 헤드라인: em은 화이트 + 언더라인 */}
      <div
        style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.45, marginBottom: 13 }}
        dangerouslySetInnerHTML={{
          __html: n.headline.replace(
            /<em>/g,
            '<em style="color:var(--white);font-style:normal;border-bottom:1px solid var(--gray-d)">'
          ),
        }}
      />

      <div style={{ marginTop: 13 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--gray)', marginBottom: 5, letterSpacing: '.06em' }}>
          ◆ 핵심 서사
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--white)', lineHeight: 1.65 }}>{n.core}</p>
      </div>

      <div style={{ marginTop: 13 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--gray)', marginBottom: 5, letterSpacing: '.06em' }}>
          → 다음 방향성
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--white)', lineHeight: 1.65 }}>{n.direction}</p>
      </div>

      {/* 강세/약세 — 상승/하락 틴트 배경 */}
      <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
        <div style={{
          flex: 1, background: 'var(--up-dim)', border: '1px solid rgba(240,71,62,.3)',
          borderRadius: 6, padding: '9px 11px',
        }}>
          <div style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600, color: 'var(--up)' }}>
            ▲ 강세 서사
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--gray)', lineHeight: 1.55 }}>{n.bull}</p>
        </div>
        <div style={{
          flex: 1, background: 'var(--down-dim)', border: '1px solid rgba(62,139,240,.3)',
          borderRadius: 6, padding: '9px 11px',
        }}>
          <div style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600, color: 'var(--down)' }}>
            ▼ 약세 서사
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--gray)', lineHeight: 1.55 }}>{n.bear}</p>
        </div>
      </div>

      {/* 키워드 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
        {n.keywords.map((k) => (
          <span key={k} style={{
            fontSize: 10, fontFamily: 'var(--mono)', padding: '3px 8px', borderRadius: 4,
            background: 'var(--bg-2)', border: '1px solid var(--line)', color: 'var(--gray)',
          }}>#{k}</span>
        ))}
      </div>
    </div>
  );
}
