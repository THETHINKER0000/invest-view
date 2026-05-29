/* ============================================================
   Daily Muse v2 — app.js
   추가: 읽음추적 · 스트릭 · 아카이브 타임머신 · 주간 다이제스트
        · 인사이트→카피발상 · 개인화 키워드 · 단축키 · 정독 모드
   ============================================================ */

const LS = {
  theme: "dm_theme",
  swipe: "dm_swipe",
  scratch: "dm_scratch",
  seen: "dm_seen",          // 읽은 인사이트 id 집합
  visits: "dm_visits",      // 방문 날짜 기록 (스트릭 계산)
  keywords: "dm_keywords",  // 개인화 키워드
  lastFeed: "dm_lastfeed",  // 마지막으로 본 feed 날짜
};

let FEED = null;
let CATS = null;
let activeGroup = "all";
let activeMoods = new Set();
let query = "";
let focusCat = null;        // 정독 모드 (단일 카테고리)
let onlyUnread = false;
let onlySaved = false;
let availableDates = [];    // 아카이브 가능한 날짜

/* ── 부트스트랩 ─────────────────────────── */
async function boot() {
  applyTheme(localStorage.getItem(LS.theme) || "dark");

  try {
    const [feed, cats] = await Promise.all([
      fetch("data/feed.json").then((r) => r.json()),
      fetch("data/categories.json").then((r) => r.json()),
    ]);
    FEED = feed;
    CATS = cats;
  } catch (e) {
    document.getElementById("feed").innerHTML =
      '<p class="empty">데이터를 불러오지 못했습니다. 로컬 서버로 실행해 주세요 (README 참고).</p>';
    console.error(e);
    return;
  }

  recordVisit();
  detectNewFeed();
  renderDate();
  renderStreak();
  renderDaily();
  renderGroupNav();
  renderMoodFilter();
  renderKeywords();
  renderFeed();
  wireEvents();
  wireShortcuts();
  restoreScratch();
  renderSwipe();
  loadArchiveDates();
}

/* ── 방문 기록 / 스트릭 ─────────────────── */
function todayStr() { return new Date().toISOString().slice(0, 10); }

function recordVisit() {
  const v = getJSON(LS.visits, []);
  const t = todayStr();
  if (!v.includes(t)) { v.push(t); setJSON(LS.visits, v.slice(-400)); }
}

function calcStreak() {
  const v = getJSON(LS.visits, []).sort();
  if (!v.length) return 0;
  const set = new Set(v);
  let streak = 0;
  let d = new Date();
  // 오늘 방문 안했어도 어제까지 이어졌으면 유지
  if (!set.has(fmtDate(d))) d.setDate(d.getDate() - 1);
  while (set.has(fmtDate(d))) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}
function fmtDate(d) { return d.toISOString().slice(0, 10); }

function renderStreak() {
  const s = calcStreak();
  const total = getJSON(LS.visits, []).length;
  const el = document.getElementById("streak");
  if (el) el.innerHTML = `연속 <em>${s}</em>일 · 누적 ${total}일`;
}

/* ── 새 콘텐츠 감지 ─────────────────────── */
function detectNewFeed() {
  const last = localStorage.getItem(LS.lastFeed);
  FEED._isNew = last !== FEED.date;
  // 본 적 없는 feed면 이 feed의 인사이트를 "새것"으로 표시 (seen에서 제외 상태)
  localStorage.setItem(LS.lastFeed, FEED.date);
}

/* ── 읽음 추적 ──────────────────────────── */
function getSeen() { return new Set(getJSON(LS.seen, [])); }
function markSeen(id) {
  const s = getSeen(); s.add(id); setJSON(LS.seen, [...s].slice(-2000));
}
function isUnread(id) { return !getSeen().has(id); }

/* ── 헤더 / 날짜 ────────────────────────── */
function renderDate() {
  const d = new Date(FEED.date + "T00:00:00");
  const fmt = `${d.getFullYear()} · ${String(d.getMonth() + 1).padStart(2, "0")} · ${String(d.getDate()).padStart(2, "0")}`;
  setText("date-display", fmt);
  setText("gen-stamp", FEED.seed ? "seed edition" : `updated ${FEED.date}`);
  const badge = document.getElementById("new-badge");
  if (badge) badge.hidden = !FEED._isNew;
}

