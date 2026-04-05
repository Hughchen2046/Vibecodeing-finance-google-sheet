/* =========================
   德卜希記帳手札 — app.js
   遊戲化上癮式記帳系統
========================= */

/* =========================
   你需要填的設定
========================= */
const CONFIG = {
  CLIENT_ID: "54030448384-r66n4d7tpithogqmckb9hi5gbq2kbrlc.apps.googleusercontent.com",
  SPREADSHEET_ID: "1LaW-jbjCDpJ76I25avmMlFf-70QZQopNFEtHsM24wNo",

  SHEET_USERS:             "users",
  SHEET_TRANSACTIONS:      "transactions",
  SHEET_MISSIONS:          "missions",
  SHEET_MISSION_PROGRESS:  "mission_progress",
  SHEET_ACHIEVEMENTS:      "achievements",
  SHEET_USER_ACHIEVEMENTS: "user_achievements",
  SHEET_GOALS:             "goals",
  SHEET_CARDS:             "cards",
  SHEET_USER_CARDS:        "user_cards",
  SHEET_SETTINGS:          "settings",

  SCOPES: "https://www.googleapis.com/auth/spreadsheets"
};

/* =========================
   全域狀態
========================= */
let accessToken = "";
let tokenClient = null;
let gisReady = false;

let currentUser = null;       // user row object
let userId = "";              // Google email hash
let userEmail = "";

let allTransactions = [];     // all records for this user
let userCards = [];            // card_ids the user owns
let userAchievements = [];     // achievement_ids unlocked
let userGoals = [];            // goal objects
let missionProgress = {};      // { mission_id: { value, completed } }

let todayStr = "";             // yyyy-MM-dd
let selectedType = "支出";
let selectedCategory = "";
let selectedPayment = "";
let cardFlipAvailable = 0;     // how many flips available
let isFlipped = false;

/* =========================
   DOM
========================= */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// Overlays
const loginOverlay   = $("#loginOverlay");
const welcomeOverlay = $("#welcomeOverlay");
const loadingOverlay = $("#loadingOverlay");
const levelUpOverlay = $("#levelUpOverlay");

// Login
const btnSignIn    = $("#btnSignIn");
const loginStatus  = $("#loginStatus");

// Welcome
const welcomeName      = $("#welcomeName");
const btnStartAdventure = $("#btnStartAdventure");

// Header
const appHeader    = $("#appHeader");
const headerName   = $("#headerName");
const headerLevel  = $("#headerLevel");
const xpBarFill    = $("#xpBarFill");
const xpLabel      = $("#xpLabel");
const streakCount  = $("#streakCount");
const btnSignOut   = $("#btnSignOut");

// Main & Nav
const appMain   = $("#appMain");
const bottomNav = $("#bottomNav");

// Dashboard
const greetingMsg      = $("#greetingMsg");
const greetingSubMsg   = $("#greetingSubMsg");
const todayRecordCount = $("#todayRecordCount");
const todayStreak      = $("#todayStreak");
const todayLevel       = $("#todayLevel");
const missionList      = $("#missionList");
const flipEntry        = $("#flipEntry");
const flipEntryText    = $("#flipEntryText");
const recentList       = $("#recentList");
const goalPreviewCard  = $("#goalPreviewCard");
const goalPreview      = $("#goalPreview");

// Record form
const fAmount      = $("#fAmount");
const fNote        = $("#fNote");
const fDate        = $("#fDate");
const categoryGrid = $("#categoryGrid");
const paymentRow   = $("#paymentRow");
const btnSubmit    = $("#btnSubmit");
const typeToggle   = $("#typeToggle");

// Cards
const cardFlipInner  = $("#cardFlipInner");
const flipPrompt     = $("#flipPrompt");
const collectionCount = $("#collectionCount");

// Achievements
const achievementList = $("#achievementList");

// Goals
const goalsList = $("#goalsList");

// Status
const loadingText = $("#loadingText");

/* =========================
   初始化 (DOM 就緒後立即做)
========================= */
(function init() {
  todayStr = getTodayStr();
  fDate.value = todayStr;
  renderCategoryGrid("支出");
  renderPaymentRow();
  bindEvents();
})();

/* =========================
   給 index.html 的 GSI onload 呼叫
========================= */
function onGisLoaded() {
  if (!google?.accounts?.oauth2) {
    loginStatus.textContent = "Google 登入元件載入失敗";
    loginStatus.style.color = "var(--danger)";
    return;
  }

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.CLIENT_ID,
    scope: CONFIG.SCOPES,
    callback: async (resp) => {
      if (resp.error) {
        showToast("登入失敗：" + resp.error, "error");
        return;
      }
      accessToken = resp.access_token;
      await afterSignedIn();
    },
    error_callback: (err) => {
      if (err.type === "popup_failed_to_open") {
        showToast("瀏覽器封鎖了彈出視窗，請允許後重試", "error");
      } else if (err.type === "popup_closed") {
        showToast("授權視窗已關閉", "info");
      }
    }
  });

  gisReady = true;
  btnSignIn.disabled = false;
  loginStatus.textContent = "準備就緒，請點擊登入";
}

