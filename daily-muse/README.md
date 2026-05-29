# Daily Muse — 매일의 영감 저널 (v2)

광고대행사 카피라이터를 위한 데일리 인스피레이션 사이트.
AI(Claude API)가 매일 카테고리별로 **인사이트·트렌드·추천 영상**을 큐레이션하고,
다크·미니멀·세리프 에디토리얼 톤으로 보여줍니다.

> 톤앤매너: **A안 — 다크 미니멀 세리프**. 매거진 같은 절제미, 종이 그레인 텍스처, 라이트/다크 토글.

---

## 기능

**보기 → 연결 → 쓰기 → 축적 → 회고** 의 창작 루프를 한 화면에 담았습니다.

### 큐레이션
- **23개 카테고리 × 4대 계열** (창작 / 사유 / 기술·과학 / 자본)
- 카테고리별 **인사이트 3+ · 추천 영상 3+ · 오늘의 한 문장(spark)**
- **무드 태그 필터 + 검색** (#반전 #미니멀 #페이소스 …)

### 데일리 의식
- **오늘의 질문** · **랜덤 충돌**(강제 연결, 즉석 리롤) · **오늘의 사색** · **5분 라이팅 + 자동저장 메모장**

### 습관·축적 (v2)
- **연속 방문 스트릭** + 누적 방문일 — 매일 오게 만드는 장치
- **읽음/안읽음 추적** — 스크롤로 본 인사이트는 자동 읽음, 새것은 ● 점과 "새 N" 알약으로 표시
- **아카이브 타임머신** — 과거 날짜의 피드를 셀렉터로 다시 보기
- **스와이프 파일** — ✦ 로 모으고, 날짜·카테고리와 함께 보관

### 쓰기 연동 (v2)
- **인사이트 → 카피 발상** — 각 인사이트의 "✎ 카피" 버튼으로 Claude에게 즉석 카피 5개 요청
- **주간 회고 다이제스트** — 모아둔 스와이프 파일을 관통하는 흐름을 Claude가 회고 카피로 엮어줌
- **개인화 키워드** — 진행 중인 캠페인 키워드를 넣으면 카피 발상·AI 큐레이션이 그 맥락에 연결됨

### 조작
- **키보드 단축키** — `/` 검색 · `t` 테마 · `s` 보관함 · `r` 섞기 · `u` 안읽음 · `Esc` 닫기/정독해제
- **정독 모드** — 한 카테고리만 깊게 보기
- 라이트/다크 토글, 토스트 알림

---

## 폴더 구조

```
daily-muse/
├─ index.html             진입점 (루트)
├─ src/
│  ├─ styles/main.css      A안 다크 미니멀 세리프 + v2 스타일
│  └─ scripts/app.js       렌더·필터·읽음추적·스트릭·아카이브·다이제스트
├─ scripts/
│  └─ generate.js          Claude API 콘텐츠 생성기 (+개인화·아카이브 인덱스)
├─ data/
│  ├─ categories.json      카테고리·그룹·무드 태그
│  ├─ feed.json            오늘의 콘텐츠
│  └─ archive/             날짜별 백업 + index.json (타임머신용)
└─ package.json
```

---

## 빠른 시작

```bash
npm install
npm run dev          # http://localhost:3000  — 시드 데이터로 즉시 작동 (아카이브 2일치 포함)
```

API 키 없이도 시드 데이터로 모든 UI가 작동합니다.

---

## AI 콘텐츠 생성

```bash
export ANTHROPIC_API_KEY=sk-ant-...

npm run generate                                   # 전체 카테고리
node scripts/generate.js --categories=ai,branding  # 특정 카테고리만
node scripts/generate.js --keywords=보람그룹,SK이노베이션   # 개인화 큐레이션
npm run generate:dry                               # 저장 없이 미리보기
```

생성 시 `data/feed.json` 갱신 + `data/archive/YYYY-MM-DD.json` 백업 +
`data/archive/index.json`(타임머신 목록) 자동 갱신.

### 매일 자동 갱신 (cron)
```bash
0 6 * * *  cd /path/to/daily-muse && ANTHROPIC_API_KEY=sk-... npm run generate >> generate.log 2>&1
```

---

## 카피 발상·다이제스트 동작 방식

"✎ 카피" / "회고 카피로 엮기" 버튼은 전역 `sendPrompt()` 가 있으면 그대로 Claude에 전송,
없으면 프롬프트를 **클립보드에 복사**합니다. Claude Code/데스크톱 환경에 맞춰 `sendToClaude()`
함수만 바꾸면 원하는 방식으로 연결할 수 있습니다 (app.js 참고).

---

## 커스터마이징
- **카테고리/그룹/무드**: `data/categories.json`
- **색·타이포**: `src/styles/main.css` 의 `:root` (`--accent`, `--serif`, `--display`)
- **큐레이션 톤**: `scripts/generate.js` 의 `buildPrompt` / `buildDailyPrompt`

---

## 다음 단계 아이디어
1. **YouTube Data API** 연동 — 검색어를 실제 영상 ID로 치환
2. **뉴스레터 발행** — feed.json → 매일 이메일 자동 발송
3. **태그 그래프** — 무드 태그·카테고리 간 연결을 시각화해 발상 경로 탐색
4. **클라우드 동기화** — 스와이프 파일·키워드를 기기 간 공유 (현재는 localStorage)

MIT License
