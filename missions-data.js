/* =========================
   任務 / 成就 / 等級 定義資料
========================= */

/* ── 等級定義 ── */
const LEVEL_CONFIG = [
  { level: 1,  title: "理財初心者",       requiredExp: 0,    icon: "🌱" },
  { level: 2,  title: "穩定記錄者",       requiredExp: 100,  icon: "📝" },
  { level: 3,  title: "預算守門員",       requiredExp: 250,  icon: "🛡️" },
  { level: 4,  title: "儲蓄實踐者",       requiredExp: 500,  icon: "💰" },
  { level: 5,  title: "現金流掌控者",     requiredExp: 850,  icon: "💎" },
  { level: 6,  title: "財務修行者",       requiredExp: 1300, icon: "🧘" },
  { level: 7,  title: "目標達成王",       requiredExp: 1900, icon: "🏆" },
  { level: 8,  title: "自律財務冒險家",   requiredExp: 2700, icon: "⚔️" },
  { level: 9,  title: "黃金理財師",       requiredExp: 3800, icon: "👑" },
  { level: 10, title: "傳說級財務大師",   requiredExp: 5200, icon: "🌟" }
];

/* ── 經驗值獎勵設定 ── */
const EXP_REWARDS = {
  RECORD_ENTRY:       10,   // 每筆記帳
  FIRST_DAILY_RECORD: 20,   // 每日首次記帳 (bonus)
  DAILY_MISSION:      15,   // 完成每日任務
  WEEKLY_MISSION:     50,   // 完成每週任務
  STREAK_MILESTONE:   30,   // Streak 里程碑
  ACHIEVEMENT_UNLOCK: 50,   // 解鎖成就
  GOAL_MILESTONE:     100,  // 儲蓄目標里程碑
};

/* ── 每日任務模板 ── */
const DAILY_MISSIONS = [
  {
    id: "daily_record_1",
    missionType: "daily",
    title: "今日記帳",
    description: "完成 1 筆記帳紀錄",
    targetValue: 1,
    rewardExp: 20,
    rewardCardDraw: 1,
    icon: "📝",
    checkType: "record_count"
  },
  {
    id: "daily_note",
    missionType: "daily",
    title: "用心記錄",
    description: "為一筆記帳填寫備註",
    targetValue: 1,
    rewardExp: 10,
    rewardCardDraw: 0,
    icon: "✏️",
    checkType: "has_note"
  },
  {
    id: "daily_review",
    missionType: "daily",
    title: "今日回顧",
    description: "查看儀表板上的支出狀況",
    targetValue: 1,
    rewardExp: 10,
    rewardCardDraw: 0,
    icon: "👀",
    checkType: "view_dashboard"
  }
];

/* ── Streak 里程碑 ── */
const STREAK_MILESTONES = [
  { days: 3,  reward: "經驗值 +30",  exp: 30,  cardDraw: 0, label: "三日之火" },
  { days: 7,  reward: "經驗值 +50 & 翻牌 ×1",  exp: 50,  cardDraw: 1, label: "一週燃燒" },
  { days: 14, reward: "經驗值 +80 & 翻牌 ×2",  exp: 80,  cardDraw: 2, label: "雙週不滅" },
  { days: 30, reward: "經驗值 +150 & 翻牌 ×3", exp: 150, cardDraw: 3, label: "月之守護" },
  { days: 60, reward: "經驗值 +300 & 翻牌 ×5", exp: 300, cardDraw: 5, label: "雙月傳說" },
  { days: 100,reward: "經驗值 +500 & 翻牌 ×8", exp: 500, cardDraw: 8, label: "百日修行" }
];