/* =========================
   事件綁定
========================= */
function bindEvents() {
  // 登入
  btnSignIn.addEventListener("click", () => {
    if (!gisReady) return;
    tokenClient.requestAccessToken({ prompt: "" });
  });

  // 登出
  btnSignOut.addEventListener("click", () => {
    if (accessToken) {
      google.accounts.oauth2.revoke(accessToken);
    }
    resetAll();
  });

  // 類型切換
  typeToggle.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-type]");
    if (!btn) return;
    typeToggle.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedType = btn.dataset.type;
    selectedCategory = "";
    renderCategoryGrid(selectedType);
  });

  // 提交記帳
  btnSubmit.addEventListener("click", submitRecord);

  // Tab 導航
  bottomNav.addEventListener("click", (e) => {
    const item = e.target.closest(".nav-item");
    if (!item) return;
    switchTab(item.dataset.tab);
  });

  // 翻牌
  $("#cardFlipArea").addEventListener("click", handleCardFlip);

  // 成就 tab 篩選
  $("#achTabs").addEventListener("click", (e) => {
    const tab = e.target.closest(".ach-tab");
    if (!tab) return;
    $$(".ach-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    renderAchievements(tab.dataset.cat);
  });

  // 開始冒險 (新手)
  btnStartAdventure.addEventListener("click", handleStartAdventure);

  // 金額輸入即時驗證
  fAmount.addEventListener("input", () => {
    btnSubmit.disabled = !fAmount.value || Number(fAmount.value) <= 0;
  });
}

/* =========================
   登入後流程
========================= */
async function afterSignedIn() {
  showLoading("正在載入你的冒險資料...");

  try {
    // 取得使用者資訊
    const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(r => r.json());

    userEmail = userInfo.email;
    userId = simpleHash(userEmail);

    // 隱藏登入，顯示 app
    loginOverlay.classList.add("hidden");

    // 從 users sheet 查找使用者
    const userData = await loadUserData();

    if (!userData) {
      // 新使用者 — 顯示歡迎畫面
      hideLoading();
      welcomeOverlay.classList.add("active");
      return;
    }

    // 舊使用者 — 載入所有資料
    currentUser = userData;
    await loadAllData();
    showApp();
    hideLoading();
  } catch (err) {
    hideLoading();
    showToast("載入失敗：" + err.message, "error");
    console.error(err);
  }
}

/* =========================
   新手歡迎流程
========================= */
async function handleStartAdventure() {
  const name = welcomeName.value.trim();
  if (!name) {
    welcomeName.style.borderColor = "var(--danger)";
    welcomeName.style.animation = "shake 0.3s";
    setTimeout(() => { welcomeName.style.animation = ""; }, 300);
    return;
  }

  showLoading("正在建立你的冒險檔案...");
  welcomeOverlay.classList.remove("active");

  try {
    const now = new Date().toISOString();
    const newUser = {
      user_id: userId,
      display_name: name,
      avatar_type: "default",
      level: 1,
      exp: 0,
      streak_current: 0,
      streak_best: 0,
      last_checkin_date: "",
      total_logged_days: 0,
      flip_available: 0,
      created_at: now,
      updated_at: now
    };

    await appendRow(CONFIG.SHEET_USERS, [
      newUser.user_id, newUser.display_name, newUser.avatar_type,
      newUser.level, newUser.exp, newUser.streak_current, newUser.streak_best,
      newUser.last_checkin_date, newUser.total_logged_days, newUser.flip_available,
      newUser.created_at, newUser.updated_at
    ]);

    currentUser = newUser;
    await loadAllData();
    showApp();
    hideLoading();

    // 首次成就
    showToast("🎉 歡迎加入，" + name + "！你的財務冒險開始了！", "success");
    triggerConfetti();
  } catch (err) {
    hideLoading();
    showToast("建立失敗：" + err.message, "error");
  }
}

/* =========================
   載入所有資料
========================= */
async function loadAllData() {
  await Promise.all([
    loadTransactions(),
    loadUserCards(),
    loadUserAchievements(),
    loadGoals(),
    loadMissionProgress()
  ]);

  // 處理 streak
  processStreak();
  // 更新翻牌狀態
  cardFlipAvailable = Number(currentUser.flip_available) || 0;
}

/* =========================
   UI enable/disable
========================= */
function showApp() {
  appHeader.classList.remove("hidden");
  appMain.classList.remove("hidden");
  bottomNav.classList.remove("hidden");
  btnSubmit.disabled = false;

  updateHeaderUI();
  updateGreeting();
  renderDashboard();
  renderMissions();
  renderAchievements("all");
  renderGoalsList();
  updateFlipUI();
}

function resetAll() {
  accessToken = "";
  currentUser = null;
  userId = "";
  allTransactions = [];
  userCards = [];
  userAchievements = [];
  userGoals = [];
  missionProgress = {};
  cardFlipAvailable = 0;
  isFlipped = false;

  appHeader.classList.add("hidden");
  appMain.classList.add("hidden");
  bottomNav.classList.add("hidden");
  loginOverlay.classList.remove("hidden");
  welcomeOverlay.classList.remove("active");
  loginStatus.textContent = "已登出，請重新登入";

  // Reset card flip
  cardFlipInner.classList.remove("flipped");

  // Reset tab
  switchTab("home");
}

/* =========================
   Google Sheets API helper
========================= */
async function apiFetch(url, options = {}) {
  const defaults = {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  };
  const resp = await fetch(url, { ...defaults, ...options });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`API ${resp.status}: ${errText}`);
  }
  return resp.json();
}

function valuesGetUrl(rangeA1) {
  return `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${encodeURIComponent(rangeA1)}`;
}