/* ── 데일리 의식 ────────────────────────── */
function renderDaily() {
  const d = FEED.daily || {};
  setText("daily-question", d.question || "");
  setText("daily-quote", d.quote?.text || "");
  setText("daily-quote-source", d.quote?.source || "");
  setText("daily-prompt5", d.prompt5min || "");
  renderCollision(d.collision);
}
function renderCollision(c) {
  if (!c) return;
  setText("collision-pair", `${c.a} × ${c.b}`);
  setText("collision-task", c.task || "");
}
function rerollCollision() {
  const labels = Object.values(CATS.categories).map((c) => c.label);
  const a = labels[Math.floor(Math.random() * labels.length)];
  let b = a;
  while (b === a) b = labels[Math.floor(Math.random() * labels.length)];
  setText("collision-pair", `${a} × ${b}`);
  setText("collision-task",
    `'${a}'의 논리를 '${b}'의 세계로 강제 이식하면 어떤 카피가 나올까? 5분간 자유 연상해 보라.`);
}

/* ── 그룹 내비 ──────────────────────────── */
function renderGroupNav() {
  const nav = document.getElementById("group-nav");
  const buttons = [{ id: "all", label: "전체" }, ...CATS.groups];
  nav.innerHTML = buttons
    .map((g) => `<button data-group="${g.id}" class="${g.id === activeGroup ? "active" : ""}">${g.label}</button>`)
    .join("");
  nav.querySelectorAll("button").forEach((btn) =>
    btn.addEventListener("click", () => {
      activeGroup = btn.dataset.group; focusCat = null;
      nav.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderFeed();
    })
  );
}

/* ── 무드 필터 ──────────────────────────── */
function renderMoodFilter() {
  const wrap = document.getElementById("mood-filter");
  wrap.innerHTML = CATS.moodTags
    .map((m) => `<button class="mood-chip" data-mood="${m}">${m}</button>`)
    .join("");
  wrap.querySelectorAll(".mood-chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      const m = chip.dataset.mood;
      if (activeMoods.has(m)) { activeMoods.delete(m); chip.classList.remove("active"); }
      else { activeMoods.add(m); chip.classList.add("active"); }
      renderFeed();
    })
  );
}

/* ── 개인화 키워드 ──────────────────────── */
function renderKeywords() {
  const arr = getJSON(LS.keywords, []);
  const wrap = document.getElementById("keyword-list");
  if (!wrap) return;
  wrap.innerHTML = arr.map((k, i) =>
    `<span class="kw">${esc(k)}<i data-kwrm="${i}">✕</i></span>`).join("");
  wrap.querySelectorAll("[data-kwrm]").forEach((el) =>
    el.addEventListener("click", () => {
      const a = getJSON(LS.keywords, []); a.splice(+el.dataset.kwrm, 1);
      setJSON(LS.keywords, a); renderKeywords();
    })
  );
}
function addKeyword(k) {
  k = k.trim(); if (!k) return;
  const a = getJSON(LS.keywords, []);
  if (!a.includes(k)) { a.push(k); setJSON(LS.keywords, a.slice(0, 12)); }
  renderKeywords();
}

/* ── 피드 렌더 ──────────────────────────── */
function catsForGroup() {
  if (focusCat) return [focusCat];
  if (activeGroup === "all") return Object.keys(FEED.categories);
  const g = CATS.groups.find((x) => x.id === activeGroup);
  return g ? g.categories.filter((c) => FEED.categories[c]) : [];
}

function matchInsight(ins, sid) {
  if (onlySaved && !isSaved(sid)) return false;
  if (onlyUnread && !isUnread(sid)) return false;
  if (activeMoods.size && !ins.moodTags?.some((t) => activeMoods.has(t))) return false;
  if (query) {
    const hay = (ins.title + ins.body + (ins.moodTags || []).join("")).toLowerCase();
    if (!hay.includes(query)) return false;
  }
  return true;
}

