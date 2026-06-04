# 政治社會學教材資料庫

一個以 GitHub Pages 架設的靜態教材網站。首頁會自動讀取 `catalog.json`，產生可分類篩選與搜尋的教材卡片。支援四種教材：講義（靜態 HTML）、投影片（reveal.js）、圖表/資料、檔案下載（PDF 等）。

**核心觀念：新增教材時，你幾乎只需要做兩件事 —— (1) 放入教材檔案，(2) 在 `catalog.json` 加一筆紀錄。** 首頁與其他程式碼都不必改動。

---

## 一、資料夾結構

```
political-sociology-materials/
├── index.html          首頁（自動讀 catalog.json）
├── catalog.json        ★ 教材目錄（你最常編輯的檔案）
├── .nojekyll           讓 GitHub Pages 原樣輸出檔案
├── assets/
│   ├── style.css       首頁樣式
│   ├── app.js          首頁邏輯（一般不需修改）
│   └── lecture.css     講義頁面共用樣式
├── lectures/
│   ├── _TEMPLATE.html  講義模板（複製它來新增講義）
│   ├── intro-political-sociology.html
│   └── sample-chart.html   含 Chart.js 圖表的範例
├── slides/
│   ├── _TEMPLATE.html  投影片模板（reveal.js）
│   └── sample-slides.html
├── downloads/          放 PDF 等可下載檔案
└── images/             放圖片
```

---

## 二、第一次上傳到 GitHub（約 10 分鐘）

### 方法 A：用網頁介面（最簡單，推薦）

1. 登入 GitHub，按右上角 **+ → New repository**。
2. Repository name 填例如 `political-sociology`，設為 **Public**，按 **Create repository**。
3. 在新 repo 頁面按 **uploading an existing file**，把本資料夾內**所有檔案與子資料夾**整個拖進去上傳，按 **Commit changes**。
4. 進入 **Settings → Pages**，Source 選 **Deploy from a branch**，Branch 選 **main / (root)**，按 **Save**。
5. 等一兩分鐘，頁面上方會出現網址：`https://<你的帳號>.github.io/political-sociology/`，即為公開教材網站。

### 方法 B：用 Git 指令

```bash
cd political-sociology-materials
git init
git add .
git commit -m "Initial: 政治社會學教材資料庫"
git branch -M main
git remote add origin https://github.com/<你的帳號>/political-sociology.git
git push -u origin main
```
之後同樣到 **Settings → Pages** 啟用（步驟 4–5）。

> 小提醒：repo 設 Public，GitHub Pages 才能免費對外開放。教材內容請避免放有版權疑慮的他人著作全文。

---

## 三、日常工作流程：新增一份教材

這是你以後最常用的流程，依教材類型擇一：

### 新增「講義」
1. 複製 `lectures/_TEMPLATE.html`，改成新檔名，例如 `lectures/nationalism.html`。
2. 打開它，修改標題、日期與內文。需要圖片就放進 `images/`，用 `../images/檔名` 引用。
3. 在 `catalog.json` 的 `materials` 陣列**最前面**加一筆（記得前一筆結尾補逗號）：
```json
{
  "id": "nationalism",
  "title": "民族主義與國家認同",
  "category": "lecture",
  "topic": "認同政治",
  "date": "2026-03-01",
  "summary": "一句話摘要。",
  "tags": ["民族主義", "認同"],
  "url": "lectures/nationalism.html"
}
```

### 新增「投影片」
複製 `slides/_TEMPLATE.html` → 改名修改 → 在 catalog.json 加一筆，`category` 填 `"slides"`、`url` 指到該檔。

### 新增「圖表/資料」
參考 `lectures/sample-chart.html`（用 Chart.js）。複製、改資料 → catalog.json 加一筆，`category` 填 `"chart"`。

### 新增「下載檔案」（PDF 等）
把檔案放進 `downloads/` → catalog.json 加一筆，`category` 填 `"download"`、`url` 指到該檔（例如 `downloads/week3.pdf`）。

### catalog.json 各欄位說明
| 欄位 | 必填 | 說明 |
|---|---|---|
| `id` | ✓ | 唯一代號（英文、不重複） |
| `title` | ✓ | 顯示標題 |
| `category` | ✓ | `lecture` / `slides` / `chart` / `download` |
| `topic` | | 主題分類，顯示在卡片上 |
| `date` | | `YYYY-MM-DD`，首頁依日期由新到舊排序 |
| `summary` | | 一句話摘要 |
| `tags` | | 標籤陣列，會被搜尋 |
| `url` | ✓ | 檔案相對路徑 |

---

## 四、上傳更新

每次改完，重複上傳即可：

- 網頁介面：到 repo → 拖曳新增/修改的檔案 → Commit。
- Git 指令：
```bash
git add .
git commit -m "新增：民族主義講義"
git push
```
推送後約 1 分鐘，網站會自動更新。

---

## 五、本機預覽（上傳前先看效果）

因為首頁用 `fetch` 讀 catalog.json，直接雙擊開檔可能被瀏覽器擋下。請在資料夾內開一個小伺服器：
```bash
cd political-sociology-materials
python3 -m http.server 8000
```
然後瀏覽器打開 `http://localhost:8000`。

---

## 六、常見維護建議

- **命名一致**：檔名用英文小寫加連字號（如 `state-and-society.html`），避免中文檔名在某些情況出錯。
- **備份**：GitHub 本身即是雲端備份；重大改版前可在本機另存一份。
- **分主題**：教材變多時，可在 `lectures/` 下再開子資料夾（如 `lectures/week01/`），記得 catalog.json 的 `url` 跟著改。
- **驗證連結**：新增後到首頁點一次卡片，確認連結正確。
