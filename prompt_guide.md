# AI Prompt: 製作「Google Sheets 雲端記帳工具」

請根據以下規格製作一個現代、且具備完整功能的「雲端記帳工具」。該工具將使用 Google Sheets 作為資料庫，並透過 Google Identity Services (GSI) 進行身分驗證。

## 1. 專案概述
- **功能**：登入 Google、從試算表讀取分類設定、新增記帳紀錄、依月份篩選顯示總計、支出佔比圖表及明細表格。
- **技術棧**：原生 HTML, 原生 CSS (Vanilla CSS), 原生 JavaScript (ES6+), Google Sheets API v4, Google Identity Services (GSI)。

---

## 2. 視覺風格 (UI/UX)
- **整體風格**：現代深色模式 (Dark Mode)，採用 Glassmorphism (毛玻璃) 質感。
- **配色方案**：
  - 背景：`#0b0f19` (深藍黑) 搭配微弱的放射狀漸層 (`radial-gradient`)。
  - 卡片：`rgba(255,255,255,0.06)`，帶有 `backdrop-filter: blur(10px)` 及 1px 透明邊框。
  - 主色 (Primary)：`#4f7cff` 與 `#3a62da` 的線性漸層。
  - 字體：系統預設字體 + 「Noto Sans TC」。
- **CSS 變數 (Design Tokens)**：
  ```css
  :root {
    --bg: #0b0f19;
    --card: #121a2a;
    --text: #e8eefc;
    --muted: #a9b6d3;
    --line: rgba(255,255,255,0.08);
    --primary: #4f7cff;
    --primary2: #3a62da;
    --danger: #ff5d5d;
  }
  ```
- **佈局**：
  - PC 端：雙欄 Grid 佈局 (`grid-template-columns: 1.1fr 0.9fr`)。
  - 行動端 (`@media max-width: 920px`)：單欄佈局，所有 grid 皆轉為 `1fr`。

---

## 3. HTML 結構要求
- **Header**：標題「記帳工具」及「登入/登出」按鈕。
- **Main (`container grid`)**：
  - **新增記帳卡片 (card)**：包含日期、類型(收入/支出)、分類、付款方式、金額、說明及提交按鈕。
  - **每月概覽卡片 (card)**：月份選擇器、收入/支出/結餘的三格大數字統計 (`stats` grid)、支出分類統計的橫向進度條。
  - **明細表格卡片 (card full)**：跨兩欄、自動滾動的表格，欄位包含：日期、類型、分類、金額、說明、付款方式。
- **Footer**：顯示使用提示。

---

## 4. JavaScript 程式碼結構

`app.js` 使用以下區塊註解風格來組織程式碼，每個區段用相同格式分隔：

```javascript
/* =========================
   區段標題
========================= */
```

### 依序包含以下區段：

---

### 4-1. `你需要填的設定`

程式碼最頂端，宣告 `CONFIG` 物件，集中管理所有需使用者手動填入的設定值：

```javascript
const CONFIG = {
  CLIENT_ID: "",          // Google OAuth2 Client ID
  SPREADSHEET_ID: "",     // Google Sheets 試算表 ID

  SHEET_RECORDS: "記帳記錄",  // 記帳資料的工作表名稱
  SHEET_FIELDS: "欄位表",     // 分類/付款方式設定的工作表名稱

  SCOPES: "https://www.googleapis.com/auth/spreadsheets"
};
```

---

### 4-2. `全域狀態`

管理整個應用程式運行時的狀態變數：

```javascript
let accessToken = "";       // Google OAuth2 Access Token
let tokenClient = null;     // GSI Token Client 實例
let gisReady = false;       // GSI 是否已載入就緒

let fieldOptions = {        // 從「欄位表」讀取的分類與付款方式
  typeToCategories: {},     // { "支出": Set, "收入": Set }
  typeToPayments: {}        // { "支出": Set, "收入": Set }
};

let currentMonth = "";      // 目前選擇的月份 (yyyy-MM)
let records = [];           // 當月的記帳紀錄陣列
```

