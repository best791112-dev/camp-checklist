/**
 * 露營出遊攜帶備忘錄 - 核心邏輯
 * 支援選單快速勾選、經常選擇（常用收藏）與多人即時同步
 */

const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
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

    // 選單庫分類（含 ⭐ 經常選擇）
    const pickerTabs = [
      { id: 'favorites', name: '經常選擇', icon: '⭐' },
      { id: 'equipment', name: '用品裝備', icon: '⛺' },
      { id: 'food', name: '食材食品', icon: '🥩' },
      { id: 'consumables', name: '飲品消耗', icon: '🧊' },
      { id: 'personal', name: '個人自備', icon: '🎒' }
    ];

    // 狀態變數
    const eventTitle = ref(window.APP_CONFIG?.DEFAULT_EVENT_TITLE || "🌲 歡樂露營出遊備忘錄");
    const currentCategory = ref('all');
    const searchQuery = ref('');
    const filterUnclaimedOnly = ref(false);
    const syncStatus = ref('local'); // 'local' | 'cloud'
    const isLineClient = ref(false);

    // 當前使用者
    const currentUser = ref({
      userId: 'user_' + Math.floor(Math.random() * 10000),
      displayName: '露營夥伴',
      pictureUrl: ''
    });

    // 清單資料
    const items = ref([]);

    // 經常選擇 / 常用項目收藏庫 (存放物品名稱陣列)
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

    // 匯出摘要 Modal
    const showExportModal = ref(false);
    const copyButtonText = ref('複製清單文字');

    // 系統設定 Modal
    const showSettingsModal = ref(false);
    const eventTitleInput = ref('');
    const liffIdInput = ref('');
    const firebaseConfigInput = ref('');

    // Firebase Firestore 參考
    let firestoreDb = null;
    let docUnsubscribe = null;
    const FIRESTORE_COLLECTION = 'camping_events';
    const FIRESTORE_DOC_ID = 'active_list';

    // 預設物品庫
    const presetLibrary = ref(window.PRESET_ITEM_LIBRARY || []);

    // ----------------------------------------------------
    // 初始化生命週期
    // ----------------------------------------------------
    onMounted(async () => {
      loadFavoritesFromStorage();
      loadSettingsFromStorage();
      initUserIdentity();
      await initFirebaseIfConfigured();
      await initLiffIfConfigured();

      // 若雲端或本地均為空，預設填入範本
      if (items.value.length === 0) {
        loadItemsFromLocal();
        if (items.value.length === 0 && window.DEFAULT_CAMPING_ITEMS) {
          items.value = JSON.parse(JSON.stringify(window.DEFAULT_CAMPING_ITEMS));
          persistData();
        }
      }
    });

    // ----------------------------------------------------
    // 經常選擇 (常用清單) 邏輯
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
        // 預設常用項目：取自 PRESET_ITEM_LIBRARY 中的 isDefaultFavorite
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
    // 快速勾選庫 (Quick Picker)
    // ----------------------------------------------------
    function openQuickPicker(defaultTab = null) {
      pickerCategory.value = defaultTab || (currentCategory.value !== 'all' ? currentCategory.value : 'favorites');
      pickerSearch.value = '';
      selectedPickerItems.value = [];
      showQuickPickerModal.value = true;
    }

    function isInCurrentList(itemName) {
      return items.value.some(i => i.name.toLowerCase() === itemName.toLowerCase());
    }

    const filteredPickerLibrary = computed(() => {
      let list = presetLibrary.value;

      // 依頁籤過濾
      if (pickerCategory.value === 'favorites') {
        list = list.filter(item => isFavorite(item.name));
      } else if (pickerCategory.value !== 'all') {
        list = list.filter(item => item.category === pickerCategory.value);
      }

      // 搜尋關鍵字
      if (pickerSearch.value.trim()) {
        const q = pickerSearch.value.trim().toLowerCase();
        list = list.filter(item => 
          item.name.toLowerCase().includes(q) || 
          (item.note && item.note.toLowerCase().includes(q))
        );
      }

      return list;
    });

    function isPickerItemSelected(item) {
      return selectedPickerItems.value.some(i => i.name === item.name);
    }

    function togglePickItem(item) {
      if (isInCurrentList(item.name)) return; // 已在清單中不可重複選

      const index = selectedPickerItems.value.findIndex(i => i.name === item.name);
      if (index >= 0) {
        selectedPickerItems.value.splice(index, 1);
      } else {
        selectedPickerItems.value.push(item);
      }
    }

    function selectAllAvailableInTab() {
      const available = filteredPickerLibrary.value.filter(item => !isInCurrentList(item.name));
      const allSelected = available.every(item => isPickerItemSelected(item));

      if (allSelected) {
        // 取消全選
        selectedPickerItems.value = selectedPickerItems.value.filter(
          item => !available.some(a => a.name === item.name)
        );
      } else {
        // 全選未加入的項目
        available.forEach(item => {
          if (!isPickerItemSelected(item)) {
            selectedPickerItems.value.push(item);
          }
        });
      }
    }

    function addSelectedToCurrentList() {
      if (selectedPickerItems.value.length === 0) return;

      const newItems = selectedPickerItems.value.map(preset => ({
        id: 'item_pick_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: preset.name,
        category: preset.category,
        quantity: preset.quantity || '',
        note: preset.note || '',
        assignedTo: null,
        assignedUserName: null,
        assignedUserPicture: null
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

      if (!confirm(`確定要將 ${favPresets.length} 項「經常選擇」的常用項目一次加入清單嗎？`)) {
        return;
      }

      const newItems = favPresets.map(preset => ({
        id: 'item_fav_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: preset.name,
        category: preset.category,
        quantity: preset.quantity || '',
        note: preset.note || '',
        assignedTo: null,
        assignedUserName: null,
        assignedUserPicture: null
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
    // Firebase 初始化與即時同步
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
        firestoreDb = firebase.firestore();
        syncStatus.value = 'cloud';

        if (docUnsubscribe) docUnsubscribe();

        const docRef = firestoreDb.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC_ID);
        docUnsubscribe = docRef.onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data();
            if (data.items && Array.isArray(data.items)) {
              items.value = data.items;
              localStorage.setItem('camp_items_cache', JSON.stringify(data.items));
            }
            if (data.eventTitle) {
              eventTitle.value = data.eventTitle;
            }
          } else {
            docRef.set({
              eventTitle: eventTitle.value,
              items: items.value.length ? items.value : window.DEFAULT_CAMPING_ITEMS || [],
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          }
        }, (err) => {
          console.error('Firestore 即時監聽錯誤:', err);
          syncStatus.value = 'local';
        });

      } catch (err) {
        console.warn('Firebase 初始化失敗，使用本機模式:', err);
        syncStatus.value = 'local';
      }
    }

    // ----------------------------------------------------
    // 資料持久化
    // ----------------------------------------------------
    function persistData() {
      localStorage.setItem('camp_items_cache', JSON.stringify(items.value));
      localStorage.setItem('camp_event_title', eventTitle.value);

      if (syncStatus.value === 'cloud' && firestoreDb) {
        firestoreDb.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC_ID).set({
          eventTitle: eventTitle.value,
          items: items.value,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(err => {
          console.error('雲端儲存失敗:', err);
        });
      }
    }

    function loadItemsFromLocal() {
      const cached = localStorage.getItem('camp_items_cache');
      if (cached) {
        try {
          items.value = JSON.parse(cached);
        } catch (e) {}
      }
      const title = localStorage.getItem('camp_event_title');
      if (title) eventTitle.value = title;
    }

    // ----------------------------------------------------
    // 認領與取消認領
    // ----------------------------------------------------
    function claimItem(item, forceTakeover = false) {
      if (item.assignedTo && !forceTakeover) return;

      if (forceTakeover && !confirm(`此項目目前由「${item.assignedUserName}」認領，確定改由你負責帶嗎？`)) {
        return;
      }

      item.assignedTo = currentUser.value.userId;
      item.assignedUserName = currentUser.value.displayName;
      item.assignedUserPicture = currentUser.value.pictureUrl || null;
      persistData();
    }

    function unclaimItem(item) {
      item.assignedTo = null;
      item.assignedUserName = null;
      item.assignedUserPicture = null;
      persistData();
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
          assignedTo: null,
          assignedUserName: null,
          assignedUserPicture: null
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
        if (filterUnclaimedOnly.value && item.assignedTo) {
          return false;
        }
        if (searchQuery.value.trim()) {
          const q = searchQuery.value.trim().toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchUser = item.assignedUserName && item.assignedUserName.toLowerCase().includes(q);
          const matchNote = item.note && item.note.toLowerCase().includes(q);
          return matchName || matchUser || matchNote;
        }
        return true;
      });
    });

    const claimedCount = computed(() => {
      return items.value.filter(i => i.assignedTo).length;
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
      if (items.value.length === 0) return '目前尚無清單項目。';

      let text = `🏕️ 【${eventTitle.value}】\n`;
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
            const status = item.assignedUserName ? `👉 [${item.assignedUserName}] 帶` : `❌ [待認領]`;
            text += `• ${item.name}${qty} ：${status}\n`;
          }
        }
      }

      text += `=========================\n`;
      text += `🔗 線上即時認領清單：\n${window.location.href.split('?')[0]}`;
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
      categories,
      itemCategoryOptions,
      pickerTabs,
      eventTitle,
      currentCategory,
      searchQuery,
      filterUnclaimedOnly,
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
      claimItem,
      unclaimItem,
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
      isInCurrentList,
      isPickerItemSelected,
      togglePickItem,
      selectAllAvailableInTab,
      addSelectedToCurrentList,
      addAllFavoritesToCurrentList
    };
  }
}).mount('#app');