function renderFeed() {
  const feed = document.getElementById("feed");
  const ids = catsForGroup();
  let html = "";
  let hits = 0;

  for (const id of ids) {
    const c = FEED.categories[id];
    if (!c) continue;

    const rawInsights = c.insights || [];
    const shown = rawInsights
      .map((ins, idx) => ({ ins, idx, sid: `${FEED.date}:${id}-${idx}` }))
      .filter(({ ins, sid }) => matchInsight(ins, sid));

    const catNameMatch = !query || (c.label + c.labelEn).toLowerCase().includes(query);
    if (!shown.length && !(catNameMatch && !onlySaved && !onlyUnread && !activeMoods.size && !query)) {
      // 카테고리명만 매칭되고 필터 없을 때는 전체 노출
      if (!(catNameMatch && !onlySaved && !onlyUnread && !activeMoods.size)) continue;
    }
    const finalInsights = shown.length ? shown
      : rawInsights.map((ins, idx) => ({ ins, idx, sid: `${FEED.date}:${id}-${idx}` }));
    if (!finalInsights.length) continue;
    hits++;

    const unreadCount = rawInsights.filter((_, idx) => isUnread(`${FEED.date}:${id}-${idx}`)).length;

    const insightsHtml = finalInsights.map(({ ins, sid }) => {
      const saved = isSaved(sid);
      const unread = isUnread(sid);
      return `<div class="insight ${unread ? "unread" : ""}" data-sid="${sid}">
        ${unread ? '<span class="dot" title="새 인사이트"></span>' : ""}
        <div class="insight-body">
          <h4>${esc(ins.title)}</h4>
          <p>${esc(ins.body)}</p>
          <div class="insight-foot">
            <div class="insight-tags">${(ins.moodTags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
            <div class="insight-actions">
              <button class="mini" data-copy="${sid}" title="이 인사이트로 카피 발상">✎ 카피</button>
              <button class="save-btn ${saved ? "saved" : ""}" data-save="${sid}"
                data-title="${esc(ins.title)}" data-body="${esc(ins.body)}" data-cat="${esc(c.label)}"
                aria-label="스와이프 파일에 저장">✦</button>
            </div>
          </div>
        </div>
      </div>`;
    }).join("");

    const videosHtml = (c.videos || []).map((v) => {
      const url = "https://www.youtube.com/results?search_query=" + encodeURIComponent(v.searchQuery || v.title);
      return `<a class="video" href="${url}" target="_blank" rel="noopener">
        <div class="video-title">${esc(v.title)}</div>
        <div class="video-meta">${esc(v.channel || "")}</div>
        ${v.why ? `<div class="video-why">${esc(v.why)}</div>` : ""}
      </a>`;
    }).join("");

    html += `<section class="cat-block" data-cat="${id}">
      <div class="cat-head">
        <span class="cat-title">${esc(c.label)}</span>
        <span class="cat-title-en">${esc(c.labelEn || "")}</span>
        ${unreadCount ? `<span class="unread-pill">새 ${unreadCount}</span>` : ""}
        <button class="focus-btn" data-focus="${id}" title="이 카테고리만 정독">정독 →</button>
        ${c.spark ? `<span class="cat-spark">${esc(c.spark)}</span>` : ""}
      </div>
      <div class="cat-cols">
        <div class="insights">${insightsHtml || '<p class="empty">조건에 맞는 인사이트 없음</p>'}</div>
        <div class="videos"><h5>오늘의 영상</h5>${videosHtml}</div>
      </div>
    </section>`;
  }

  feed.innerHTML = html;
  document.getElementById("empty-state").hidden = hits > 0;
  const fb = document.getElementById("focus-bar");
  if (fb) fb.hidden = !focusCat;

  feed.querySelectorAll("[data-save]").forEach((b) => b.addEventListener("click", () => toggleSave(b)));
  feed.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => copyIdeate(b)));
  feed.querySelectorAll("[data-focus]").forEach((b) => b.addEventListener("click", () => {
    focusCat = b.dataset.focus; renderFeed(); window.scrollTo({ top: 0, behavior: "smooth" });
  }));
  // 화면에 보인 인사이트는 읽음 처리 (IntersectionObserver)
  observeSeen();
}