---

### 4-3. `DOM`

集中宣告所有 DOM 元素的參考，使用簡寫 `$` 選擇器：

```javascript
const $ = (sel) => document.querySelector(sel);

// 按鈕
const btnSignIn  = $("#btnSignIn");
const btnSignOut = $("#btnSignOut");
const btnReload  = $("#btnReload");
const btnRefresh = $("#btnRefresh");
const btnSubmit  = $("#btnSubmit");
const statusEl   = $("#status");

// 表單欄位
const recordForm   = $("#recordForm");
const fDate        = $("#fDate");
const fType        = $("#fType");
const fCategory    = $("#fCategory");
const fPayment     = $("#fPayment");
const fAmount      = $("#fAmount");
const fDescription = $("#fDescription");

// 概覽區
const monthPicker        = $("#monthPicker");
const sumIncome          = $("#sumIncome");
const sumExpense         = $("#sumExpense");
const sumNet             = $("#sumNet");
const categoryBreakdown  = $("#categoryBreakdown");

// 表格
const recordsTbody = $("#recordsTbody");
```

---

### 4-4. `初始化 (DOM 就緒後立即做)`

`<script>` 放在 `</body>` 前，DOM 就緒後立即執行以下初始化呼叫：

```javascript
initDefaults();                           // 填入今天日期與當月
bindEvents();                             // 綁定所有事件
setUiSignedOut();                         // 預設 UI 為未登入狀態
setStatus("等待 Google 登入元件載入中...", false);
```

---

### 4-5. `給 index.html 的 GSI onload 呼叫`

掛載 `window.onGisLoaded` 供 `<script src="https://accounts.google.com/gsi/client" onload="onGisLoaded()">` 呼叫：

- 檢查 `google.accounts.oauth2` 是否存在。
- 呼叫 `google.accounts.oauth2.initTokenClient()` 初始化 Token Client。
- **callback**：處理成功取得 `access_token` 後的流程。
- **error_callback**：處理 popup 被阻擋 (`popup_failed_to_open`)、使用者關閉授權視窗 (`popup_closed`) 等異常。
- 包含 `initDefaults()` 填入今日日期 / 當月。
- 包含 `bindEvents()` 綁定「登入」、「登出」、「類型切換」、「月份變更」、「表單提交」等事件。
- **登入按鈕**使用 `tokenClient.requestAccessToken({ prompt: "" })`，空字串讓 Google 自行判斷是否需要重新授權，**避免 2FA 帳號因 `consent` / `select_account` 強制重跑而卡住**。
- 包含 `resetAll()` 清除所有狀態、DOM 並回到未登入 UI。

---

### 4-6. `UI enable/disable`

兩個函式控制按鈕與元件的 `disabled` 狀態：

- `setUiSignedIn()`：啟用登出 / 重整 / 提交 / 月份選擇器。
- `setUiSignedOut()`：禁用上述元件。

---

### 4-7. `登入後流程`

`afterSignedIn()` async 函式，登入成功後依序：

1. 檢查 `SPREADSHEET_ID` 是否已填。
2. `setUiSignedIn()` 啟用 UI。
3. `await loadFieldTable()` 載入欄位表。
4. `applySelectOptionsForType(fType.value)` 初始化下拉選單。
5. `await reloadMonth()` 載入當月資料。

---

### 4-8. `Google Sheets API helper`

通用的 API 互動工具：

- `apiFetch(url, options)`：自動附加 `Authorization: Bearer {token}` 與 `Content-Type: application/json`，並處理非 200 回應。
- `valuesGetUrl(rangeA1)`：組合 Sheets API v4 的 GET values URL。
- `valuesAppendUrl(rangeA1)`：組合 Sheets API v4 的 Append URL，使用 `valueInputOption=USER_ENTERED`。

---

### 4-9. `讀取 欄位表`

