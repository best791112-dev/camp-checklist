/**
 * 露營出遊攜帶備忘錄 - 核心邏輯
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

    // Modals
    const showItemModal = ref(false);
    const editingItem = ref(null);
    const formItem = ref({
      category: 'equipment',
      name: '',
      quantity: '',
      note: ''
    });

    const showExportModal = ref(false);
    const copyButtonText = ref('複製清單文字');

    // 設定 Modal 相關
    const showSettingsModal = ref(false);
    const eventTitleInput = ref('');
    const liffIdInput = ref('');
    const firebaseConfigInput = ref('');

    // Firebase Firestore 參考
    let firestoreDb = null;
    let docUnsubscribe = null;
    const FIRESTORE_COLLECTION = 'camping_events';
    const FIRESTORE_DOC_ID = 'active_list';

    // ----------------------------------------------------
    // 初始化生命週期
    // ----------------------------------------------------
    onMounted(async () => {
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
        } else if (liff.isInClient()) {
          // 在 LINE 內部環境若未登入可嘗試自動登入
          // liff.login();
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

        // 即時監聽 Firestore 文件變化 (多人多裝置連線)
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
            // 首次建立文件
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
    // 資料持久化 (同步寫入 Cloud 或 LocalStorage)
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
    // 認領與取消認領邏輯
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
        // 更新現有項目
        editingItem.value.category = formItem.value.category;
        editingItem.value.name = formItem.value.name.trim();
        editingItem.value.quantity = formItem.value.quantity.trim();
        editingItem.value.note = formItem.value.note.trim();
      } else {
        // 新增項目
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

    function importDefaultItems() {
      if (!window.DEFAULT_CAMPING_ITEMS || window.DEFAULT_CAMPING_ITEMS.length === 0) return;
      if (items.value.length > 0 && !confirm('匯入預設範本將會把常見裝備與食材追加到清單中，確定匯入嗎？')) {
        return;
      }

      // 產生新 ID 避免衝突
      const newItems = window.DEFAULT_CAMPING_ITEMS.map(it => ({
        ...it,
        id: 'item_imp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
      }));

      items.value = [...items.value, ...newItems];
      persistData();
      alert(`已成功匯入 ${newItems.length} 項常備裝備與食材！`);
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
        // 類別過濾
        if (currentCategory.value !== 'all' && item.category !== currentCategory.value) {
          return false;
        }
        // 只看未認領
        if (filterUnclaimedOnly.value && item.assignedTo) {
          return false;
        }
        // 關鍵字搜尋
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
      importDefaultItems,
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
      saveSettings
    };
  }
}).mount('#app');