function valuesAppendUrl(rangeA1) {
  return `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${encodeURIComponent(rangeA1)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
}

function valuesUpdateUrl(rangeA1) {
  return `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${encodeURIComponent(rangeA1)}?valueInputOption=USER_ENTERED`;
}

async function appendRow(sheetName, row) {
  return apiFetch(valuesAppendUrl(sheetName + "!A:Z"), {
    method: "POST",
    body: JSON.stringify({ values: [row] })
  });
}

async function getSheetData(rangeA1) {
  const data = await apiFetch(valuesGetUrl(rangeA1));
  return data.values || [];
}

/* =========================
   讀取 使用者
========================= */
async function loadUserData() {
  try {
    const rows = await getSheetData(CONFIG.SHEET_USERS + "!A:L");
    if (rows.length <= 1) return null; // only header

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (r[0] === userId) {
        return {
          _rowIndex: i + 1, // 1-based row in sheet
          user_id: r[0],
          display_name: r[1] || "冒險者",
          avatar_type: r[2] || "default",
          level: Number(r[3]) || 1,
          exp: Number(r[4]) || 0,
          streak_current: Number(r[5]) || 0,
          streak_best: Number(r[6]) || 0,
          last_checkin_date: r[7] || "",
          total_logged_days: Number(r[8]) || 0,
          flip_available: Number(r[9]) || 0,
          created_at: r[10] || "",
          updated_at: r[11] || ""
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function saveUserData() {
  if (!currentUser || !currentUser._rowIndex) return;
  const row = currentUser._rowIndex;
  const range = `${CONFIG.SHEET_USERS}!A${row}:L${row}`;
  currentUser.updated_at = new Date().toISOString();
  await apiFetch(valuesUpdateUrl(range), {
    method: "PUT",
    body: JSON.stringify({
      values: [[
        currentUser.user_id, currentUser.display_name, currentUser.avatar_type,
        currentUser.level, currentUser.exp, currentUser.streak_current,
        currentUser.streak_best, currentUser.last_checkin_date,
        currentUser.total_logged_days, currentUser.flip_available,
        currentUser.created_at, currentUser.updated_at
      ]]
    })
  });
}

/* =========================
   讀取 記帳紀錄
========================= */
async function loadTransactions() {
  try {
    const rows = await getSheetData(CONFIG.SHEET_TRANSACTIONS + "!A:I");
    allTransactions = [];
    if (rows.length <= 1) return;

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (r[1] === userId) {
        allTransactions.push({
          transaction_id: r[0],
          user_id: r[1],
          date: r[2],
          type: r[3],
          category: r[4],
          amount: Number(r[5]) || 0,
          payment_method: r[6] || "",
          note: r[7] || "",
          created_at: r[8] || ""
        });
      }
    }
    allTransactions.sort((a, b) => b.date.localeCompare(a.date));
  } catch (err) {
    console.error("loadTransactions:", err);
  }
}

/* =========================
   讀取 使用者卡牌
========================= */
async function loadUserCards() {
  try {
    const rows = await getSheetData(CONFIG.SHEET_USER_CARDS + "!A:E");
    userCards = [];
    if (rows.length <= 1) return;

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (r[1] === userId) {
        userCards.push({
          card_id: Number(r[2]),
          obtained_at: r[3] || "",
          source_type: r[4] || ""
        });
      }
    }
  } catch (err) {
    console.error("loadUserCards:", err);
  }
}

/* =========================
   讀取 使用者成就
========================= */
async function loadUserAchievements() {
  try {
    const rows = await getSheetData(CONFIG.SHEET_USER_ACHIEVEMENTS + "!A:D");
    userAchievements = [];
    if (rows.length <= 1) return;

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (r[1] === userId) {
        userAchievements.push({
          achievement_id: r[2],
          unlocked_at: r[3] || ""
        });
      }
    }
  } catch (err) {
    console.error("loadUserAchievements:", err);
  }
}

/* =========================
   讀取 儲蓄目標
========================= */
async function loadGoals() {
  try {
    const rows = await getSheetData(CONFIG.SHEET_GOALS + "!A:J");
    userGoals = [];
    if (rows.length <= 1) return;

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (r[1] === userId) {
        userGoals.push({
          _rowIndex: i + 1,
          goal_id: r[0],
          user_id: r[1],
          goal_name: r[2] || "",
          target_amount: Number(r[3]) || 0,
          current_amount: Number(r[4]) || 0,
          start_date: r[5] || "",
          end_date: r[6] || "",
          status: r[7] || "active",
          created_at: r[8] || "",
          updated_at: r[9] || ""
        });
      }
    }
  } catch (err) {
    console.error("loadGoals:", err);
  }
}

/* =========================
   讀取 任務進度
========================= */
async function loadMissionProgress() {
  try {
    const cycleKey = todayStr; // daily missions keyed by date
    const rows = await getSheetData(CONFIG.SHEET_MISSION_PROGRESS + "!A:G");
    missionProgress = {};
    if (rows.length <= 1) return;

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (r[1] === userId && r[6] === cycleKey) {
        missionProgress[r[2]] = {
          _rowIndex: i + 1,
          progress_value: Number(r[3]) || 0,
          completed_flag: r[4] === "TRUE" || r[4] === "true" || r[4] === "1",
          completed_at: r[5] || ""
        };
      }
    }
  } catch (err) {
    console.error("loadMissionProgress:", err);
  }
}

/* =========================
   Streak 系統
========================= */
function processStreak() {
  if (!currentUser) return;

  const lastDate = currentUser.last_checkin_date;
  const yesterday = getDateStr(-1);

  if (lastDate === todayStr) {
    // 已打卡
  } else if (lastDate === yesterday) {
    // 可繼續 streak — 但還沒打今天
  } else if (lastDate && lastDate !== todayStr && lastDate !== yesterday) {
    // Streak 中斷
    if (currentUser.streak_current > currentUser.streak_best) {
      currentUser.streak_best = currentUser.streak_current;
    }
    currentUser.streak_current = 0;
    saveUserData();
  }
}

async function recordDailyCheckin() {
  if (!currentUser) return;
  if (currentUser.last_checkin_date === todayStr) return; // already checked in

  const yesterday = getDateStr(-1);
  if (currentUser.last_checkin_date === yesterday) {
    currentUser.streak_current += 1;
  } else {
    currentUser.streak_current = 1;
  }

  if (currentUser.streak_current > currentUser.streak_best) {
    currentUser.streak_best = currentUser.streak_current;
  }

  currentUser.last_checkin_date = todayStr;
  currentUser.total_logged_days += 1;

  // 檢查 streak 里程碑
  for (const ms of STREAK_MILESTONES) {
    if (currentUser.streak_current === ms.days) {
      showToast(`🔥 ${ms.label}！連續記帳 ${ms.days} 天！${ms.reward}`, "achievement");
      await addExp(ms.exp);
      if (ms.cardDraw > 0) {
        currentUser.flip_available = (currentUser.flip_available || 0) + ms.cardDraw;
      }
    }
  }

  // 檢查 streak 相關成就
  checkAchievements();

  await saveUserData();
  updateHeaderUI();
}

/* =========================
   經驗值與等級系統
========================= */
async function addExp(amount) {
  if (!currentUser) return;

  currentUser.exp += amount;

  // 顯示 XP 浮動
  showXpFloat(`+${amount} EXP`);

  // 檢查升級
  let leveledUp = false;
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (currentUser.exp >= LEVEL_CONFIG[i].requiredExp && currentUser.level < LEVEL_CONFIG[i].level) {
      currentUser.level = LEVEL_CONFIG[i].level;
      leveledUp = true;
    }
  }

  if (leveledUp) {
    const lvInfo = LEVEL_CONFIG.find(l => l.level === currentUser.level);
    showLevelUp(currentUser.level, lvInfo ? lvInfo.title : "");
    triggerConfetti();
    checkAchievements();
  }

  updateHeaderUI();
  await saveUserData();
}

/* =========================
   記帳系統 — 新增一筆
========================= */
async function submitRecord() {
  const amount = Number(fAmount.value);
  const note = fNote.value.trim();
  const date = fDate.value;

  // 驗證
  if (!amount || amount <= 0) {
    showToast("請輸入金額", "error");
    return;
  }
  if (!selectedCategory) {
    showToast("請選擇分類", "error");
    return;
  }
  if (!selectedPayment) {
    // 預設第一個
    selectedPayment = DEFAULT_PAYMENTS[0].name;
  }
  if (!date) {
    showToast("請選擇日期", "error");
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.textContent = "記錄中...";

  try {
    const txId = String(Date.now());
    const now = new Date().toISOString();

    await appendRow(CONFIG.SHEET_TRANSACTIONS, [
      txId, userId, date, selectedType, selectedCategory,
      amount, selectedPayment, escapeForSheet(note), now
    ]);

    // 加入本地記錄
    const newTx = {
      transaction_id: txId,
      user_id: userId,
      date: date,
      type: selectedType,
      category: selectedCategory,
      amount: amount,
      payment_method: selectedPayment,
      note: note,
      created_at: now
    };
    allTransactions.unshift(newTx);

    // 經驗值
    const todayTxs = allTransactions.filter(t => t.date === todayStr);
    const isFirstToday = todayTxs.length === 1;
    let totalExp = EXP_REWARDS.RECORD_ENTRY;
    if (isFirstToday) {
      totalExp += EXP_REWARDS.FIRST_DAILY_RECORD;
      // 解鎖翻牌
      currentUser.flip_available = (currentUser.flip_available || 0) + 1;
      cardFlipAvailable = currentUser.flip_available;
      updateFlipUI();
    }
    await addExp(totalExp);

    // 每日打卡
    await recordDailyCheckin();

    // 更新任務進度
    await updateMissionProgress("daily_record_1", 1);
    if (note) {
      await updateMissionProgress("daily_note", 1);
    }

    // 檢查成就
    checkAchievements();

    // 成功回饋
    showToast(`✨ 記帳成功！+${totalExp} EXP`, "success");
    triggerConfetti();

    // 重置表單
    fAmount.value = "";
    fNote.value = "";
    selectedCategory = "";
    renderCategoryGrid(selectedType);
    btnSubmit.disabled = true;

    // 刷新 UI
    renderDashboard();
    renderMissions();
    updateHeaderUI();
  } catch (err) {
    showToast("記帳失敗：" + err.message, "error");
    console.error(err);
  } finally {
    btnSubmit.textContent = "新增記帳 ✨";
  }
}

/* =========================
   任務系統
========================= */
async function updateMissionProgress(missionId, incrementValue) {
  const mission = DAILY_MISSIONS.find(m => m.id === missionId);
  if (!mission) return;

  let prog = missionProgress[missionId];
  if (!prog) {
    // 新建進度
    const progId = String(Date.now());
    await appendRow(CONFIG.SHEET_MISSION_PROGRESS, [
      progId, userId, missionId, incrementValue,
      incrementValue >= mission.targetValue ? "TRUE" : "FALSE",
      incrementValue >= mission.targetValue ? new Date().toISOString() : "",
      todayStr
    ]);
    prog = {
      _rowIndex: null,
      progress_value: incrementValue,
      completed_flag: incrementValue >= mission.targetValue,
      completed_at: incrementValue >= mission.targetValue ? new Date().toISOString() : ""
    };
    missionProgress[missionId] = prog;
  } else {
    if (prog.completed_flag) return; // 已完成
    prog.progress_value += incrementValue;
    if (prog.progress_value >= mission.targetValue) {
      prog.completed_flag = true;
      prog.completed_at = new Date().toISOString();
    }
    // 更新 sheet
    if (prog._rowIndex) {
      const range = `${CONFIG.SHEET_MISSION_PROGRESS}!D${prog._rowIndex}:F${prog._rowIndex}`;
      await apiFetch(valuesUpdateUrl(range), {
        method: "PUT",
        body: JSON.stringify({
          values: [[prog.progress_value, prog.completed_flag ? "TRUE" : "FALSE", prog.completed_at]]
        })
      });
    }
  }

  // 任務完成獎勵
  if (prog.completed_flag) {
    showToast(`📋 任務完成：${mission.title}！+${mission.rewardExp} EXP`, "achievement");
    await addExp(mission.rewardExp);
    if (mission.rewardCardDraw > 0) {
      currentUser.flip_available = (currentUser.flip_available || 0) + mission.rewardCardDraw;
      cardFlipAvailable = currentUser.flip_available;
      updateFlipUI();
      await saveUserData();
    }
  }

  renderMissions();
}

/* =========================
   翻牌系統
========================= */
async function handleCardFlip() {
  if (isFlipped) {
    // 重置翻牌
    cardFlipInner.classList.remove("flipped");
    isFlipped = false;
    updateFlipUI();
    return;
  }

  if (cardFlipAvailable <= 0) {
    showToast("今天的翻牌機會已用完～記帳可解鎖更多喔！", "info");
    return;
  }

  // 抽卡
  const card = drawRandomCard();

  // 顯示卡面
  const rarityInfo = RARITY_INFO[card.rarity];
  $("#cardRarityBar").style.background = rarityInfo.color;
  $("#cardIconBig").textContent = card.icon;
  $("#cardName").textContent = card.name;
  $("#cardName").style.color = card.color;
  $("#cardRarityLabel").textContent = rarityInfo.label;
  $("#cardRarityLabel").style.background = rarityInfo.color + "20";
  $("#cardRarityLabel").style.color = rarityInfo.color;
  $("#cardMsgShort").textContent = card.messageShort;
  $("#cardMsgFinance").textContent = card.messageFinance;

  // 設定 glow 效果
  const frontFace = $(".card-front");
  frontFace.className = "card-face card-front glow-" + card.rarity;

  // 翻牌
  cardFlipInner.classList.add("flipped");
  isFlipped = true;

  // 扣除翻牌次數
  cardFlipAvailable -= 1;
  currentUser.flip_available = cardFlipAvailable;
  await saveUserData();

  // 紀錄到 user_cards
  const isNew = !userCards.find(uc => uc.card_id === card.id);
  await appendRow(CONFIG.SHEET_USER_CARDS, [
    String(Date.now()), userId, card.id, new Date().toISOString(), "daily_flip"
  ]);
  userCards.push({ card_id: card.id, obtained_at: new Date().toISOString(), source_type: "daily_flip" });

  // 通知
  if (card.rarity === "legendary") {
    showToast(`👑 傳說卡降臨！「${card.name}」！`, "achievement");
    triggerConfetti();
  } else if (card.rarity === "rare") {
    showToast(`💜 獲得稀有卡「${card.name}」！`, "achievement");
  } else {
    showToast(`🃏 獲得「${card.name}」`, "info");
  }

  if (isNew) {
    showToast("✨ 新卡入手！", "success");
  }

  // 檢查收藏成就
  checkAchievements();
  updateFlipUI();
  updateHeaderUI();
  collectionCount.textContent = getUniqueCardCount();
}

function drawRandomCard() {
  // 加權隨機
  const totalWeight = RARITY_WEIGHTS.common + RARITY_WEIGHTS.rare + RARITY_WEIGHTS.legendary;
  let roll = Math.random() * totalWeight;
  let targetRarity;

  if (roll < RARITY_WEIGHTS.common) {
    targetRarity = "common";
  } else if (roll < RARITY_WEIGHTS.common + RARITY_WEIGHTS.rare) {
    targetRarity = "rare";
  } else {
    targetRarity = "legendary";
  }

  const pool = CARDS_DATA.filter(c => c.rarity === targetRarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

function getUniqueCardCount() {
  return new Set(userCards.map(uc => uc.card_id)).size;
}

function updateFlipUI() {
  const avail = cardFlipAvailable;
  if (avail > 0) {
    flipEntry.classList.remove("disabled");
    flipEntryText.textContent = `有 ${avail} 次翻牌機會！`;
    flipPrompt.textContent = "點擊卡牌翻開命運的指引";
    flipPrompt.classList.remove("disabled");
  } else {
    flipEntry.classList.add("disabled");
    flipEntryText.textContent = "完成記帳後解鎖翻牌機會";
    if (!isFlipped) {
      flipPrompt.textContent = "今天的翻牌機會已用完";
      flipPrompt.classList.add("disabled");
    }
  }
  collectionCount.textContent = getUniqueCardCount();
}

/* =========================
   儲蓄目標系統
========================= */
function openGoalModal() {
  const modal = $("#goalModal");
  modal.classList.add("active");
  $("#goalEndDate").value = "";
  $("#goalName").value = "";
  $("#goalAmount").value = "";
  $("#goalCurrent").value = "0";
}

async function submitGoal() {
  const name = $("#goalName").value.trim();
  const amount = Number($("#goalAmount").value);
  const current = Number($("#goalCurrent").value) || 0;
  const endDate = $("#goalEndDate").value;

  if (!name) { showToast("請輸入目標名稱", "error"); return; }
  if (!amount || amount <= 0) { showToast("請輸入目標金額", "error"); return; }

  try {
    const now = new Date().toISOString();
    const goalId = String(Date.now());
    await appendRow(CONFIG.SHEET_GOALS, [
      goalId, userId, name, amount, current, todayStr,
      endDate || "", "active", now, now
    ]);

    userGoals.push({
      goal_id: goalId,
      user_id: userId,
      goal_name: name,
      target_amount: amount,
      current_amount: current,
      start_date: todayStr,
      end_date: endDate,
      status: "active",
      created_at: now,
      updated_at: now
    });

    closeModal("goalModal");
    renderGoalsList();
    renderDashboard();
    showToast("🎯 儲蓄目標已建立！", "success");
  } catch (err) {
    showToast("建立目標失敗：" + err.message, "error");
  }
}

/* =========================
   成就系統
========================= */
async function checkAchievements() {
  if (!currentUser) return;

  const unlockedIds = new Set(userAchievements.map(a => a.achievement_id));
  const totalRecords = allTransactions.length;
  const todayRecords = allTransactions.filter(t => t.date === todayStr).length;
  const uniqueCards = getUniqueCardCount();
  const hasRare = userCards.some(uc => {
    const c = CARDS_DATA.find(cd => cd.id === uc.card_id);
    return c && c.rarity === "rare";
  });
  const hasLegendary = userCards.some(uc => {
    const c = CARDS_DATA.find(cd => cd.id === uc.card_id);
    return c && c.rarity === "legendary";
  });
  const completedGoals = userGoals.filter(g => g.status === "completed").length;

  for (const ach of ACHIEVEMENTS_DATA) {
    if (unlockedIds.has(ach.id)) continue;

    let unlocked = false;
    const cond = ach.condition;

    switch (cond.type) {
      case "total_records":
        unlocked = totalRecords >= cond.value;
        break;
      case "streak":
        unlocked = currentUser.streak_current >= cond.value;
        break;
      case "daily_records":
        unlocked = todayRecords >= cond.value;
        break;
      case "total_savings":
        const totalIncome = allTransactions.filter(t => t.type === "收入").reduce((s, t) => s + t.amount, 0);
        const totalExpense = allTransactions.filter(t => t.type === "支出").reduce((s, t) => s + t.amount, 0);
        unlocked = (totalIncome - totalExpense) >= cond.value;
        break;
      case "goals_completed":
        unlocked = completedGoals >= cond.value;
        break;
      case "level":
        unlocked = currentUser.level >= cond.value;
        break;
      case "unique_cards":
        unlocked = uniqueCards >= cond.value;
        break;
      case "has_rare":
        unlocked = hasRare;
        break;
      case "has_legendary":
        unlocked = hasLegendary;
        break;
    }

    if (unlocked) {
      await unlockAchievement(ach);
    }
  }
}

async function unlockAchievement(ach) {
  const now = new Date().toISOString();
  try {
    await appendRow(CONFIG.SHEET_USER_ACHIEVEMENTS, [
      String(Date.now()), userId, ach.id, now
    ]);
    userAchievements.push({ achievement_id: ach.id, unlocked_at: now });
    showToast(`🏆 成就解鎖：${ach.icon} ${ach.title}！`, "achievement");
    await addExp(ach.rewardExp);
    renderAchievements($$(".ach-tab.active")[0]?.dataset.cat || "all");
  } catch (err) {
    console.error("unlockAchievement:", err);
  }
}

/* =========================
   儀表板渲染
========================= */
function renderDashboard() {
  // 今日狀態
  const todayTxs = allTransactions.filter(t => t.date === todayStr);
  todayRecordCount.textContent = todayTxs.length;
  todayStreak.textContent = currentUser?.streak_current || 0;
  todayLevel.textContent = currentUser?.level || 1;

  // 最近記錄 (最多 5 筆)
  const recent = allTransactions.slice(0, 5);
  if (recent.length === 0) {
    recentList.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><p>尚無記錄，來新增第一筆吧！</p></div>`;
  } else {
    recentList.innerHTML = recent.map(tx => {
      const catInfo = findCategoryInfo(tx.type, tx.category);
      const isExpense = tx.type === "支出";
      return `<div class="recent-item">
        <div class="recent-cat-icon ${isExpense ? 'expense' : 'income'}">${catInfo.icon}</div>
        <div class="recent-info">
          <div class="recent-category">${escapeHtml(tx.category)}</div>
          <div class="recent-note">${tx.note ? escapeHtml(tx.note) : tx.date}</div>
        </div>
        <div class="recent-amount ${isExpense ? 'expense' : 'income'}">${isExpense ? '-' : '+'}$${formatMoney(tx.amount)}</div>
      </div>`;
    }).join("");
  }

  // 儲蓄進度
  const activeGoals = userGoals.filter(g => g.status === "active");
  if (activeGoals.length > 0) {
    goalPreviewCard.style.display = "";
    const g = activeGoals[0];
    const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
    goalPreview.innerHTML = `
      <div style="font-weight:600;margin-bottom:8px;">${escapeHtml(g.goal_name)}</div>
      <div class="goal-progress-wrap"><div class="goal-progress-fill" style="width:${pct}%"></div></div>
      <div class="goal-amounts"><span class="current">$${formatMoney(g.current_amount)}</span><span>/ $${formatMoney(g.target_amount)} (${pct}%)</span></div>
    `;
  } else {
    goalPreviewCard.style.display = "none";
  }
}

