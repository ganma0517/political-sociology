// 自動列出教材：直接讀 GitHub repo 各資料夾的檔案清單，
// 不需要維護 catalog.json。上傳檔案後，首頁會自動出現對應卡片。

const CFG = {
  owner: "ganma0517",
  repo: "political-sociology",
  branch: "main",
  title: "政治社會學教材資料庫",
  subtitle: "Political Sociology Teaching Materials",
  author: "林文成 Wen-Cheng Lin",
  intro: "本資料庫收錄政治社會學課程的講義、投影片與可下載檔案。上傳檔案即自動出現於此，毋需手動維護目錄。",
  sections: [
    { dir: "lectures",  cat: "lecture",  name: "講義",     color: "#2563eb", exts: ["html"] },
    { dir: "slides",    cat: "slides",   name: "投影片",   color: "#7c3aed", exts: ["html"] },
    { dir: "downloads", cat: "download", name: "檔案下載", color: "#d97706", exts: ["pdf","docx","doc","pptx","ppt","xlsx","xls","csv","zip"] },
  ],
};

// 不顯示的檔案：模板（_開頭）、範例、placeholder、隱藏檔
const EXCLUDE = /(^_)|(^\.)|template|sample|placeholder|\.gitkeep|intro-political-sociology/i;

let MATERIALS = [];
let activeCat = "all";
let keyword = "";

const $ = (s) => document.querySelector(s);

async function init() {
  $("#site-title").textContent = CFG.title;
  $("#site-subtitle").textContent = CFG.subtitle;
  $("#site-intro").textContent = CFG.intro;
  $("#footer-author").textContent = CFG.author;
  document.title = CFG.title;

  buildFilters();
  $("#cards").innerHTML = "<p class='empty'>載入教材中…</p>";

  // 逐一讀取各資料夾的檔案清單
  for (const sec of CFG.sections) {
    const files = await listDir(sec.dir);
    for (const f of files) {
      const ext = f.name.split(".").pop().toLowerCase();
      if (!sec.exts.includes(ext)) continue;
      if (EXCLUDE.test(f.name)) continue;
      MATERIALS.push({
        section: sec,
        name: f.name,
        url: `${sec.dir}/${f.name}`,
        title: prettyName(f.name),
      });
    }
  }

  // 對 HTML 教材，抓取網頁 <title> 當顯示標題（同源讀取，不受 API 限制）
  await Promise.all(MATERIALS.map(async (m) => {
    if (m.name.toLowerCase().endsWith(".html")) {
      const t = await fetchTitle(m.url);
      if (t) m.title = t;
    }
  }));

  // 依檔名排序（W1, W2, … 自然遞增）
  MATERIALS.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant", { numeric: true }));

  render();
  $("#search").addEventListener("input", (e) => { keyword = e.target.value.trim().toLowerCase(); render(); });
}

async function listDir(dir) {
  const api = `https://api.github.com/repos/${CFG.owner}/${CFG.repo}/contents/${dir}?ref=${CFG.branch}`;
  try {
    const r = await fetch(api, { headers: { "Accept": "application/vnd.github+json" } });
    if (!r.ok) return [];
    const arr = await r.json();
    return Array.isArray(arr) ? arr.filter((x) => x.type === "file") : [];
  } catch (e) {
    return [];
  }
}

async function fetchTitle(url) {
  try {
    const r = await fetch(url + "?v=" + Date.now());
    const html = await r.text();
    const m = html.match(/<title>([^<]*)<\/title>/i);
    if (!m) return null;
    return m[1].split("｜")[0].split(" | ")[0].trim();
  } catch (e) { return null; }
}

function prettyName(name) {
  return name.replace(/\.[^.]+$/, "").replace(/[_]+/g, " ").trim();
}

function buildFilters() {
  const box = $("#filters");
  const cats = [{ cat: "all", name: "全部", color: "#1f2330" }, ...CFG.sections];
  box.innerHTML = "";
  cats.forEach((c) => {
    const b = document.createElement("button");
    b.className = "chip" + (c.cat === activeCat ? " active" : "");
    b.textContent = c.name;
    b.onclick = () => {
      activeCat = c.cat;
      document.querySelectorAll(".chip").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      render();
    };
    box.appendChild(b);
  });
}

function matchKeyword(m) {
  if (!keyword) return true;
  return (m.title + " " + m.name + " " + m.section.name).toLowerCase().includes(keyword);
}

function render() {
  const list = MATERIALS
    .filter((m) => activeCat === "all" || m.section.cat === activeCat)
    .filter(matchKeyword);

  const box = $("#cards");
  box.innerHTML = "";
  $("#empty").hidden = list.length > 0;
  if (MATERIALS.length === 0) {
    box.innerHTML = "<p class='empty'>目前沒有教材，或 GitHub 暫時無法讀取清單，請稍後重新整理。</p>";
    return;
  }

  list.forEach((m) => {
    const c = m.section;
    const a = document.createElement("a");
    a.className = "card";
    a.href = m.url;
    if (c.cat === "download") a.setAttribute("download", "");
    if (c.cat === "slides") a.target = "_blank";
    a.innerHTML = `
      <span class="tag-cat" style="background:${c.color}">${c.name}</span>
      <h3>${escapeHtml(m.title)}</h3>
      <div class="meta"><span>📄 ${escapeHtml(m.name)}</span></div>
    `;
    box.appendChild(a);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[ch]));
}

init();