- `loadFieldTable()`：從 `SHEET_FIELDS!A:C` 讀取，Column A = Type, B = Category, C = Payment。
- 若 Type 為空，則該筆分類 / 付款方式視為「收入、支出共用」。
- 若某類型完全沒有分類，預設加入「其他雜項」；沒有付款方式則預設「現金 (Cash)」。
- `applySelectOptionsForType(type)`：依據類型動態填入 `<select>` 的 `<option>`。

---

### 4-10. `讀取 記帳紀錄 並做每月篩選`

- `reloadMonth()`：從 `SHEET_RECORDS!A:G` 讀取全部資料。
- 欄位順序：`[ID, Date, Type, Category, Amount, Description, Payment]`。
- `filterByMonth(items, yyyyMm)`：以 `String(r.Date).startsWith(yyyyMm)` 篩選。
- 篩選後依序呼叫 `renderTable()`、`renderSummary()`、`renderBreakdown()`。

---

### 4-11. `新增一筆`

- `submitRecord()`：驗證表單欄位（日期、類型限定收入/支出、金額非負、說明必填）。
- 生成 `ID = String(Date.now())`。
- 透過 `valuesAppendUrl` 以 `POST { values: [row] }` 寫入。
- 成功後清空金額與說明欄位，並呼叫 `reloadMonth()` 刷新。

---

### 4-12. `UI render`

三個渲染函式：

- `renderTable(items)`：按 Date 排序，生成 `<tr>` 行，空資料顯示「本月尚無資料」。
- `renderSummary(items)`：累加收入 / 支出金額，計算結餘，更新 `.big` 元素。
- `renderBreakdown(items)`：僅統計支出類型，以 `Map` 累加各 Category 金額，取前 12 名，渲染百分比進度條 (`.barRow > .bar > div[style="width:N%"]`)。

---

### 4-13. `Utils`

通用工具函式：

- `setStatus(msg, isError)`：更新狀態列文字與顏色 (`--danger` 或 `--muted`)。
- `formatMoney(n)`：使用 `Number(n).toLocaleString("zh-TW")` 格式化金額。
- `escapeHtml(str)`：替換 `& < > " '` 為 HTML 實體，防止 XSS。

---

## 5. 檔案結構

```
project/
├── index.html    ← 結構 + GSI Script 載入 (onload="onGisLoaded()")
├── styles.css    ← CSS 變數、漸層背景、卡片樣式、響應式斷點
└── app.js        ← 配置、全域狀態、DOM、初始化、GSI、API、渲染、工具
```

---

## 6. Google Sheets 試算表結構

### 工作表一：記帳記錄
| A (ID) | B (Date) | C (Type) | D (Category) | E (Amount) | F (Description) | G (Payment) |
|--------|----------|----------|--------------|------------|-----------------|-------------|
| 1 | 2026-01-01 | 收入 | 居家生活 | 1000 | 生活食品 | 台新銀行卡 |

### 工作表二：欄位表
| A (Type) | B (Category) | C (Payment) |
|----------|-------------|-------------|
| 支出 | 雜項 | 台新信用卡 |
| (空白) | 居家生活 | 現金 |

> Type 留空 = 收入/支出共用該分類與付款方式。

---

## 7. 特殊要求
- **安全性**：實作 `escapeHtml` 處理用戶輸入，防止 XSS。
- **2FA 相容**：`requestAccessToken` 使用 `prompt: ""`，並加入 `error_callback` 處理 popup 異常。
- **狀態回饋**：提供 `#status` 區域顯示「讀取中」、「寫入成功」、「權限異常」等提示。
- **預設值**：頁面載入時自動將日期填入「今天」、月份選擇器填入「當月」。
- **代碼風格**：每段邏輯區塊前使用 `/* ========================= ... ========================= */` 區段註解，保持一致的程式碼組織結構。

---

請根據上述規格，生成完整的三個檔案 (`index.html`, `styles.css`, `app.js`)，確保可直接在 localhost 環境下運行。