/* =========================
   任務渲染
========================= */
function renderMissions() {
  missionList.innerHTML = DAILY_MISSIONS.map(m => {
    const prog = missionProgress[m.id];
    const completed = prog?.completed_flag || false;
    const value = prog?.progress_value || 0;
    return `<div class="mission-item ${completed ? 'completed' : ''}">
      <div class="mission-icon">${m.icon}</div>
      <div class="mission-info">
        <div class="mission-title">${m.title}</div>
        <div class="mission-desc">${m.description}</div>
        <div class="mission-reward">+${m.rewardExp} EXP${m.rewardCardDraw ? ' & 翻牌 ×' + m.rewardCardDraw : ''}</div>
      </div>
      <div class="mission-check">${completed ? '✓' : ''}</div>
    </div>`;
  }).join("");
}

/* =========================
   成就渲染
========================= */
function renderAchievements(category) {
  const unlockedIds = new Set(userAchievements.map(a => a.achievement_id));
  let list = ACHIEVEMENTS_DATA;
  if (category !== "all") {
    list = list.filter(a => a.category === category);
  }

  achievementList.innerHTML = list.map(ach => {
    const unlocked = unlockedIds.has(ach.id);
    const ua = userAchievements.find(a => a.achievement_id === ach.id);
    return `<div class="achievement-item ${unlocked ? '' : 'locked'}">
      <div class="ach-icon">${ach.icon}</div>
      <div class="ach-info">
        <div class="ach-title">${ach.title}</div>
        <div class="ach-desc">${ach.description}</div>
        ${unlocked && ua ? `<div class="ach-unlock-date">✨ ${formatDate(ua.unlocked_at)}</div>` : ''}
      </div>
    </div>`;
  }).join("");
}