/* 스크롤로 노출되면 읽음 처리 */
let _io = null;
function observeSeen() {
  if (_io) _io.disconnect();
  _io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const sid = e.target.dataset.sid;
        if (sid && isUnread(sid)) {
          markSeen(sid);
          e.target.classList.remove("unread");
          const dot = e.target.querySelector(".dot");
          if (dot) dot.remove();
        }
        _io.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".insight.unread").forEach((el) => _io.observe(el));
}

/* ── 인사이트 → 카피 발상 (Claude에게 위임) ── */
function copyIdeate(btn) {
  const card = btn.closest(".insight");
  const title = card.querySelector("h4").textContent;
  const body = card.querySelector("p").textContent;
  const kws = getJSON(LS.keywords, []);
  const kwLine = kws.length ? `\n내가 지금 작업 중인 키워드: ${kws.join(", ")}. 가능하면 이 맥락에 연결해줘.` : "";
  const prompt = `다음 인사이트에서 출발해 광고 카피 5개를 써줘. 한국어, 짧고 위트있게, 서로 다른 톤으로.\n\n인사이트: "${title}" — ${body}${kwLine}`;
  sendToClaude(prompt);
}

/* ── 주간 다이제스트 (스와이프 파일 회고) ── */
function weeklyDigest() {
  const arr = getSwipe();
  if (!arr.length) { toast("스와이프 파일이 비어 있어요. ✦ 로 인사이트를 모아보세요."); return; }
  const lines = arr.map((x, i) => `${i + 1}. [${x.cat}] ${x.title} — ${x.body}`).join("\n");
  const prompt = `아래는 내가 이번 주 모아둔 영감들이야. 이걸 관통하는 하나의 흐름을 찾아내고, 그걸 광고 크리에이티브 디렉터의 시선으로 짧은 회고 카피 한 편으로 엮어줘. 마지막엔 다음 주에 시도해볼 발상 방향 한 줄도 제안해줘.\n\n${lines}`;
  sendToClaude(prompt);
}

/* sendPrompt(전역, Imagine 환경) 또는 클립보드 폴백 */
function sendToClaude(text) {
  if (typeof sendPrompt === "function") { sendPrompt(text); return; }
  navigator.clipboard?.writeText(text).then(
    () => toast("프롬프트를 복사했어요. Claude에 붙여넣어 보세요."),
    () => prompt("아래 프롬프트를 복사해 Claude에 붙여넣으세요:", text)
  );
}

/* ── 스와이프 파일 ──────────────────────── */
function getSwipe() { return getJSON(LS.swipe, []); }
function setSwipe(arr) { setJSON(LS.swipe, arr); }
function isSaved(id) { return getSwipe().some((x) => x.id === id); }

function toggleSave(btn) {
  const id = btn.dataset.save;
  let arr = getSwipe();
  if (arr.some((x) => x.id === id)) {
    arr = arr.filter((x) => x.id !== id); btn.classList.remove("saved");
  } else {
    arr.push({ id, title: btn.dataset.title, body: btn.dataset.body, cat: btn.dataset.cat, at: todayStr() });
    btn.classList.add("saved"); toast("스와이프 파일에 저장됨");
  }
  setSwipe(arr); renderSwipe();
}

function renderSwipe() {
  const arr = getSwipe();
  setText("swipe-count", arr.length);
  setText("swipe-fab-count", arr.length);
  const empty = document.getElementById("swipe-empty");
  if (empty) empty.hidden = arr.length > 0;
  const list = document.getElementById("swipe-list");
  list.innerHTML = arr.map((x) =>
    `<div class="swipe-item">
      <h4>${esc(x.title)}</h4>
      <p>${esc(x.body)}</p>
      <span class="rm" data-rm="${x.id}">— ${esc(x.cat)}${x.at ? " · " + x.at : ""} · 제거</span>
    </div>`).join("");
  list.querySelectorAll("[data-rm]").forEach((el) =>
    el.addEventListener("click", () => {
      setSwipe(getSwipe().filter((x) => x.id !== el.dataset.rm));
      renderSwipe(); renderFeed();
    })
  );
}