/* ── 成就定義 ── */
const ACHIEVEMENTS_DATA = [
  /* 行為型成就 */
  {
    id: "ach_first_record",
    category: "行為型",
    title: "初心者的第一步",
    description: "完成第一筆記帳",
    icon: "🐣",
    condition: { type: "total_records", value: 1 },
    rewardExp: 50
  },
  {
    id: "ach_10_records",
    category: "行為型",
    title: "記帳小能手",
    description: "累計完成 10 筆記帳",
    icon: "✍️",
    condition: { type: "total_records", value: 10 },
    rewardExp: 80
  },
  {
    id: "ach_50_records",
    category: "行為型",
    title: "勤奮的記錄者",
    description: "累計完成 50 筆記帳",
    icon: "📚",
    condition: { type: "total_records", value: 50 },
    rewardExp: 150
  },
  {
    id: "ach_100_records",
    category: "行為型",
    title: "百筆傳說",
    description: "累計完成 100 筆記帳",
    icon: "🏛️",
    condition: { type: "total_records", value: 100 },
    rewardExp: 300
  },
  {
    id: "ach_streak_3",
    category: "行為型",
    title: "三日之始",
    description: "連續記帳 3 天",
    icon: "🔥",
    condition: { type: "streak", value: 3 },
    rewardExp: 30
  },
  {
    id: "ach_streak_7",
    category: "行為型",
    title: "週間戰士",
    description: "連續記帳 7 天",
    icon: "⚡",
    condition: { type: "streak", value: 7 },
    rewardExp: 70
  },
  {
    id: "ach_streak_30",
    category: "行為型",
    title: "月之守護者",
    description: "連續記帳 30 天",
    icon: "🌙",
    condition: { type: "streak", value: 30 },
    rewardExp: 200
  },
  {
    id: "ach_3_in_day",
    category: "行為型",
    title: "今日勤勞",
    description: "單日完成 3 筆記帳",
    icon: "⚙️",
    condition: { type: "daily_records", value: 3 },
    rewardExp: 40
  },

  /* 里程碑成就 */
  {
    id: "ach_save_1000",
    category: "里程碑",
    title: "千元儲蓄家",
    description: "累積儲蓄突破 1,000 元",
    icon: "🪙",
    condition: { type: "total_savings", value: 1000 },
    rewardExp: 80
  },
  {
    id: "ach_save_5000",
    category: "里程碑",
    title: "五千之壁",
    description: "累積儲蓄突破 5,000 元",
    icon: "💰",
    condition: { type: "total_savings", value: 5000 },
    rewardExp: 150
  },
  {
    id: "ach_save_10000",
    category: "里程碑",
    title: "萬元俱樂部",
    description: "累積儲蓄突破 10,000 元",
    icon: "🏦",
    condition: { type: "total_savings", value: 10000 },
    rewardExp: 300
  },
  {
    id: "ach_save_50000",
    category: "里程碑",
    title: "財富守護者",
    description: "累積儲蓄突破 50,000 元",
    icon: "💎",
    condition: { type: "total_savings", value: 50000 },
    rewardExp: 500
  },
  {
    id: "ach_first_goal",
    category: "里程碑",
    title: "目標征服者",
    description: "達成第一個儲蓄目標",
    icon: "🎯",
    condition: { type: "goals_completed", value: 1 },
    rewardExp: 200
  },
  {
    id: "ach_level_5",
    category: "里程碑",
    title: "晉升精英",
    description: "角色等級達到 Lv.5",
    icon: "🌟",
    condition: { type: "level", value: 5 },
    rewardExp: 100
  },

  /* 收藏型成就 */
  {
    id: "ach_cards_5",
    category: "收藏型",
    title: "初級收藏家",
    description: "收集 5 張不同的卡牌",
    icon: "🃏",
    condition: { type: "unique_cards", value: 5 },
    rewardExp: 40
  },
  {
    id: "ach_cards_15",
    category: "收藏型",
    title: "資深收藏家",
    description: "收集 15 張不同的卡牌",
    icon: "📿",
    condition: { type: "unique_cards", value: 15 },
    rewardExp: 100
  },
  {
    id: "ach_cards_all",
    category: "收藏型",
    title: "全卡蒐集者",
    description: "收集全部 40 張卡牌",
    icon: "🌈",
    condition: { type: "unique_cards", value: 40 },
    rewardExp: 500
  },
  {
    id: "ach_rare_card",
    category: "收藏型",
    title: "稀有之光",
    description: "獲得第一張稀有卡牌",
    icon: "💜",
    condition: { type: "has_rare", value: 1 },
    rewardExp: 60
  },
  {
    id: "ach_legend_card",
    category: "收藏型",
    title: "傳說降臨",
    description: "獲得第一張傳說卡牌",
    icon: "👑",
    condition: { type: "has_legendary", value: 1 },
    rewardExp: 150
  }
];

/* ── 預設分類 (支出 & 收入) ── */
const DEFAULT_CATEGORIES = {
  支出: [
    { name: "餐飲", icon: "🍽️" },
    { name: "交通", icon: "🚗" },
    { name: "居家生活", icon: "🏠" },
    { name: "娛樂", icon: "🎮" },
    { name: "服飾", icon: "👕" },
    { name: "醫療", icon: "💊" },
    { name: "教育", icon: "📚" },
    { name: "社交", icon: "🤝" },
    { name: "日用品", icon: "🧴" },
    { name: "通訊", icon: "📱" },
    { name: "保險", icon: "🛡️" },
    { name: "其他", icon: "📦" }
  ],
  收入: [
    { name: "薪資", icon: "💼" },
    { name: "獎金", icon: "🎁" },
    { name: "投資", icon: "📈" },
    { name: "副業", icon: "💡" },
    { name: "退款", icon: "↩️" },
    { name: "其他", icon: "📦" }
  ]
};

/* ── 預設付款方式 ── */
const DEFAULT_PAYMENTS = [
  { name: "現金", icon: "💵" },
  { name: "信用卡", icon: "💳" },
  { name: "簽帳卡", icon: "💳" },
  { name: "行動支付", icon: "📱" },
  { name: "轉帳", icon: "🏦" },
  { name: "其他", icon: "💲" }
];

/* ── 角色問候語 (依時段) ── */
const GREETINGS = {
  morning:   ["早安！新的一天，新的開始 ☀️", "早安！德卜希陪你開啟美好的一天 🌸", "今天也要好好記帳喔 🌱"],
  afternoon: ["午安～吃飽了嗎？別忘了記帳 🍽️", "下午好！讓我們整理一下今天的花費 📝", "午後時光，最適合回顧今日進度 ✨"],
  evening:   ["晚安～今天辛苦了 🌙", "一天快結束了，來看看今天的成果吧 🌟", "放鬆的夜晚，順手記錄今天的花費 🍵"],
  night:     ["夜深了，還在記帳嗎？你好棒！🌌", "深夜也要照顧好自己的財務 💫", "月光陪伴，德卜希也陪伴著你 🌙"]
};