/* =========================
   目標渲染
========================= */
function renderGoalsList() {
  if (userGoals.length === 0) {
    goalsList.innerHTML = `<div class="empty-state"><div class="empty-icon">🎯</div><p>還沒有儲蓄目標，來建立第一個吧！</p></div>`;
    return;
  }

  goalsList.innerHTML = userGoals.map(g => {
    const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
    const isComplete = g.status === "completed";
    return `<div class="goal-card">
      <div class="goal-header">
        <div class="goal-name">${escapeHtml(g.goal_name)}</div>
        <div class="goal-status ${isComplete ? 'completed' : 'active'}">${isComplete ? '已達成 🎉' : '進行中'}</div>
      </div>
      <div class="goal-progress-wrap"><div class="goal-progress-fill" style="width:${pct}%"></div></div>
      <div class="goal-amounts">
        <span class="current">$${formatMoney(g.current_amount)}</span>
        <span>/ $${formatMoney(g.target_amount)} (${pct}%)</span>
      </div>
      ${g.end_date ? `<div class="goal-dates"><span>開始：${g.start_date}</span><span>截止：${g.end_date}</span></div>` : ''}
    </div>`;
  }).join("");
}

/* =========================
   記帳頁 UI 渲染
========================= */
function renderCategoryGrid(type) {
  const cats = DEFAULT_CATEGORIES[type] || [];
  categoryGrid.innerHTML = cats.map(c => {
    const isActive = selectedCategory === c.name;
    return `<button class="category-btn ${isActive ? 'active' : ''}" onclick="selectCategory('${escapeHtml(c.name)}')">
      <span class="cat-icon">${c.icon}</span>
      <span class="cat-name">${c.name}</span>
    </button>`;
  }).join("");
}

