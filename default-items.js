/**
 * 露營與出遊預設常備清單範本
 */
const DEFAULT_CAMPING_ITEMS = [
  // --- 用品裝備 (equipment) ---
  {
    id: "item_eq_1",
    name: "露營帳篷",
    category: "equipment",
    quantity: "1 頂",
    note: "4-6 人帳，含外帳與營柱",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_eq_2",
    name: "防潮地墊 / 睡墊",
    category: "equipment",
    quantity: "4 張",
    note: "帳篷內防潮保暖用",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_eq_3",
    name: "卡式爐",
    category: "equipment",
    quantity: "2 台",
    note: "料理煮水用",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_eq_4",
    name: "露營折疊桌椅組",
    category: "equipment",
    quantity: "1 桌 4 椅",
    note: "客廳區使用",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_eq_5",
    name: "露營燈 / 主燈 / 氣氛串燈",
    category: "equipment",
    quantity: "2 組",
    note: "夜間照明（記得充電或備用電池）",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_eq_6",
    name: "動力延長線",
    category: "equipment",
    quantity: "1 條 (10-15m)",
    note: "戶外專用輪座式或防潑水延長線",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_eq_7",
    name: "保冷箱 / 冰桶",
    category: "equipment",
    quantity: "1 個 (約 30-40L)",
    note: "存放食材肉品及飲料",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_eq_8",
    name: "鍋具與料理工具組",
    category: "equipment",
    quantity: "1 套",
    note: "平底鍋/湯鍋、菜刀、砧板、夾子、湯勺",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },

  // --- 食品食材 (food) ---
  {
    id: "item_fd_1",
    name: "烤肉肉品組（牛肉/豬五花/雞腿排）",
    category: "food",
    quantity: "依人數份量",
    note: "已先醃製或保鮮處理",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_fd_2",
    name: "海鮮食材（蝦子/蛤蜊/透抽）",
    category: "food",
    quantity: "適量",
    note: "須維持低溫保冷",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_fd_3",
    name: "蔬菜與菇類（玉米/青椒/香菇/高麗菜）",
    category: "food",
    quantity: "1 大袋",
    note: "已清洗切塊方便烹飪",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_fd_4",
    name: "早餐食材（吐司/雞蛋/火腿）",
    category: "food",
    quantity: "隔日早餐份",
    note: "簡單熱壓吐司或煎蛋",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_fd_5",
    name: "調味料組（烤肉醬/胡椒鹽/油/醬油）",
    category: "food",
    quantity: "1 盒",
    note: "小瓶分裝攜帶",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_fd_6",
    name: "宵夜點心零食",
    category: "food",
    quantity: "2-3 包",
    note: "洋芋片、棉花糖（烤肉用）",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },

  // --- 飲品與消耗品 (consumables) ---
  {
    id: "item_cs_1",
    name: "卡式瓦斯罐",
    category: "consumables",
    quantity: "3-4 罐",
    note: "煮飯、煮水、宵夜烹煮消耗",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_cs_2",
    name: "大桶飲用水 / 礦泉水",
    category: "consumables",
    quantity: "2-3 大瓶",
    note: "泡茶、煮湯與飲用",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_cs_3",
    name: "衛生冰塊",
    category: "consumables",
    quantity: "2 包",
    note: "保冷箱降溫與冷飲調配",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_cs_4",
    name: "大黑色垃圾袋",
    category: "consumables",
    quantity: "1 包",
    note: "維護營地清潔，垃圾不落地",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_cs_5",
    name: "抽取式衛生紙與廚房紙巾",
    category: "consumables",
    quantity: "各 2 包",
    note: "料理與餐後清理必備",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_cs_6",
    name: "防蚊液與防蚊蚊香",
    category: "consumables",
    quantity: "1 組",
    note: "戶外防小黑蚊",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },

  // --- 個人自備 (personal) ---
  {
    id: "item_ps_1",
    name: "睡袋 / 保暖毛毯",
    category: "personal",
    quantity: "每人自備 1 件",
    note: "依營區夜間氣溫準備厚薄度",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_ps_2",
    name: "換洗衣物與防風禦寒外套",
    category: "personal",
    quantity: "每人自備",
    note: "山區早晚溫差大，注意保暖",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_ps_3",
    name: "個人環保餐具與水壺杯",
    category: "personal",
    quantity: "每人 1 套",
    note: "碗、筷、湯匙、馬克杯",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  },
  {
    id: "item_ps_4",
    name: "個人盥洗包與常備藥品",
    category: "personal",
    quantity: "每人 1 份",
    note: "牙刷毛巾、腸胃藥、止痛藥、過敏藥",
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  }
];
