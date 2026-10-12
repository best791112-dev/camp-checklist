/**
 * 露營出遊協同備忘錄 - 核心邏輯 (進階旗艦版)
 * 包含：多人共同認領、指定負責人、上車點檢、多天數行程推算、Google Maps 導航、公費記帳與即時同步
 */

const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    // 頂部三大主視圖：'items' (物品清單) | 'carCheck' (上車點檢) | 'trip' (行程與記帳)
    const mainView = ref('items');

    // 預設分類設定
    const categories = [
      { id: 'all', name: '全部物品', icon: '📋' },
      { id: 'equipment', name: '用品裝備', icon: '⛺' },
      { id: 'food', name: '食材食品', icon: '🥩' },
      { id: 'consumables', name: '飲品消耗', icon: '🧊' },
      { id: 'personal', name: '個人自備', icon: '🎒' }
    ];

    const itemCategoryOptions = [
      { id: 'equipment', name: '用品裝備', icon: '⛺' },
      { id: 'food', name: '食材食品', icon: '🥩' },
      { id: 'consumables', name: '飲品消耗', icon: '🧊' },
      { id: 'personal', name: '個人自備', icon: '🎒' }
    ];

    // 選單庫分類
    const pickerTabs = [
      { id: 'favorites', name: '經常選擇', icon: '⭐' },
      { id: 'equipment', name: '用品裝備', icon: '⛺' },
      { id: 'food', name: '食材食品', icon: '🥩' },
      { id: 'consumables', name: '飲品消耗', icon: '🧊' },
      { id: 'personal', name: '個人自備', icon: '🎒' }
    ];

    // 活動基本資料
    const eventTitle = ref(window.APP_CONFIG?.DEFAULT_EVENT_TITLE || "🌲 歡樂露營出遊備忘錄");
    const currentCategory = ref('all');
    const searchQuery = ref('');
    const filterUnclaimedOnly = ref(false);
    const filterMyItemsOnly = ref(false);
    const syncStatus = ref('local'); // 'local' | 'cloud'
    const isLineClient = ref(false);

    // 當前使用者身分
    const currentUser = ref({
      userId: 'user_' + Math.floor(Math.random() * 10000),
      displayName: '露營夥伴',
      pictureUrl: ''
    });

    // 清單資料
    const items = ref([]);

    // 經常選擇收藏庫
    const favorites = ref([]);

    // 快速選單 Modal 狀態
    const showQuickPickerModal = ref(false);
    const pickerCategory = ref('favorites');
    const pickerSearch = ref('');
    const selectedPickerItems = ref([]);

    // 自訂新增/編輯 Modal
    const showItemModal = ref(false);
    const editingItem = ref(null);
    const formItem = ref({
      category: 'equipment',
      name: '',
      quantity: '',
      note: ''
    });

    // 指定誰帶 Modal
    const showAssignModal = ref(false);
    const assigningItem = ref(null);
    const assignTargetName = ref('');

    // 上車點檢狀態 (以 item.id 為 key，boolean 為 value)
    const carLoadedMap = ref({});

    // ----------------------------------------------------
    // 行程規劃與營地資料
    // ----------------------------------------------------
    const campSiteInfo = ref({
      name: "新竹尖石之美露營區",
      address: "新竹縣尖石鄉新樂村煤源段8鄰",
      mapUrl: "https://maps.google.com/?q=新竹尖石之美露營區",
      checkInTime: "13:00",
      checkOutTime: "11:00",
      contact: "0912-345-678",
      note: "附吹風機、冷藏冷凍冰箱、草皮碎石營位"
    });

    // 多天數行程表
    const tripDays = ref([
      {
        dayNumber: 1,
        title: "Day 1 - 採買與營地紮營",
        date: "2026-10-24",
        stops: [
          {
            id: "stop_1_1",
            name: "集合出發點 (台北交流道)",
            depTime: "08:30",
            travelMin: 60,
            stayMin: 15,
            note: "點名集合、對講機測試",
            mapQuery: "台北交流道"
          },
          {
            id: "stop_1_2",
            name: "好市多採買食材 (新竹店)",
            depTime: "",
            travelMin: 50,
            stayMin: 90,
            note: "採買牛肉、海鮮、酒水與生鮮",
            mapQuery: "好市多 新竹店"
          },
          {
            id: "stop_1_3",
            name: "抵達營地 (尖石之美露營區)",
            depTime: "",
            travelMin: 0,
            stayMin: 0,
            note: "搭帳篷、開始下午茶時光",
            mapQuery: "尖石之美露營區"
          }
        ]
      },
      {
        dayNumber: 2,
        title: "Day 2 - 營地收帳與周邊景點",
        date: "2026-10-25",
        stops: [
          {
            id: "stop_2_1",
            name: "營地早晨與拔營撤帳",
            depTime: "11:00",
            travelMin: 30,
            stayMin: 0,
            note: "收拾裝備，11:00前退場",
            mapQuery: "尖石之美露營區"
          },
          {
            id: "stop_2_2",
            name: "內灣老街 (在地午餐小吃)",
            depTime: "",
            travelMin: 70,
            stayMin: 120,
            note: "吃野薑花粽、客家擂茶、買伴手禮",
            mapQuery: "內灣老街"
          },
          {
            id: "stop_2_3",
            name: "快樂賦歸 (各自返家)",
            depTime: "",
            travelMin: 0,
            stayMin: 0,
            note: "平安順利抵達溫暖的家",
            mapQuery: ""
          }
        ]
      }
    ]);

    // 新增/編輯行程點 Modal
    const showStopModal = ref(false);
    const currentDayIndex = ref(0);
    const editingStopIndex = ref(-1);
    const formStop = ref({
      name: "",
      depTime: "",
      travelMin: 30,
      stayMin: 60,
      note: "",
      mapQuery: ""
    });

    // ----------------------------------------------------
    // 公費分攤與記帳資料
    // ----------------------------------------------------
    const expenseList = ref([
      {
        id: "exp_1",
        title: "露營區營位費 (草皮區 2 帳)",
        amount: 2400,
        paidBy: "王小明",
        category: "營位住宿",
        date: "2026-10-24"
      },
      {
        id: "exp_2",
        title: "好市多食材與烤肉用品",
        amount: 4800,
        paidBy: "李小華",
        category: "食材採買",
        date: "2026-10-24"
      }
    ]);

    const splitPeopleCount = ref(4); // 分攤人數
    const showExpenseModal = ref(false);
    const formExpense = ref({
      title: "",
      amount: "",
      paidBy: "",
      category: "食材採買"
    });

    // 匯出摘要 Modal
    const showExportModal = ref(false);
    const copyButtonText = ref('複製清單文字');

    // 系統設定 Modal
    const showSettingsModal = ref(false);
    const eventTitleInput = ref('');
    const liffIdInput = ref('');
    const firebaseConfigInput = ref('');

    // Firebase 參考
    let firestoreDb = null;
    let docUnsubscribe = null;
    let realtimeDb = null;
    let rtdbRef = null;
    const FIRESTORE_COLLECTION = 'camping_events';
    const FIRESTORE_DOC_ID = 'active_list';

    // 預設物品庫
    const presetLibrary = ref(window.PRESET_ITEM_LIBRARY || []);

    // ----------------------------------------------------
    // 生命週期
    // ----------------------------------------------------
    onMounted(async () => {
      loadFavoritesFromStorage();
      loadCarCheckFromStorage();
      loadSettingsFromStorage();
      initUserIdentity();
      await initFirebaseIfConfigured();
      await initLiffIfConfigured();

      if (items.value.length === 0) {
        loadItemsFromLocal();
        if (items.value.length === 0 && window.DEFAULT_CAMPING_ITEMS) {
          items.value = JSON.parse(JSON.stringify(window.DEFAULT_CAMPING_ITEMS));
          persistData();
        }
      }
    });

    // ----------------------------------------------------
    // 多人共同認領機制 (assignedUsers)
    // ----------------------------------------------------
    // 確保每筆 item 具有正規化的 assignedUsers 陣列 (向下相容舊資料)
    function normalizeItemUsers(item) {
      if (!item.assignedUsers || !Array.isArray(item.assignedUsers)) {
        item.assignedUsers = [];
        if (item.assignedTo && item.assignedUserName) {
          item.assignedUsers.push({
            userId: item.assignedTo,
            displayName: item.assignedUserName,
            pictureUrl: item.assignedUserPicture || null
          });
        }
      }
      return item.assignedUsers;
    }

    // 判斷是否由我認領
    function isClaimedByMe(item) {
      const users = normalizeItemUsers(item);
      return users.some(u => u.userId === currentUser.value.userId);
    }

    // 我來帶 / 我也帶 (共同認領)
    function claimItem(item) {
      const users = normalizeItemUsers(item);
      if (users.some(u => u.userId === currentUser.value.userId)) return;

      users.push({
        userId: currentUser.value.userId,
        displayName: currentUser.value.displayName,
        pictureUrl: currentUser.value.pictureUrl || null
      });

      // 保持相容性
      item.assignedTo = users[0]?.userId || null;
      item.assignedUserName = users[0]?.displayName || null;
      item.assignedUserPicture = users[0]?.pictureUrl || null;

      persistData();
    }

    // 取消認領 (可取消自己，或指定取消某人)
    function unclaimItem(item, targetUserId = null) {
      const uidToCancel = targetUserId || currentUser.value.userId;
      let users = normalizeItemUsers(item);
      users = users.filter(u => u.userId !== uidToCancel);
      item.assignedUsers = users;

      item.assignedTo = users[0]?.userId || null;
      item.assignedUserName = users[0]?.displayName || null;
      item.assignedUserPicture = users[0]?.pictureUrl || null;

      persistData();
    }

    // 指定誰帶 Modal 操作
    function openAssignModal(item) {
      assigningItem.value = item;
      assignTargetName.value = '';
      showAssignModal.value = true;
    }

    function confirmAssignToUser() {
      if (!assignTargetName.value.trim() || !assigningItem.value) return;
      const targetName = assignTargetName.value.trim();
      const users = normalizeItemUsers(assigningItem.value);

      // 避免重複加入同名
      if (!users.some(u => u.displayName === targetName)) {
        users.push({
          userId: 'user_assigned_' + Date.now(),
          displayName: targetName,
          pictureUrl: null
        });
        assigningItem.value.assignedTo = users[0].userId;
        assigningItem.value.assignedUserName = users[0].displayName;
        persistData();
      }

      showAssignModal.value = false;
      assignTargetName.value = '';
    }

    // ----------------------------------------------------
    // 上車點檢邏輯 (Car Check)
    // ----------------------------------------------------
    function loadCarCheckFromStorage() {
      const saved = localStorage.getItem('camp_car_loaded_' + currentUser.value.userId);
      if (saved) {
        try {
          carLoadedMap.value = JSON.parse(saved);
        } catch (e) {}
      }
    }

    function saveCarCheckToStorage() {
      localStorage.setItem('camp_car_loaded_' + currentUser.value.userId, JSON.stringify(carLoadedMap.value));
    }

    function toggleCarLoaded(itemId) {
      carLoadedMap.value[itemId] = !carLoadedMap.value[itemId];
      saveCarCheckToStorage();
    }

    function isCarLoaded(itemId) {
      return !!carLoadedMap.value[itemId];
    }

    // 個人專屬上車檢查清單：包含「我負責帶的物品」與「個人自備物品」
    const myCarCheckItems = computed(() => {
      return items.value.filter(item => {
        return isClaimedByMe(item) || item.category === 'personal';
      });
    });

    const carCheckCount = computed(() => {
      const list = myCarCheckItems.value;
      const loaded = list.filter(i => isCarLoaded(i.id)).length;
      const percent = list.length > 0 ? Math.round((loaded / list.length) * 100) : 0;
      return {
        total: list.length,
        loaded,
        percent
      };
    });

    // ----------------------------------------------------
    // 行程時間自動推算演算法
    // ----------------------------------------------------
    // 時間加減工具 (HH:mm + 分鐘 = HH:mm)
    function addMinutesToTime(timeStr, minutesToAdd) {
      if (!timeStr || !timeStr.includes(':')) return '';
      const [h, m] = timeStr.split(':').map(Number);
      const totalMin = h * 60 + m + parseInt(minutesToAdd || 0);
      const newH = Math.floor(totalMin / 60) % 24;
      const newM = totalMin % 60;
      return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    }

    // 計算特定一天的各站到達與出發時間
    function getCalculatedStops(dayStops) {
      if (!dayStops || dayStops.length === 0) return [];
      const result = [];
      let currentDep = dayStops[0].depTime || "08:30";

      for (let i = 0; i < dayStops.length; i++) {
        const stop = dayStops[i];
        if (i === 0) {
          result.push({
            ...stop,
            arrivalTime: stop.depTime || "08:30",
            departureTime: stop.depTime || "08:30"
          });
        } else {
          const prevStop = dayStops[i - 1];
          const arrival = addMinutesToTime(currentDep, prevStop.travelMin || 0);
          const departure = addMinutesToTime(arrival, stop.stayMin || 0);
          currentDep = departure;
          result.push({
            ...stop,
            arrivalTime: arrival,
            departureTime: departure
          });
        }
      }
      return result;
    }

    // 開啟 Google Maps 導航
    function openMapNavigation(queryOrUrl) {
      if (!queryOrUrl) return;
      if (queryOrUrl.startsWith('http')) {
        window.open(queryOrUrl, '_blank');
      } else {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryOrUrl)}`;
        window.open(url, '_blank');
      }
    }

    // 行程管理操作
    function addTripDay() {
      const nextDayNum = tripDays.value.length + 1;
      tripDays.value.push({
        dayNumber: nextDayNum,
        title: `Day ${nextDayNum} - 精彩行程`,
        date: "",
        stops: [
          {
            id: `stop_${nextDayNum}_1`,
            name: "晨間出發",
            depTime: "09:00",
            travelMin: 30,
            stayMin: 0,
            note: "準備出發",
            mapQuery: ""
          }
        ]
      });
      persistData();
    }

    function removeTripDay(dayIndex) {
      if (confirm(`確定要刪除第 ${dayIndex + 1} 天的行程嗎？`)) {
        tripDays.value.splice(dayIndex, 1);
        persistData();
      }
    }

    function openAddStopModal(dayIndex) {
      currentDayIndex.value = dayIndex;
      editingStopIndex.value = -1;
      formStop.value = {
        name: "",
        depTime: "",
        travelMin: 30,
        stayMin: 60,
        note: "",
        mapQuery: ""
      };
      showStopModal.value = true;
    }

    function openEditStopModal(dayIndex, stopIndex) {
      currentDayIndex.value = dayIndex;
      editingStopIndex.value = stopIndex;
      const target = tripDays.value[dayIndex].stops[stopIndex];
      formStop.value = { ...target };
      showStopModal.value = true;
    }

    function saveStop() {
      if (!formStop.value.name.trim()) return;
      const day = tripDays.value[currentDayIndex.value];
      if (editingStopIndex.value >= 0) {
        day.stops[editingStopIndex.value] = { ...formStop.value };
      } else {
        day.stops.push({
          id: 'stop_' + Date.now(),
          ...formStop.value
        });
      }
      persistData();
      showStopModal.value = false;
    }

    function deleteStop(dayIndex, stopIndex) {
      if (confirm('確定刪除此行程地點？')) {
        tripDays.value[dayIndex].stops.splice(stopIndex, 1);
        persistData();
      }
    }

    // ----------------------------------------------------
    // 公費記帳邏輯
    // ----------------------------------------------------
    const totalExpense = computed(() => {
      return expenseList.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    });

    const perPersonExpense = computed(() => {
      const count = Number(splitPeopleCount.value) || 1;
      return Math.round(totalExpense.value / count);
    });

    function openAddExpenseModal() {
      formExpense.value = {
        title: "",
        amount: "",
        paidBy: currentUser.value.displayName,
        category: "食材採買"
      };
      showExpenseModal.value = true;
    }

    function saveExpense() {
      if (!formExpense.value.title.trim() || !formExpense.value.amount) return;
      expenseList.value.push({
        id: 'exp_' + Date.now(),
        title: formExpense.value.title.trim(),
        amount: Number(formExpense.value.amount),
        paidBy: formExpense.value.paidBy.trim() || currentUser.value.displayName,
        category: formExpense.value.category,
        date: new Date().toISOString().split('T')[0]
      });
      persistData();
      showExpenseModal.value = false;
    }

    function deleteExpense(expId) {
      if (confirm('確定刪除此筆記帳？')) {
        expenseList.value = expenseList.value.filter(e => e.id !== expId);
        persistData();
      }
    }

    // ----------------------------------------------------
    // 經常選擇常用功能
    // ----------------------------------------------------
    function loadFavoritesFromStorage() {
      const saved = localStorage.getItem('camp_favorites_list');
      if (saved) {
        try {
          favorites.value = JSON.parse(saved);
        } catch (e) {
          favorites.value = [];
        }
      } else {
        favorites.value = presetLibrary.value
          .filter(i => i.isDefaultFavorite)
          .map(i => i.name);
        saveFavoritesToStorage();
      }
    }

    function saveFavoritesToStorage() {
      localStorage.setItem('camp_favorites_list', JSON.stringify(favorites.value));
    }

    function isFavorite(itemName) {
      return favorites.value.includes(itemName);
    }

    function toggleFavorite(itemName) {
      if (isFavorite(itemName)) {
        favorites.value = favorites.value.filter(name => name !== itemName);
      } else {
        favorites.value.push(itemName);
      }
      saveFavoritesToStorage();
    }

    // ----------------------------------------------------
    // 選單快速勾選庫
    // ----------------------------------------------------
    function openQuickPicker(defaultTab = null) {
      if (!presetLibrary.value || presetLibrary.value.length === 0) {
        if (window.PRESET_ITEM_LIBRARY && window.PRESET_ITEM_LIBRARY.length > 0) {
          presetLibrary.value = window.PRESET_ITEM_LIBRARY;
        }
      }
      pickerCategory.value = (typeof defaultTab === 'string' && defaultTab) ? defaultTab : 'favorites';
      pickerSearch.value = '';
      selectedPickerItems.value = [];
      showQuickPickerModal.value = true;
    }

    function isInCurrentList(itemName) {
      return items.value.some(i => i.name.toLowerCase() === itemName.toLowerCase());
    }

    const filteredPickerLibrary = computed(() => {
      let list = presetLibrary.value;
      if (pickerCategory.value === 'favorites') {
        list = list.filter(item => isFavorite(item.name));
      } else if (pickerCategory.value !== 'all') {
        list = list.filter(item => item.category === pickerCategory.value);
      }

      if (pickerSearch.value.trim()) {
        const q = pickerSearch.value.trim().toLowerCase();
        list = list.filter(item => 
          item.name.toLowerCase().includes(q) || 
          (item.note && item.note.toLowerCase().includes(q))
        );
      }
      return list;
    });

    const groupedPickerLibrary = computed(() => {
      const itemsList = filteredPickerLibrary.value;
      if (itemsList.length === 0) return [];

      const groupsMap = new Map();
      for (const item of itemsList) {
        let groupKey = '';
        if (pickerCategory.value === 'favorites') {
          const catIcons = { equipment: '⛺ 用品裝備', food: '🥩 食材食品', consumables: '🧊 飲品消耗', personal: '🎒 個人自備' };
          groupKey = catIcons[item.category] || getCategoryName(item.category);
        } else {
          groupKey = item.subCategory || '其他項目';
        }

        if (!groupsMap.has(groupKey)) {
          groupsMap.set(groupKey, []);
        }
        groupsMap.get(groupKey).push(item);
      }

      const result = [];
      groupsMap.forEach((list, key) => {
        result.push({ title: key, items: list });
      });
      return result;
    });

    function isPickerItemSelected(item) {
      return selectedPickerItems.value.some(i => i.name === item.name);
    }

    function isGroupAllSelected(groupItems) {
      const available = groupItems.filter(item => !isInCurrentList(item.name));
      if (available.length === 0) return false;
      return available.every(item => isPickerItemSelected(item));
    }

    function toggleSelectGroup(groupItems) {
      const available = groupItems.filter(item => !isInCurrentList(item.name));
      if (available.length === 0) return;
      const allSelected = available.every(item => isPickerItemSelected(item));

      if (allSelected) {
        selectedPickerItems.value = selectedPickerItems.value.filter(
          item => !available.some(a => a.name === item.name)
        );
      } else {
        available.forEach(item => {
          if (!isPickerItemSelected(item)) {
            selectedPickerItems.value.push(item);
          }
        });
      }
    }

    function togglePickItem(item) {
      if (isInCurrentList(item.name)) return;
      const index = selectedPickerItems.value.findIndex(i => i.name === item.name);
      if (index >= 0) {
        selectedPickerItems.value.splice(index, 1);
      } else {
        selectedPickerItems.value.push(item);
      }
    }

    function addSelectedToCurrentList() {
      if (selectedPickerItems.value.length === 0) return;

      const newItems = selectedPickerItems.value.map(preset => ({
        id: 'item_pick_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: preset.name,
        category: preset.category,
        subCategory: preset.subCategory || '',
        quantity: preset.quantity || '',
        note: preset.note || '',
        assignedUsers: []
      }));

      items.value = [...items.value, ...newItems];
      persistData();
      const count = newItems.length;
      showQuickPickerModal.value = false;
      selectedPickerItems.value = [];
      alert(`✅ 已成功勾選加入 ${count} 項物品到清單！`);
    }

    function addAllFavoritesToCurrentList() {
      const favPresets = presetLibrary.value.filter(item => isFavorite(item.name) && !isInCurrentList(item.name));
      if (favPresets.length === 0) {
        alert('所有「經常選擇」的項目都已經在目前清單中囉！');
        return;
      }

      if (!confirm(`確定要將 ${favPresets.length} 項「經常選擇」項目一次加入清單嗎？`)) {
        return;
      }

      const newItems = favPresets.map(preset => ({
        id: 'item_fav_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: preset.name,
        category: preset.category,
        subCategory: preset.subCategory || '',
        quantity: preset.quantity || '',
        note: preset.note || '',
        assignedUsers: []
      }));

      items.value = [...items.value, ...newItems];
      persistData();
      showQuickPickerModal.value = false;
      alert(`🎉 已一次加入 ${newItems.length} 項常用備用清單！`);
    }

    // ----------------------------------------------------
    // 使用者身分初始化
    // ----------------------------------------------------
    function initUserIdentity() {
      const savedUser = localStorage.getItem('camp_user_profile');
      if (savedUser) {
        try {
          currentUser.value = JSON.parse(savedUser);
        } catch (e) {}
      } else {
        const randomId = 'user_' + Math.floor(Math.random() * 8999 + 1000);
        currentUser.value = {
          userId: randomId,
          displayName: '夥伴 ' + randomId.slice(-4),
          pictureUrl: ''
        };
        saveUserIdentity();
      }
    }

    function saveUserIdentity() {
      localStorage.setItem('camp_user_profile', JSON.stringify(currentUser.value));
    }

    function promptChangeName() {
      const newName = prompt('請輸入您的暱稱（認領物品時會顯示）：', currentUser.value.displayName);
      if (newName && newName.trim()) {
        currentUser.value.displayName = newName.trim();
        saveUserIdentity();
      }
    }

    // ----------------------------------------------------
    // LINE LIFF 初始化
    // ----------------------------------------------------
    async function initLiffIfConfigured() {
      const liffId = liffIdInput.value || window.APP_CONFIG?.LIFF_ID;
      if (!liffId || typeof liff === 'undefined') return;

      try {
        await liff.init({ liffId });
        isLineClient.value = liff.isInClient();

        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          currentUser.value.userId = profile.userId;
          currentUser.value.displayName = profile.displayName || currentUser.value.displayName;
          currentUser.value.pictureUrl = profile.pictureUrl || '';
          saveUserIdentity();
        }
      } catch (err) {
        console.warn('LINE LIFF 初始化提示:', err.message);
      }
    }

    // ----------------------------------------------------
    // Firebase 初始化與全功能即時同步
    // ----------------------------------------------------
    async function initFirebaseIfConfigured() {
      let cfg = null;
      try {
        if (firebaseConfigInput.value) {
          cfg = JSON.parse(firebaseConfigInput.value);
        } else if (window.APP_CONFIG?.FIREBASE_CONFIG?.apiKey) {
          cfg = window.APP_CONFIG.FIREBASE_CONFIG;
        }
      } catch (e) {
        console.warn('Firebase 設定解析失敗:', e);
      }

      if (!cfg || !cfg.apiKey || typeof firebase === 'undefined') {
        syncStatus.value = 'local';
        return;
      }

      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(cfg);
        }

        // 1. 優先嘗試 Realtime Database
        if (typeof firebase.database === 'function') {
          try {
            realtimeDb = firebase.database();
            rtdbRef = realtimeDb.ref('camping_event');
            rtdbRef.on('value', (snapshot) => {
              const data = snapshot.val();
              if (data) {
                syncStatus.value = 'cloud';
                if (data.items && Array.isArray(data.items)) {
                  items.value = data.items;
                  localStorage.setItem('camp_items_cache', JSON.stringify(data.items));
                }
                if (data.eventTitle) eventTitle.value = data.eventTitle;
                if (data.campSiteInfo) campSiteInfo.value = data.campSiteInfo;
                if (data.tripDays && Array.isArray(data.tripDays)) tripDays.value = data.tripDays;
                if (data.expenseList && Array.isArray(data.expenseList)) expenseList.value = data.expenseList;
                if (data.splitPeopleCount) splitPeopleCount.value = data.splitPeopleCount;
              } else {
                syncStatus.value = 'cloud';
                saveAllToFirebase();
              }
            }, (err) => {
              console.warn('Realtime Database 轉向 Firestore:', err.message);
              initFirestoreFallback();
            });
            return;
          } catch (e) {
            console.warn('Realtime Database 錯誤:', e);
          }
        }

        initFirestoreFallback();
      } catch (err) {
        console.warn('Firebase 初始化失敗，使用本機模式:', err);
        syncStatus.value = 'local';
      }
    }

    function initFirestoreFallback() {
      try {
        if (typeof firebase.firestore !== 'function') return;
        firestoreDb = firebase.firestore();

        if (docUnsubscribe) docUnsubscribe();

        const docRef = firestoreDb.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC_ID);
        docUnsubscribe = docRef.onSnapshot((doc) => {
          if (doc.exists) {
            syncStatus.value = 'cloud';
            const data = doc.data();
            if (data.items && Array.isArray(data.items)) {
              items.value = data.items;
              localStorage.setItem('camp_items_cache', JSON.stringify(data.items));
            }
            if (data.eventTitle) eventTitle.value = data.eventTitle;
            if (data.campSiteInfo) campSiteInfo.value = data.campSiteInfo;
            if (data.tripDays && Array.isArray(data.tripDays)) tripDays.value = data.tripDays;
            if (data.expenseList && Array.isArray(data.expenseList)) expenseList.value = data.expenseList;
            if (data.splitPeopleCount) splitPeopleCount.value = data.splitPeopleCount;
          } else {
            syncStatus.value = 'cloud';
            saveAllToFirebase();
          }
        }, (err) => {
          console.warn('Firestore 監聽失敗:', err.message);
        });
      } catch (err) {
        console.warn('Firestore fallback 失敗:', err);
      }
    }

    function saveAllToFirebase() {
      const payload = {
        eventTitle: eventTitle.value,
        items: items.value,
        campSiteInfo: campSiteInfo.value,
        tripDays: tripDays.value,
        expenseList: expenseList.value,
        splitPeopleCount: splitPeopleCount.value,
        updatedAt: Date.now()
      };

      if (rtdbRef) {
        rtdbRef.set(payload).catch(e => console.error('RTDB 儲存失敗:', e));
      }
      if (firestoreDb) {
        firestoreDb.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC_ID).set(payload)
          .catch(e => console.error('Firestore 儲存失敗:', e));
      }
    }

    // ----------------------------------------------------
    // 資料持久化
    // ----------------------------------------------------
    function persistData() {
      localStorage.setItem('camp_items_cache', JSON.stringify(items.value));
      localStorage.setItem('camp_event_title', eventTitle.value);
      localStorage.setItem('camp_site_info', JSON.stringify(campSiteInfo.value));
      localStorage.setItem('camp_trip_days', JSON.stringify(tripDays.value));
      localStorage.setItem('camp_expense_list', JSON.stringify(expenseList.value));
      localStorage.setItem('camp_split_count', splitPeopleCount.value);

      if (syncStatus.value === 'cloud') {
        saveAllToFirebase();
      }
    }

    function loadItemsFromLocal() {
      const cached = localStorage.getItem('camp_items_cache');
      if (cached) {
        try { items.value = JSON.parse(cached); } catch (e) {}
      }
      const title = localStorage.getItem('camp_event_title');
      if (title) eventTitle.value = title;

      const cachedSite = localStorage.getItem('camp_site_info');
      if (cachedSite) {
        try { campSiteInfo.value = JSON.parse(cachedSite); } catch (e) {}
      }

      const cachedDays = localStorage.getItem('camp_trip_days');
      if (cachedDays) {
        try { tripDays.value = JSON.parse(cachedDays); } catch (e) {}
      }

      const cachedExp = localStorage.getItem('camp_expense_list');
      if (cachedExp) {
        try { expenseList.value = JSON.parse(cachedExp); } catch (e) {}
      }

      const cachedCount = localStorage.getItem('camp_split_count');
      if (cachedCount) splitPeopleCount.value = Number(cachedCount) || 4;
    }

    // ----------------------------------------------------
    // 新增 / 編輯 / 刪除物品
    // ----------------------------------------------------
    function openAddModal() {
      editingItem.value = null;
      formItem.value = {
        category: currentCategory.value !== 'all' ? currentCategory.value : 'equipment',
        name: '',
        quantity: '',
        note: ''
      };
      showItemModal.value = true;
    }

    function openEditModal(item) {
      editingItem.value = item;
      formItem.value = {
        category: item.category,
        name: item.name,
        quantity: item.quantity || '',
        note: item.note || ''
      };
      showItemModal.value = true;
    }

    function saveItem() {
      if (!formItem.value.name.trim()) return;

      if (editingItem.value) {
        editingItem.value.category = formItem.value.category;
        editingItem.value.name = formItem.value.name.trim();
        editingItem.value.quantity = formItem.value.quantity.trim();
        editingItem.value.note = formItem.value.note.trim();
      } else {
        const newItem = {
          id: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          category: formItem.value.category,
          name: formItem.value.name.trim(),
          quantity: formItem.value.quantity.trim(),
          note: formItem.value.note.trim(),
          assignedUsers: []
        };
        items.value.unshift(newItem);
      }

      persistData();
      showItemModal.value = false;
    }

    function deleteItem(itemId) {
      if (confirm('確定要刪除此攜帶項目嗎？')) {
        items.value = items.value.filter(i => i.id !== itemId);
        persistData();
      }
    }

    function clearAllData() {
      if (confirm('⚠️ 警告：這將會清空目前所有的攜帶清單，確定要重置嗎？')) {
        items.value = [];
        persistData();
        showSettingsModal.value = false;
      }
    }

    // ----------------------------------------------------
    // 計算屬性與過濾器
    // ----------------------------------------------------
    const filteredItems = computed(() => {
      return items.value.filter(item => {
        if (currentCategory.value !== 'all' && item.category !== currentCategory.value) {
          return false;
        }
        if (filterUnclaimedOnly.value) {
          const users = normalizeItemUsers(item);
          if (users.length > 0) return false;
        }
        if (filterMyItemsOnly.value) {
          if (!isClaimedByMe(item)) return false;
        }
        if (searchQuery.value.trim()) {
          const q = searchQuery.value.trim().toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const users = normalizeItemUsers(item);
          const matchUser = users.some(u => u.displayName.toLowerCase().includes(q));
          const matchNote = item.note && item.note.toLowerCase().includes(q);
          return matchName || matchUser || matchNote;
        }
        return true;
      });
    });

    const claimedCount = computed(() => {
      return items.value.filter(i => normalizeItemUsers(i).length > 0).length;
    });

    const progressPercent = computed(() => {
      if (items.value.length === 0) return 0;
      return Math.round((claimedCount.value / items.value.length) * 100);
    });

    function getCategoryCount(catId) {
      if (catId === 'all') return items.value.length;
      return items.value.filter(i => i.category === catId).length;
    }

    function getCategoryName(catId) {
      const map = {
        equipment: '用品裝備',
        food: '食材食品',
        consumables: '飲品消耗',
        personal: '個人自備'
      };
      return map[catId] || '一般';
    }

    function getCategoryBadgeClass(catId) {
      const map = {
        equipment: 'bg-orange-100 text-orange-800',
        food: 'bg-red-100 text-red-800',
        consumables: 'bg-blue-100 text-blue-800',
        personal: 'bg-purple-100 text-purple-800'
      };
      return map[catId] || 'bg-stone-100 text-stone-700';
    }

    // ----------------------------------------------------
    // 摘要產生與 LINE 聊天室分享
    // ----------------------------------------------------
    const generatedSummaryText = computed(() => {
      let text = `🏕️ 【${eventTitle.value}】\n`;
      text += `📍 營地：${campSiteInfo.value.name}\n`;
      text += `📅 認領進度：${claimedCount.value} / ${items.value.length} (${progressPercent.value}%)\n`;
      text += `=========================\n`;

      const catOrder = [
        { id: 'equipment', title: '⛺ 【用品裝備】' },
        { id: 'food', title: '🥩 【食材食品】' },
        { id: 'consumables', title: '🧊 【飲品與消耗品】' },
        { id: 'personal', title: '🎒 【個人自備】' }
      ];

      for (const cat of catOrder) {
        const catItems = items.value.filter(i => i.category === cat.id);
        if (catItems.length > 0) {
          text += `\n${cat.title}\n`;
          for (const item of catItems) {
            const qty = item.quantity ? ` (${item.quantity})` : '';
            const users = normalizeItemUsers(item);
            let status = '❌ [待認領]';
            if (users.length > 0) {
              status = `👉 [${users.map(u => u.displayName).join('、')}] 帶`;
            }
            text += `• ${item.name}${qty} ：${status}\n`;
          }
        }
      }

      text += `=========================\n`;
      text += `🔗 線上協同認領與行程：\n${window.location.href.split('?')[0]}`;
      return text;
    });

    function shareToLineOrExport() {
      copyButtonText.value = '複製清單文字';
      showExportModal.value = true;
    }

    async function copySummaryText() {
      try {
        await navigator.clipboard.writeText(generatedSummaryText.value);
        copyButtonText.value = '✅ 已複製到剪貼簿！';
        setTimeout(() => {
          copyButtonText.value = '複製清單文字';
        }, 2000);
      } catch (err) {
        alert('請手動選取文字進行複製！');
      }
    }

    async function sendSummaryToLineChat() {
      if (typeof liff === 'undefined' || !liff.isInClient()) {
        alert('請在 LINE App 內開啟此網頁方可直接發送回聊天室！');
        return;
      }

      try {
        await liff.sendMessages([
          {
            type: 'text',
            text: generatedSummaryText.value
          }
        ]);
        alert('✅ 摘要已成功發送至 LINE 聊天室！');
        showExportModal.value = false;
      } catch (err) {
        console.error('發送至 LINE 失敗:', err);
        alert('發送失敗：' + (err.message || '請確認 LINE 授權'));
      }
    }

    // ----------------------------------------------------
    // 設定儲存與載入
    // ----------------------------------------------------
    function loadSettingsFromStorage() {
      eventTitleInput.value = localStorage.getItem('camp_event_title') || window.APP_CONFIG?.DEFAULT_EVENT_TITLE || '🌲 歡樂露營出遊備忘錄';
      liffIdInput.value = localStorage.getItem('camp_liff_id') || window.APP_CONFIG?.LIFF_ID || '';
      firebaseConfigInput.value = localStorage.getItem('camp_firebase_cfg') || (window.APP_CONFIG?.FIREBASE_CONFIG?.apiKey ? JSON.stringify(window.APP_CONFIG.FIREBASE_CONFIG, null, 2) : '');
    }

    function saveSettings() {
      if (eventTitleInput.value) {
        eventTitle.value = eventTitleInput.value;
        localStorage.setItem('camp_event_title', eventTitle.value);
      }
      if (liffIdInput.value) {
        localStorage.setItem('camp_liff_id', liffIdInput.value.trim());
      }
      if (firebaseConfigInput.value) {
        localStorage.setItem('camp_firebase_cfg', firebaseConfigInput.value.trim());
      }
      persistData();
      showSettingsModal.value = false;
      alert('設定已儲存！頁面即將重新整理以套用新設定。');
      window.location.reload();
    }

    return {
      mainView,
      categories,
      itemCategoryOptions,
      pickerTabs,
      eventTitle,
      currentCategory,
      searchQuery,
      filterUnclaimedOnly,
      filterMyItemsOnly,
      syncStatus,
      isLineClient,
      currentUser,
      items,
      filteredItems,
      claimedCount,
      progressPercent,
      getCategoryCount,
      getCategoryName,
      getCategoryBadgeClass,
      promptChangeName,
      // 多人認領與指派
      normalizeItemUsers,
      isClaimedByMe,
      claimItem,
      unclaimItem,
      showAssignModal,
      assigningItem,
      assignTargetName,
      openAssignModal,
      confirmAssignToUser,
      // 上車點檢
      myCarCheckItems,
      carCheckCount,
      isCarLoaded,
      toggleCarLoaded,
      // 行程與營地
      campSiteInfo,
      tripDays,
      getCalculatedStops,
      openMapNavigation,
      addTripDay,
      removeTripDay,
      showStopModal,
      currentDayIndex,
      editingStopIndex,
      formStop,
      openAddStopModal,
      openEditStopModal,
      saveStop,
      deleteStop,
      // 記帳
      expenseList,
      totalExpense,
      splitPeopleCount,
      perPersonExpense,
      showExpenseModal,
      formExpense,
      openAddExpenseModal,
      saveExpense,
      deleteExpense,
      // 彈窗
      showItemModal,
      editingItem,
      formItem,
      openAddModal,
      openEditModal,
      saveItem,
      deleteItem,
      clearAllData,
      showExportModal,
      generatedSummaryText,
      copyButtonText,
      shareToLineOrExport,
      copySummaryText,
      sendSummaryToLineChat,
      showSettingsModal,
      eventTitleInput,
      liffIdInput,
      firebaseConfigInput,
      saveSettings,
      // 常用與快速勾選
      favorites,
      isFavorite,
      toggleFavorite,
      showQuickPickerModal,
      pickerCategory,
      pickerSearch,
      selectedPickerItems,
      openQuickPicker,
      filteredPickerLibrary,
      groupedPickerLibrary,
      isGroupAllSelected,
      toggleSelectGroup,
      isInCurrentList,
      isPickerItemSelected,
      togglePickItem,
      addSelectedToCurrentList,
      addAllFavoritesToCurrentList
    };
  }
}).mount('#app');