function selectCategory(name) {
  selectedCategory = name;
  renderCategoryGrid(selectedType);
}

function renderPaymentRow() {
  paymentRow.innerHTML = DEFAULT_PAYMENTS.map((p, i) => {
    const isActive = selectedPayment === p.name || (i === 0 && !selectedPayment);
    if (i === 0 && !selectedPayment) selectedPayment = p.name;
    return `<button class="payment-btn ${isActive ? 'active' : ''}" onclick="selectPayment('${p.name}')">
      ${p.icon} ${p.name}
    </button>`;
  }).join("");
}

function selectPayment(name) {
  selectedPayment = name;
  renderPaymentRow();
}

/* =========================
   卡冊 Modal
========================= */
function openCollectionModal() {
  const ownedIds = new Set(userCards.map(uc => uc.card_id));
  const grid = $("#collectionGrid");

  grid.innerHTML = CARDS_DATA.map(card => {
    const owned = ownedIds.has(card.id);
    const rarityInfo = RARITY_INFO[card.rarity];
    return `<div class="collection-card ${owned ? 'owned' : 'locked'}" style="${owned ? 'border-color:' + rarityInfo.color : ''}">
      <div class="col-icon">${owned ? card.icon : '❓'}</div>
      <div class="col-name">${owned ? card.name : '???'}</div>
    </div>`;
  }).join("");

  const count = ownedIds.size;
  $("#collectionSummary").textContent = `已收集 ${count} / ${CARDS_DATA.length} 張`;
  $("#collectionModal").classList.add("active");
}

