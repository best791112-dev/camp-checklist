/**
 * 露營與出遊預設常備清單範本與豐富選單庫
 */

// 完整的露營常備用品庫（供選單直接打勾挑選，不必手動打字）
const PRESET_ITEM_LIBRARY = [
  // --- ⛺ 用品裝備 (equipment) ---
  { name: "露營帳篷", category: "equipment", quantity: "1 頂", note: "含外帳、內帳與營柱", isDefaultFavorite: true },
  { name: "天幕 / 客廳帳", category: "equipment", quantity: "1 組", note: "遮陽擋雨活動區", isDefaultFavorite: true },
  { name: "營釘與營槌", category: "equipment", quantity: "1 袋", note: "固定帳篷天幕抗風", isDefaultFavorite: true },
  { name: "防潮地墊 / 鋁箔墊", category: "equipment", quantity: "2-4 張", note: "帳內防潮隔絕地面濕氣", isDefaultFavorite: true },
  { name: "充氣床墊 / 睡墊", category: "equipment", quantity: "依人數", note: "好睡隔絕地面", isDefaultFavorite: true },
  { name: "充氣幫浦 (電動/手動)", category: "equipment", quantity: "1 台", note: "充氣床墊快速打氣" },
  { name: "露營折疊桌", category: "equipment", quantity: "1-2 張", note: "蛋捲桌或折疊鋁桌", isDefaultFavorite: true },
  { name: "露營折疊椅", category: "equipment", quantity: "每人 1 張", note: "克米特椅或月亮椅", isDefaultFavorite: true },
  { name: "卡式爐", category: "equipment", quantity: "2 台", note: "煮飯、熱湯、宵夜", isDefaultFavorite: true },
  { name: "露營主燈 / 營燈", category: "equipment", quantity: "2 盞", note: "夜間營地照明", isDefaultFavorite: true },
  { name: "氣氛串燈", category: "equipment", quantity: "1-2 條", note: "天幕裝飾、夜間防絆倒" },
  { name: "動力延長線 (輪座式)", category: "equipment", quantity: "1 條 (10-15m)", note: "接營區供電箱，戶外防潑水", isDefaultFavorite: true },
  { name: "保冷箱 / 冰桶 (含保冷劑)", category: "equipment", quantity: "1 個 (30L+)", note: "低溫存放食材肉品及冷飲", isDefaultFavorite: true },
  { name: "露營鍋具組 (套鍋/平底鍋)", category: "equipment", quantity: "1 套", note: "煮湯、熱炒", isDefaultFavorite: true },
  { name: "料理工具組 (刀/砧板/剪刀/夾子)", category: "equipment", quantity: "1 組", note: "備料料理必備", isDefaultFavorite: true },
  { name: "熱水壺 / 泡茶壺", category: "equipment", quantity: "1 個", note: "煮開水、泡咖啡泡茶" },
  { name: "露營折疊推車", category: "equipment", quantity: "1 台", note: "搬運重物裝備神器" },
  { name: "野餐墊", category: "equipment", quantity: "1 張", note: "草地休憩放鬆" },
  { name: "折疊洗菜水槽 / 水桶", category: "equipment", quantity: "1-2 個", note: "清洗食材與餐具洗滌" },
  { name: "露營風扇", category: "equipment", quantity: "1-2 台", note: "夏季帳內通風降溫" },

  // --- 🥩 食材食品 (food) ---
  { name: "烤肉肉品組 (牛小排/豬五花/雞腿排)", category: "food", quantity: "依人數份量", note: "已醃製或原肉真空包", isDefaultFavorite: true },
  { name: "海鮮食材 (白蝦/蛤蜊/透抽)", category: "food", quantity: "適量", note: "需低溫保冷", isDefaultFavorite: true },
  { name: "蔬菜菇類 (玉米/青椒/香菇/高麗菜)", category: "food", quantity: "1-2 袋", note: "清洗分切好攜帶", isDefaultFavorite: true },
  { name: "烤肉火鍋配料 (甜不辣/香腸/米血/貢丸)", category: "food", quantity: "適量", note: "經典烤肉熱門", isDefaultFavorite: true },
  { name: "早餐食材 (吐司/雞蛋/起司/火腿)", category: "food", quantity: "隔日早餐份", note: "熱壓吐司或煎蛋", isDefaultFavorite: true },
  { name: "烤肉醬與調味料 (胡椒鹽/醬油/油)", category: "food", quantity: "1 盒小瓶裝", note: "美味關鍵", isDefaultFavorite: true },
  { name: "火鍋湯底包", category: "food", quantity: "1-2 包", note: "麻辣/昆布/酸菜白肉，天冷超暖胃" },
  { name: "宵夜泡麵 / 乾拌麵", category: "food", quantity: "3-4 包", note: "夜間肚子餓必備", isDefaultFavorite: true },
  { name: "零食點心 (洋芋片/堅果)", category: "food", quantity: "2-3 大包", note: "聊天泡茶下午茶" },
  { name: "棉花糖 (烤肉用)", category: "food", quantity: "1 包", note: "烤肉收尾經典甜點", isDefaultFavorite: true },
  { name: "當季水果 (已切盒)", category: "food", quantity: "2 盒", note: "清爽解膩" },
  { name: "咖啡豆 / 掛耳咖啡包 / 奶精", category: "food", quantity: "適量", note: "早晨露營咖啡時光", isDefaultFavorite: true },

  // --- 🧊 飲品消耗品 (consumables) ---
  { name: "卡式瓦斯罐", category: "consumables", quantity: "3-5 罐", note: "烹煮消耗，建議多備", isDefaultFavorite: true },
  { name: "大桶飲用水 / 礦泉水", category: "consumables", quantity: "2-3 大瓶 (5L)", note: "飲用、泡茶、煮湯料理", isDefaultFavorite: true },
  { name: "衛生冰塊", category: "consumables", quantity: "2-3 包", note: "保冷箱與冷飲調配", isDefaultFavorite: true },
  { name: "黑色大垃圾袋", category: "consumables", quantity: "1 捲", note: "環境整潔，分類回收", isDefaultFavorite: true },
  { name: "抽取式衛生紙與廚房紙巾", category: "consumables", quantity: "各 2 包", note: "清潔去油必備", isDefaultFavorite: true },
  { name: "濕紙巾", category: "consumables", quantity: "2 大包", note: "手部清潔、擦桌子", isDefaultFavorite: true },
  { name: "防蚊液 / 防蚊蚊香組", category: "consumables", quantity: "1 組", note: "戶外必備，防小黑蚊", isDefaultFavorite: true },
  { name: "啤酒 / 沙瓦 / 飲料金條", category: "consumables", quantity: "1-2 箱", note: "小酌助興 (開車不喝酒)", isDefaultFavorite: true },
  { name: "無糖茶飲 / 汽水果汁", category: "consumables", quantity: "6-8 瓶", note: "解渴搭配烤肉" },
  { name: "洗碗精與菜瓜布", category: "consumables", quantity: "1 小瓶 + 1 塊", note: "餐後洗碗盤", isDefaultFavorite: true },
  { name: "鋁箔紙 / 保鮮膜", category: "consumables", quantity: "各 1 捲", note: "烤肉包食材、未吃完保鮮" },
  { name: "免洗餐具 (紙盤/紙碗/免洗筷)", category: "consumables", quantity: "備用 1 袋", note: "訪客或不想洗碗備用" },

  // --- 🎒 個人自備 (personal) ---
  { name: "睡袋 / 保暖被子", category: "personal", quantity: "每人自備 1 件", note: "山區夜間氣溫低", isDefaultFavorite: true },
  { name: "枕頭", category: "personal", quantity: "每人 1 個", note: "充氣枕或家用枕" },
  { name: "換洗衣物 (含備用內著)", category: "personal", quantity: "每人 1-2 套", note: "防弄髒替換", isDefaultFavorite: true },
  { name: "防風禦寒外套 / 保暖衣物", category: "personal", quantity: "每人 1 件", note: "日夜溫差大必備", isDefaultFavorite: true },
  { name: "個人環保餐具與杯子", category: "personal", quantity: "每人 1 套", note: "碗、筷、湯匙、馬克杯", isDefaultFavorite: true },
  { name: "個人盥洗用具與毛巾", category: "personal", quantity: "每人 1 份", note: "牙刷、沐浴乳、洗髮精", isDefaultFavorite: true },
  { name: "行動電源與充電線", category: "personal", quantity: "每人 1-2 組", note: "手機相機充電", isDefaultFavorite: true },
  { name: "個人常備藥品 (腸胃/止痛/暈車)", category: "personal", quantity: "每人必備", note: "預防身體不適", isDefaultFavorite: true },
  { name: "拖鞋 / 溯溪涼鞋", category: "personal", quantity: "每人 1 雙", note: "營區活動放鬆舒適", isDefaultFavorite: true }
];

// 預設匯入的精簡清單
const DEFAULT_CAMPING_ITEMS = PRESET_ITEM_LIBRARY.filter(i => i.isDefaultFavorite).map((item, index) => ({
  id: "item_def_" + (index + 1),
  name: item.name,
  category: item.category,
  quantity: item.quantity,
  note: item.note,
  assignedTo: null,
  assignedUserName: null,
  assignedUserPicture: null
}));
