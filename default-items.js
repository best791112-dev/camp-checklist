/**
 * 露營與出遊預設常備清單範本與豐富選單庫
 * 包含明確的大類 (category) 與子分類 (subCategory)
 */

window.PRESET_ITEM_LIBRARY = [
  // ==========================================
  // --- ⛺ 用品裝備 (equipment) ---
  // ==========================================
  // 【營宿帳篷】
  { name: "露營帳篷", category: "equipment", subCategory: "營宿帳篷", quantity: "1 頂", note: "含外帳、內帳與營柱", isDefaultFavorite: true },
  { name: "天幕 / 客廳帳", category: "equipment", subCategory: "營宿帳篷", quantity: "1 組", note: "遮陽擋雨主要活動區", isDefaultFavorite: true },
  { name: "營釘與營槌組", category: "equipment", subCategory: "營宿帳篷", quantity: "1 袋", note: "固定帳篷抗強風必備", isDefaultFavorite: true },
  { name: "防潮地墊 / 鋁箔墊", category: "equipment", subCategory: "營宿帳篷", quantity: "2-4 張", note: "帳內防潮隔絕地表濕氣", isDefaultFavorite: true },
  { name: "充氣床墊 / 露營睡墊", category: "equipment", subCategory: "營宿帳篷", quantity: "依人數", note: "好睡隔絕地面硬度", isDefaultFavorite: true },
  { name: "充氣幫浦 (電動/打氣機)", category: "equipment", subCategory: "營宿帳篷", quantity: "1 台", note: "床墊快速充氣與洩氣" },

  // 【桌椅起居】
  { name: "露營折疊桌", category: "equipment", subCategory: "桌椅起居", quantity: "1-2 張", note: "蛋捲桌或鋁合金折疊桌", isDefaultFavorite: true },
  { name: "露營折疊椅", category: "equipment", subCategory: "桌椅起居", quantity: "每人 1 張", note: "克米特椅或月亮椅", isDefaultFavorite: true },
  { name: "露營折疊推車", category: "equipment", subCategory: "桌椅起居", quantity: "1 台", note: "裝備上下車搬運神器" },
  { name: "野餐墊", category: "equipment", subCategory: "桌椅起居", quantity: "1 張", note: "草地野餐放鬆小憩" },
  { name: "露營風扇", category: "equipment", subCategory: "桌椅起居", quantity: "1-2 台", note: "夏季帳內通風降溫" },

  // 【烹飪料理廚具】
  { name: "卡式爐", category: "equipment", subCategory: "烹飪廚具", quantity: "2 台", note: "煮飯、熱湯、烤盤料理", isDefaultFavorite: true },
  { name: "露營套鍋組 (湯鍋/平底鍋)", category: "equipment", subCategory: "烹飪廚具", quantity: "1 套", note: "多功能收納料理鍋", isDefaultFavorite: true },
  { name: "料理工具組 (菜刀/砧板/剪刀/夾子)", category: "equipment", subCategory: "烹飪廚具", quantity: "1 組", note: "食材分切備料料理必備", isDefaultFavorite: true },
  { name: "保冷箱 / 冰桶 (含保冷劑)", category: "equipment", subCategory: "烹飪廚具", quantity: "1 個 (30L+)", note: "生鮮肉品食材與冷飲保鮮", isDefaultFavorite: true },
  { name: "熱水壺 / 泡茶壺", category: "equipment", subCategory: "烹飪廚具", quantity: "1 個", note: "煮開水、早晨泡咖啡" },
  { name: "折疊洗菜水槽 / 水桶", category: "equipment", subCategory: "烹飪廚具", quantity: "1-2 個", note: "清洗食材與餐具洗滌" },

  // 【照明與用電】
  { name: "露營主燈 / 營地大燈", category: "equipment", subCategory: "照明用電", quantity: "2 盞", note: "夜間客廳與營地照明", isDefaultFavorite: true },
  { name: "氣氛串燈", category: "equipment", subCategory: "照明用電", quantity: "1-2 條", note: "天幕裝飾美化、夜間防絆倒" },
  { name: "動力延長線 (輪座式)", category: "equipment", subCategory: "照明用電", quantity: "1 條 (10-15m)", note: "接營地供電箱，戶外防潑水", isDefaultFavorite: true },

  // ==========================================
  // --- 🥩 食材食品 (food) ---
  // ==========================================
  // 【肉品海鮮】
  { name: "烤肉肉品組 (牛小排/豬五花/雞腿排)", category: "food", subCategory: "肉品海鮮", quantity: "依人數份量", note: "醃製肉或真空包原肉", isDefaultFavorite: true },
  { name: "海鮮食材 (白蝦/大蛤蜊/透抽)", category: "food", subCategory: "肉品海鮮", quantity: "適量", note: "低溫保冷，烤肉煮湯首選", isDefaultFavorite: true },
  { name: "火鍋肉片 (牛/豬肉片)", category: "food", subCategory: "肉品海鮮", quantity: "2-3 盒", note: "天冷煮火鍋或宵夜熱湯" },
  { name: "熱門烤肉料 (甜不辣/香腸/米血/貢丸)", category: "food", subCategory: "肉品海鮮", quantity: "適量", note: "經典烤肉配料", isDefaultFavorite: true },

  // 【生鮮蔬菜】
  { name: "蔬菜菇類 (玉米/青椒/香菇/杏鮑菇)", category: "food", subCategory: "蔬菜生鮮", quantity: "1-2 大袋", note: "烤肉解膩必備", isDefaultFavorite: true },
  { name: "高麗菜 / 大白菜", category: "food", subCategory: "蔬菜生鮮", quantity: "1 顆", note: "煮湯火鍋或清炒" },
  { name: "生菜包肉葉 (美生菜/蘿蔓)", category: "food", subCategory: "蔬菜生鮮", quantity: "1-2 包", note: "韓式烤肉包肉吃超爽口" },
  { name: "當季水果盒 (已切分好)", category: "food", subCategory: "蔬菜生鮮", quantity: "2 盒", note: "飯後解膩" },

  // 【主食與早餐】
  { name: "早餐食材 (吐司/雞蛋/起司/火腿)", category: "food", subCategory: "主食早餐", quantity: "隔日早餐份", note: "熱壓吐司、煎蛋早餐", isDefaultFavorite: true },
  { name: "白米 / 熟飯真空包", category: "food", subCategory: "主食早餐", quantity: "適量", note: "主餐澱粉飽足感" },
  { name: "火鍋湯底包 (麻辣/昆布/酸白菜)", category: "food", subCategory: "主食早餐", quantity: "1-2 包", note: "天冷圍爐熱湯超暖" },
  { name: "宵夜泡麵 / 乾拌麵", category: "food", subCategory: "主食早餐", quantity: "3-4 包", note: "深夜肚子餓救星", isDefaultFavorite: true },

  // 【醬料調味】
  { name: "烤肉醬與調味料 (胡椒鹽/醬油/沙拉油)", category: "food", subCategory: "調味醬料", quantity: "1 盒分裝", note: "烹飪美味靈魂", isDefaultFavorite: true },
  { name: "辛香料 (大蒜/辣椒/青蔥)", category: "food", subCategory: "調味醬料", quantity: "1 小包", note: "爆香與沾醬調味" },

  // 【零食飲品點心】
  { name: "棉花糖 (附長烤籤)", category: "food", subCategory: "點心零食", quantity: "1 包", note: "碳烤棉花糖經典甜點", isDefaultFavorite: true },
  { name: "零食點心 (洋芋片/堅果米果)", category: "food", subCategory: "點心零食", quantity: "2-3 大包", note: "搭帳棚下午茶點心" },
  { name: "咖啡豆 / 濾掛咖啡包", category: "food", subCategory: "點心零食", quantity: "每人份量", note: "露營早晨愜意手沖時光", isDefaultFavorite: true },

  // ==========================================
  // --- 🧊 飲品消耗品 (consumables) ---
  // ==========================================
  // 【燃料與水電消耗】
  { name: "卡式瓦斯罐", category: "consumables", subCategory: "瓦斯飲水", quantity: "3-5 罐", note: "煮飯料理消耗，建議多備", isDefaultFavorite: true },
  { name: "大桶飲用水 / 礦泉水", category: "consumables", subCategory: "瓦斯飲水", quantity: "2-3 大桶 (5L)", note: "烹飪煮湯、泡茶泡咖啡", isDefaultFavorite: true },

  // 【冰塊與酒水】
  { name: "食用衛生冰塊", category: "consumables", subCategory: "冰塊酒水", quantity: "2-3 大包", note: "保冷箱降溫與冷飲調配", isDefaultFavorite: true },
  { name: "啤酒 / 沙瓦 / 調酒", category: "consumables", subCategory: "冰塊酒水", quantity: "1-2 箱", note: "夜晚營火小酌放鬆", isDefaultFavorite: true },
  { name: "無糖茶飲 / 可樂汽水", category: "consumables", subCategory: "冰塊酒水", quantity: "6-8 瓶", note: "解渴搭配烤肉火鍋" },

  // 【清潔與耗材】
  { name: "黑色大垃圾袋", category: "consumables", subCategory: "清潔耗材", quantity: "1 捲", note: "維護環境整潔、垃圾分類", isDefaultFavorite: true },
  { name: "抽取式衛生紙與廚房紙巾", category: "consumables", subCategory: "清潔耗材", quantity: "各 2 包", note: "油漬擦拭與餐後清潔", isDefaultFavorite: true },
  { name: "厚手濕紙巾", category: "consumables", subCategory: "清潔耗材", quantity: "2 大包", note: "餐前洗手擦臉擦桌子", isDefaultFavorite: true },
  { name: "洗碗精與菜瓜布", category: "consumables", subCategory: "清潔耗材", quantity: "1 小瓶 + 1 塊", note: "餐後洗鍋碗瓢盆必備", isDefaultFavorite: true },
  { name: "鋁箔紙 / 保鮮膜", category: "consumables", subCategory: "清潔耗材", quantity: "各 1 捲", note: "烤肉包食材、未吃完食材保鮮" },
  { name: "免洗餐具 (紙盤/紙碗/免洗筷)", category: "consumables", subCategory: "清潔耗材", quantity: "備用 1 袋", note: "防洗碗麻煩或訪客備用" },

  // 【戶外防護】
  { name: "防蚊液 / 防蚊蚊香組", category: "consumables", subCategory: "戶外防護", quantity: "1 組", note: "防小黑蚊與戶外蚊蟲叮咬", isDefaultFavorite: true },

  // ==========================================
  // --- 🎒 個人自備 (personal) ---
  // ==========================================
  // 【個人寢具】
  { name: "睡袋 / 保暖被毯", category: "personal", subCategory: "個人寢具", quantity: "每人自備 1 件", note: "山區夜間氣溫低保暖用", isDefaultFavorite: true },
  { name: "枕頭 (充氣枕或家用枕)", category: "personal", subCategory: "個人寢具", quantity: "每人 1 個", note: "夜間睡眠舒適支撐" },

  // 【個人衣物】
  { name: "換洗衣物 (含備用內著)", category: "personal", subCategory: "衣物穿著", quantity: "每人 1-2 套", note: "戶外流汗弄髒替換", isDefaultFavorite: true },
  { name: "防風禦寒外套 / 羽絨衣", category: "personal", subCategory: "衣物穿著", quantity: "每人 1 件", note: "早晚溫差大防著涼", isDefaultFavorite: true },
  { name: "拖鞋 / 溯溪涼鞋", category: "personal", subCategory: "衣物穿著", quantity: "每人 1 雙", note: "營區活動散步舒適", isDefaultFavorite: true },

  // 【個人餐具與衛生】
  { name: "個人環保餐具與杯子", category: "personal", subCategory: "個人衛生", quantity: "每人 1 套", note: "碗、筷、湯匙、馬克杯", isDefaultFavorite: true },
  { name: "個人盥洗用具與大毛巾", category: "personal", subCategory: "個人衛生", quantity: "每人 1 份", note: "牙刷牙膏、洗髮精沐浴乳", isDefaultFavorite: true },

  // 【隨身用品與常備藥】
  { name: "行動電源與充電線", category: "personal", subCategory: "隨身配件", quantity: "每人 1-2 組", note: "手機充飽隨時拍照聯絡", isDefaultFavorite: true },
  { name: "個人常備藥品 (腸胃/止痛/過敏)", category: "personal", subCategory: "隨身配件", quantity: "每人必備", note: "預防戶外身體不適", isDefaultFavorite: true }
];

// 預設匯入的精簡清單
window.DEFAULT_CAMPING_ITEMS = window.PRESET_ITEM_LIBRARY.filter(function(i) {
  return i.isDefaultFavorite;
}).map(function(item, index) {
  return {
    id: "item_def_" + (index + 1),
    name: item.name,
    category: item.category,
    subCategory: item.subCategory || "一般",
    quantity: item.quantity,
    note: item.note,
    assignedTo: null,
    assignedUserName: null,
    assignedUserPicture: null
  };
});