/* ── 아카이브 타임머신 ──────────────────── */
async function loadArchiveDates() {
  // manifest 가 있으면 사용, 없으면 오늘만
  try {
    const m = await fetch("data/archive/index.json").then((r) => r.ok ? r.json() : null);
    availableDates = (m && m.dates) ? m.dates : [FEED.date];
  } catch { availableDates = [FEED.date]; }
  const sel = document.getElementById("archive-select");
  if (!sel) return;
  sel.innerHTML = availableDates.map((d) =>
    `<option value="${d}" ${d === FEED.date ? "selected" : ""}>${d}</option>`).join("");
  sel.addEventListener("change", () => loadFeedFor(sel.value));
}

async function loadFeedFor(date) {
  if (date === FEED.date) return;
  try {
    const f = await fetch(`data/archive/${date}.json`).then((r) => r.json());
    FEED = f;
    renderDate(); renderDaily(); renderFeed();
    toast(`${date} 아카이브를 불러왔어요`);
  } catch { toast("해당 날짜 아카이브가 없습니다"); }
}

/* ── 필터 토글 (읽음/저장) ──────────────── */
function setFilterButtons() {
  const u = document.getElementById("filter-unread");
  const s = document.getElementById("filter-saved");
  if (u) u.classList.toggle("active", onlyUnread);
  if (s) s.classList.toggle("active", onlySaved);
}

/* ── 이벤트 ─────────────────────────────── */
function wireEvents() {
  document.getElementById("search").addEventListener("input", (e) => {
    query = e.target.value.trim().toLowerCase(); renderFeed();
  });
  document.getElementById("reroll-collision").addEventListener("click", rerollCollision);
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    applyTheme(next); localStorage.setItem(LS.theme, next);
  });

  const fab = document.getElementById("swipe-fab");
  const drawer = document.getElementById("swipe-drawer");
  fab.addEventListener("click", () => drawer.classList.add("open"));
  document.getElementById("swipe-close").addEventListener("click", () => drawer.classList.remove("open"));
  const dg = document.getElementById("digest-btn");
  if (dg) dg.addEventListener("click", weeklyDigest);

  const u = document.getElementById("filter-unread");
  if (u) u.addEventListener("click", () => { onlyUnread = !onlyUnread; if (onlyUnread) onlySaved = false; setFilterButtons(); renderFeed(); });
  const s = document.getElementById("filter-saved");
  if (s) s.addEventListener("click", () => { onlySaved = !onlySaved; if (onlySaved) onlyUnread = false; setFilterButtons(); renderFeed(); });
  const clr = document.getElementById("clear-focus");
  if (clr) clr.addEventListener("click", () => { focusCat = null; renderFeed(); });

  const kwIn = document.getElementById("keyword-input");
  if (kwIn) kwIn.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { addKeyword(kwIn.value); kwIn.value = ""; }
  });

  const scratch = document.getElementById("scratch");
  scratch.addEventListener("input", () => localStorage.setItem(LS.scratch, scratch.value));
}

/* ── 키보드 단축키 ──────────────────────── */
function wireShortcuts() {
  document.addEventListener("keydown", (e) => {
    if (/input|textarea|select/i.test(e.target.tagName)) {
      if (e.key === "Escape") e.target.blur();
      return;
    }
    switch (e.key) {
      case "/": e.preventDefault(); document.getElementById("search").focus(); break;
      case "t": document.getElementById("theme-toggle").click(); break;
      case "s": document.getElementById("swipe-fab").click(); break;
      case "r": rerollCollision(); break;
      case "u": document.getElementById("filter-unread")?.click(); break;
      case "Escape":
        document.getElementById("swipe-drawer").classList.remove("open");
        if (focusCat) { focusCat = null; renderFeed(); }
        break;
    }
  });
}

function restoreScratch() {
  const v = localStorage.getItem(LS.scratch);
  if (v) document.getElementById("scratch").value = v;
}

/* ── 토스트 ─────────────────────────────── */
let _toastTimer = null;
function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
  el.textContent = msg; el.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ── 유틸 ───────────────────────────────── */
function applyTheme(t) { document.documentElement.dataset.theme = t; }
function getJSON(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }
function setJSON(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
function setText(id, t) { const el = document.getElementById(id); if (el) el.textContent = t; }
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

boot();
