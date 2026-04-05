/* =========================
   卡牌資料庫 — 塔羅 / 奧修禪卡風格
   40 張卡牌：普通 25 / 稀有 10 / 傳說 5
========================= */

const CARDS_DATA = [
  /* ── 普通 (common) ── */
  {
    id: 1, name: "節制", theme: "balance",
    rarity: "common", color: "#95C9A8",
    icon: "⚖️",
    messageShort: "適度即是智慧",
    messageFinance: "花之前，先問自己：這是需要，還是想要？三秒的停頓，省下的不只是錢。"
  },
  {
    id: 2, name: "流動", theme: "flow",
    rarity: "common", color: "#7EC8E3",
    icon: "🌊",
    messageShort: "錢如水，順流而行",
    messageFinance: "金錢是流動的能量，讓它流向真正重要的地方。"
  },
  {
    id: 3, name: "穩定", theme: "stability",
    rarity: "common", color: "#B8D4A3",
    icon: "🏔️",
    messageShort: "穩定是成長的基石",
    messageFinance: "每一次規律的記帳，都是為財務自由鋪上一塊磚。"
  },
  {
    id: 4, name: "覺察", theme: "awareness",
    rarity: "common", color: "#E8C8A0",
    icon: "👁️",
    messageShort: "看見，就是改變的開始",
    messageFinance: "今天花了什麼？不批判，只是看見。覺察是理財的第一步。"
  },
  {
    id: 5, name: "感恩", theme: "gratitude",
    rarity: "common", color: "#F0C75E",
    icon: "🙏",
    messageShort: "感謝每一份擁有",
    messageFinance: "盤點你已經擁有的，往往會發現，你比想像中富足。"
  },
  {
    id: 6, name: "耐心", theme: "patience",
    rarity: "common", color: "#C4B7A6",
    icon: "🌱",
    messageShort: "種子需要時間發芽",
    messageFinance: "儲蓄不是一夜之間的事。每天一小步，終會匯成大河。"
  },
  {
    id: 7, name: "簡約", theme: "simplicity",
    rarity: "common", color: "#D4C5B0",
    icon: "🍃",
    messageShort: "少即是多",
    messageFinance: "減少不必要的開銷，不是節省，而是為重要的事騰出空間。"
  },
  {
    id: 8, name: "勇氣", theme: "courage",
    rarity: "common", color: "#FF9A76",
    icon: "🦁",
    messageShort: "面對數字，就是勇敢",
    messageFinance: "敢於真實面對自己的財務狀況，就是改變的開始。"
  },
  {
    id: 9, name: "秩序", theme: "order",
    rarity: "common", color: "#A8C4D9",
    icon: "📐",
    messageShort: "有序帶來安心",
    messageFinance: "分類記帳不是強迫症，而是送給未來自己的禮物。"
  },
  {
    id: 10, name: "信任", theme: "trust",
    rarity: "common", color: "#B0C4DE",
    icon: "🤝",
    messageShort: "信任自己的選擇",
    messageFinance: "你做的每個財務決定，都帶著當時的智慧。相信過程。"
  },
  {
    id: 11, name: "純真", theme: "innocence",
    rarity: "common", color: "#FFD4E5",
    icon: "🌸",
    messageShort: "用初心看待金錢",
    messageFinance: "回想最初想存錢的原因——那份純粹的動力，依然在你心中。"
  },
  {
    id: 12, name: "收穫", theme: "harvest",
    rarity: "common", color: "#E8B86D",
    icon: "🌾",
    messageShort: "播種必有收穫",
    messageFinance: "今天的每一筆記錄，都是秋天豐收的準備。"
  },
  {
    id: 13, name: "放下", theme: "release",
    rarity: "common", color: "#C9A9C9",
    icon: "🎈",
    messageShort: "輕裝才能遠行",
    messageFinance: "那些衝動消費的念頭，輕輕放下就好，不需要自責。"
  },
  {
    id: 14, name: "蛻變", theme: "transformation",
    rarity: "common", color: "#A8D8B9",
    icon: "🦋",
    messageShort: "每一次改變都有意義",
    messageFinance: "從記帳新手到理財高手，每個階段都值得被珍惜。"
  },
  {
    id: 15, name: "和諧", theme: "harmony",
    rarity: "common", color: "#B5D8CC",
    icon: "☯️",
    messageShort: "收支平衡即是和諧",
    messageFinance: "不必極端節省，找到花錢與存錢之間的甜蜜點。"
  },
  {
    id: 16, name: "歡慶", theme: "celebration",
    rarity: "common", color: "#FFB347",
    icon: "🎉",
    messageShort: "慶祝每一個小勝利",
    messageFinance: "存到第一個千元？恭喜！每一個里程碑都值得慶祝。"
  },
  {
    id: 17, name: "專注", theme: "focus",
    rarity: "common", color: "#87CEEB",
    icon: "🎯",
    messageShort: "心無旁騖，直達目標",
    messageFinance: "一次只看一個儲蓄目標，反而更快達成。"
  },
  {
    id: 18, name: "溫柔", theme: "gentleness",
    rarity: "common", color: "#F5C6D0",
    icon: "💗",
    messageShort: "對自己溫柔一點",
    messageFinance: "超支了？沒關係。明天重新開始就好，你一直在進步。"
  },
  {
    id: 19, name: "反思", theme: "reflection",
    rarity: "common", color: "#9DB4C0",
    icon: "🪞",
    messageShort: "回頭看，才能更好地前行",
    messageFinance: "定期回顧支出，就像照鏡子——幫助你認識真正的自己。"
  },
  {
    id: 20, name: "連結", theme: "connection",
    rarity: "common", color: "#DDA0DD",
    icon: "🔗",
    messageShort: "與目標保持連結",
    messageFinance: "時常想起你的儲蓄目標，讓它陪伴你每一天。"
  },
  {
    id: 21, name: "晨光", theme: "dawn",
    rarity: "common", color: "#FFDAB9",
    icon: "🌅",
    messageShort: "每一天都是新的開始",
    messageFinance: "昨天的帳已經翻過，今天的頁面全新而明亮。"
  },
  {
    id: 22, name: "守護", theme: "protection",
    rarity: "common", color: "#87A96B",
    icon: "🛡️",
    messageShort: "守護你珍視的一切",
    messageFinance: "緊急預備金就像盔甲，平時看不到，關鍵時刻保護你。"
  },
  {
    id: 23, name: "紀律", theme: "discipline",
    rarity: "common", color: "#708090",
    icon: "📏",
    messageShort: "紀律是自由的前提",
    messageFinance: "每天花 30 秒記帳，一年後你會感謝今天的堅持。"
  },
  {
    id: 24, name: "呼吸", theme: "breath",
    rarity: "common", color: "#B0E0E6",
    icon: "💨",
    messageShort: "深呼吸，一切都好",
    messageFinance: "財務壓力大的時候，先停下來呼吸。冷靜之後再做決定。"
  },
  {
    id: 25, name: "滋養", theme: "nourish",
    rarity: "common", color: "#98FB98",
    icon: "🌿",
    messageShort: "滋養身心的投資最值得",
    messageFinance: "花在健康和學習上的錢，是回報率最高的投資。"
  },

  /* ── 稀有 (rare) ── */
  {
    id: 26, name: "豐盛", theme: "abundance",
    rarity: "rare", color: "#F0C75E",
    icon: "✨",
    messageShort: "豐盛從內心開始",
    messageFinance: "當你相信自己值得擁有，宇宙便開始回應。理財不是匱乏思維，而是豐盛管理。"
  },
  {
    id: 27, name: "智慧", theme: "wisdom",
    rarity: "rare", color: "#8E7CC3",
    icon: "🦉",
    messageShort: "經驗化為智慧之光",
    messageFinance: "過去的消費經驗是學費，不是浪費。每一筆都讓你更聰明。"
  },
  {
    id: 28, name: "重整", theme: "renewal",
    rarity: "rare", color: "#20B2AA",
    icon: "🔄",
    messageShort: "破繭而出，嶄新開始",
    messageFinance: "重新規劃預算不是失敗，而是向更好版本的自己前進。"
  },
  {
    id: 29, name: "創造", theme: "creation",
    rarity: "rare", color: "#FF7F50",
    icon: "🎨",
    messageShort: "你就是自己命運的創造者",
    messageFinance: "收入不只來自工作。創意思維，能打開你從未想過的財富大門。"
  },
  {
    id: 30, name: "自由", theme: "freedom",
    rarity: "rare", color: "#87CEEB",
    icon: "🕊️",
    messageShort: "真正的自由來自掌控",
    messageFinance: "財務自由不是花不完的錢，而是面對帳單時的從容。"
  },
  {
    id: 31, name: "月光", theme: "moonlight",
    rarity: "rare", color: "#C0C0E0",
    icon: "🌙",
    messageShort: "在靜夜中看見方向",
    messageFinance: "安靜的夜晚最適合回顧。你的財務旅程，正月光照亮的方向前行。"
  },
  {
    id: 32, name: "星辰", theme: "stars",
    rarity: "rare", color: "#4B0082",
    icon: "⭐",
    messageShort: "仰望星空，腳踏實地",
    messageFinance: "夢想要大，執行要細。把大目標拆成每日可達的小任務吧。"
  },
  {
    id: 33, name: "煉金", theme: "alchemy",
    rarity: "rare", color: "#DAA520",
    icon: "⚗️",
    messageShort: "化平凡為黃金",
    messageFinance: "每一筆小額存款，透過時間的煉金術，都將成為你的黃金。"
  },
  {
    id: 34, name: "命運之輪", theme: "wheel",
    rarity: "rare", color: "#B8860B",
    icon: "🎡",
    messageShort: "轉動屬於你的命運之輪",
    messageFinance: "財務的起伏是自然的。在低谷積累力量，在高峰做好準備。"
  },
  {
    id: 35, name: "寶藏", theme: "treasure",
    rarity: "rare", color: "#CD853F",
    icon: "💎",
    messageShort: "最大的寶藏在心中",
    messageFinance: "你的財務紀律和堅持，本身就是比金錢更珍貴的寶藏。"
  },

  /* ── 傳說 (legendary) ── */
  {
    id: 36, name: "鳳凰涅槃", theme: "phoenix",
    rarity: "legendary", color: "#FF4500",
    icon: "🔥",
    messageShort: "浴火重生，光芒萬丈",
    messageFinance: "經歷過財務困境的人，往往擁有最堅韌的理財智慧。你的重生之路，將照亮他人。"
  },
  {
    id: 37, name: "世界", theme: "world",
    rarity: "legendary", color: "#4169E1",
    icon: "🌍",
    messageShort: "整個世界都在你手中",
    messageFinance: "當你掌控了自己的財務，你便擁有了選擇生活方式的自由。世界為你敞開。"
  },
  {
    id: 38, name: "永恆之樹", theme: "tree",
    rarity: "legendary", color: "#228B22",
    icon: "🌳",
    messageShort: "深根才能高聳入雲",
    messageFinance: "像大樹一樣深扎根基。你建立的財務基礎，將庇蔭未來的每一天。"
  },
  {
    id: 39, name: "星河", theme: "galaxy",
    rarity: "legendary", color: "#191970",
    icon: "🌌",
    messageShort: "你是星河中閃耀的存在",
    messageFinance: "每一筆記帳都是星光。日積月累，你正在編織屬於自己的財務星河。"
  },
  {
    id: 40, name: "黃金時代", theme: "golden",
    rarity: "legendary", color: "#FFD700",
    icon: "👑",
    messageShort: "你的黃金時代已經來臨",
    messageFinance: "持之以恆的你，正站在財務成長的巔峰。繼續閃耀吧，你值得擁有一切。"
  }
];

/* 卡牌抽取機率 */
const RARITY_WEIGHTS = {
  common: 70,
  rare: 25,
  legendary: 5
};

/* 稀有度中文名稱 & 色彩 */
const RARITY_INFO = {
  common:    { label: "普通", color: "#95C9A8", glow: "rgba(149,201,168,0.5)" },
  rare:      { label: "稀有", color: "#8E7CC3", glow: "rgba(142,124,195,0.6)" },
  legendary: { label: "傳說", color: "#FFD700", glow: "rgba(255,215,0,0.7)" }
};
