#!/usr/bin/env node
/**
 * generate.js — Daily Muse 콘텐츠 생성기
 *
 * Claude API를 호출해 카테고리별 인사이트·트렌드·영상 추천을 생성하고
 * data/feed.json 에 저장합니다. cron 으로 매일 새벽에 돌리면 됩니다.
 *
 * 사용:  ANTHROPIC_API_KEY=sk-... node scripts/generate.js
 * 옵션:  --categories=advertising,ai,philosophy   (지정 카테고리만)
 *        --dry                                     (저장 없이 콘솔 출력)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");

const MODEL = "claude-opus-4-8";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const catArg = args.find((a) => a.startsWith("--categories="));
const kwArg = args.find((a) => a.startsWith("--keywords="));
const KEYWORDS = kwArg ? kwArg.split("=")[1].split(",").map((s) => s.trim()).filter(Boolean) : [];

const { categories, groups, moodTags } = JSON.parse(
  fs.readFileSync(path.join(DATA, "categories.json"), "utf-8")
);

const today = new Date().toISOString().slice(0, 10);
const targetCats = catArg
  ? catArg.split("=")[1].split(",")
  : Object.keys(categories);

/** 카테고리별 콘텐츠 묶음 생성 프롬프트 */
function buildPrompt(catId) {
  const cat = categories[catId];
  const kwLine = KEYWORDS.length
    ? `\n\n[개인화 맥락] 사용자는 지금 다음 키워드로 작업 중입니다: ${KEYWORDS.join(", ")}.
가능한 항목은 이 맥락과 느슨하게 연결되도록 큐레이션하되, 억지로 끼워맞추지는 마세요.`
    : "";
  return `당신은 광고대행사 카피라이터를 위한 영감 큐레이터입니다.
"${cat.label}(${cat.labelEn})" 카테고리에서 오늘(${today}) 기준으로 창의력을 자극할
인사이트와 트렌드를 큐레이션하세요.${kwLine}

요구사항:
- 인사이트/트렌드 항목을 정확히 3개 이상 작성
- 각 항목은 카피라이터의 발상에 실제로 도움이 되는 관점이어야 함 (단순 뉴스 요약 X)
- 추천 영상 3개 이상 (실제 존재할 법한 검색어 형태의 searchQuery 포함 — 직접 링크 대신
  YouTube 검색을 열 수 있도록)
- 한국어로 작성. 세련되고 절제된 톤.
- moodTag 는 다음 중에서만 선택: ${moodTags.join(", ")}

반드시 아래 JSON 스키마로만 응답하세요. 마크다운/설명/백틱 없이 순수 JSON만:
{
  "spark": "이 카테고리의 오늘 한 문장 (도발적이고 카피적인 트리거)",
  "insights": [
    { "title": "...", "body": "2~3문장", "moodTags": ["...", "..."] }
  ],
  "videos": [
    { "title": "...", "channel": "추정 채널/출처", "why": "왜 볼 가치가 있는지 1문장", "searchQuery": "유튜브 검색어" }
  ]
}`;
}

/** 데일리 공통 요소(오늘의 질문, 랜덤 충돌) 생성 */
function buildDailyPrompt() {
  const catLabels = Object.values(categories).map((c) => c.label);
  return `당신은 카피라이터의 창의력을 깨우는 에디터입니다. 오늘(${today})의 데일리 요소를 만드세요.

1) question: 발상을 자극하는 도발적 질문 1개 (예: "브랜드가 종교라면 첫 계율은?")
2) collision: 서로 무관한 두 카테고리를 강제로 엮은 발상 과제. 아래 목록에서 2개를 골라 조합.
   카테고리: ${catLabels.join(", ")}
3) prompt5min: 5분 안에 쓸 수 있는 짧은 카피 연습 과제 1개
4) quote: 사색을 위한 동서양 경구 1개 (저작권 안전한 고전/금언, 출처 표기)

순수 JSON만 응답:
{ "question": "...", "collision": { "a": "...", "b": "...", "task": "..." }, "prompt5min": "...", "quote": { "text": "...", "source": "..." } }`;
}

async function callJSON(prompt) {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });
  const text = res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .replace(/```json|```/g, "")
    .trim();
  return JSON.parse(text);
}

async function main() {
  console.log(`▶ Daily Muse 생성 시작 — ${today} (${targetCats.length}개 카테고리)`);

  const feed = { date: today, generatedAt: new Date().toISOString(), daily: null, categories: {} };

  try {
    feed.daily = await callJSON(buildDailyPrompt());
    console.log("  ✓ 데일리 요소");
  } catch (e) {
    console.error("  ✗ 데일리 요소 실패:", e.message);
  }

  for (const catId of targetCats) {
    try {
      const block = await callJSON(buildPrompt(catId));
      feed.categories[catId] = { ...categories[catId], ...block };
      console.log(`  ✓ ${categories[catId].label}`);
    } catch (e) {
      console.error(`  ✗ ${catId} 실패:`, e.message);
    }
  }

  if (dry) {
    console.log(JSON.stringify(feed, null, 2));
    return;
  }

  // 최신본 + 날짜별 아카이브 동시 저장
  fs.writeFileSync(path.join(DATA, "feed.json"), JSON.stringify(feed, null, 2));
  const archiveDir = path.join(DATA, "archive");
  fs.mkdirSync(archiveDir, { recursive: true });
  fs.writeFileSync(path.join(archiveDir, `${today}.json`), JSON.stringify(feed, null, 2));

  // 아카이브 인덱스(타임머신용) 갱신 — 최신순 정렬
  const dates = fs
    .readdirSync(archiveDir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.replace(".json", ""))
    .sort((a, b) => b.localeCompare(a));
  fs.writeFileSync(
    path.join(archiveDir, "index.json"),
    JSON.stringify({ dates, updated: new Date().toISOString() }, null, 2)
  );

  console.log(`✔ 저장 완료 → data/feed.json (+ archive/${today}.json, index.json)`);
}

main().catch((e) => {
  console.error("치명적 오류:", e);
  process.exit(1);
});