/* =========================
   Tab 導航
========================= */
function switchTab(tabId) {
  $$(".tab-page").forEach(p => p.classList.remove("active"));
  $$(".nav-item").forEach(n => n.classList.remove("active"));

  const page = $(`[data-tab="${tabId}"]`);
  const nav = $(`.nav-item[data-tab="${tabId}"]`);
  if (page) page.classList.add("active");
  if (nav) nav.classList.add("active");

  // 點擊 dashboard tab 觸發回顧任務
  if (tabId === "home") {
    updateMissionProgress("daily_review", 1);
  }
}

function goToFlipTab() {
  if (cardFlipAvailable <= 0) {
    showToast("完成記帳後即可解鎖翻牌機會！", "info");
    return;
  }
  switchTab("cards");
}

/* =========================
   Header UI 更新
========================= */
function updateHeaderUI() {
  if (!currentUser) return;
  headerName.textContent = currentUser.display_name;

  const lvInfo = LEVEL_CONFIG.find(l => l.level === currentUser.level);
  const nextLv = LEVEL_CONFIG.find(l => l.level === currentUser.level + 1);
  headerLevel.textContent = `Lv.${currentUser.level} ${lvInfo ? lvInfo.title : ""}`;

  streakCount.textContent = currentUser.streak_current;

  // XP bar
  if (nextLv) {
    const currentLvExp = lvInfo ? lvInfo.requiredExp : 0;
    const needed = nextLv.requiredExp - currentLvExp;
    const progress = currentUser.exp - currentLvExp;
    const pct = Math.min(100, Math.round((progress / needed) * 100));
    xpBarFill.style.width = pct + "%";
    xpLabel.textContent = `${progress} / ${needed} EXP`;
  } else {
    xpBarFill.style.width = "100%";
    xpLabel.textContent = "MAX";
  }
}

/* =========================
   問候語
========================= */
function updateGreeting() {
  const hour = new Date().getHours();
  let period;
  if (hour >= 5 && hour < 12) period = "morning";
  else if (hour >= 12 && hour < 17) period = "afternoon";
  else if (hour >= 17 && hour < 21) period = "evening";
  else period = "night";

  const greets = GREETINGS[period];
  const msg = greets[Math.floor(Math.random() * greets.length)];
  const name = currentUser?.display_name || "冒險者";

  greetingMsg.textContent = msg.replace("冒險者", name);
  greetingSubMsg.textContent = `${name}，今天也要加油哦！`;
}

/* =========================
   Modal 通用
========================= */
function closeModal(id) {
  const modal = $(`#${id}`);
  if (modal) modal.classList.remove("active");
}

// 點擊背景關閉 modal
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active");
  }
});

/* =========================
   Level Up Overlay
========================= */
function showLevelUp(level, title) {
  const lvInfo = LEVEL_CONFIG.find(l => l.level === level);
  $("#levelUpTitle").textContent = `Lv.${level} 達成！`;
  $("#levelUpSubtitle").textContent = `${lvInfo ? lvInfo.icon : '🌟'} ${title}`;
  levelUpOverlay.classList.add("active");
}

function closeLevelUp() {
  levelUpOverlay.classList.remove("active");
}

/* =========================
   Toast 系統
========================= */
function showToast(msg, type = "info") {
  const container = $("#toastContainer");
  const icons = {
    success: "✅", error: "❌", info: "ℹ️", achievement: "🏆", levelup: "⬆️"
  };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || "ℹ️"}</span><span class="toast-msg">${escapeHtml(msg)}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* =========================
   XP Float
========================= */
function showXpFloat(text) {
  const el = document.createElement("div");
  el.className = "xp-float";
  el.textContent = text;
  el.style.left = (window.innerWidth / 2 - 40) + "px";
  el.style.top = (window.innerHeight / 2) + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

/* =========================
   Confetti
========================= */
function triggerConfetti() {
  const container = $("#confettiContainer");
  const colors = ["#FF9A76", "#F0C75E", "#95C9A8", "#8E7CC3", "#7EC8E3", "#F5C6D0", "#FFD700"];
  for (let i = 0; i < 30; i++) {
    const conf = document.createElement("div");
    conf.className = "confetti";
    conf.style.left = Math.random() * 100 + "%";
    conf.style.top = "-10px";
    conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    conf.style.width = (Math.random() * 8 + 4) + "px";
    conf.style.height = (Math.random() * 8 + 4) + "px";
    conf.style.animationDelay = Math.random() * 0.5 + "s";
    conf.style.animationDuration = (Math.random() * 1 + 1.5) + "s";
    container.appendChild(conf);
  }
  setTimeout(() => { container.innerHTML = ""; }, 3000);
}

/* =========================
   Loading
========================= */
function showLoading(text) {
  loadingText.textContent = text || "載入中...";
  loadingOverlay.classList.add("active");
}

function hideLoading() {
  loadingOverlay.classList.remove("active");
}

/* =========================
   Utils
========================= */
function getTodayStr() {
  const d = new Date();
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

function getDateStr(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

function formatMoney(n) {
  return Number(n).toLocaleString("zh-TW");
}

function formatDate(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return isoStr;
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeForSheet(str) {
  // Prevent formula injection
  if (!str) return "";
  if (/^[=+\-@]/.test(str)) return "'" + str;
  return str;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash |= 0;
  }
  return "u" + Math.abs(hash).toString(36);
}

function findCategoryInfo(type, categoryName) {
  const cats = DEFAULT_CATEGORIES[type] || DEFAULT_CATEGORIES["支出"];
  const found = cats.find(c => c.name === categoryName);
  return found || { name: categoryName, icon: "📦" };
}
