/**
 * 露營出遊神隊友 - 核心邏輯 (多活動切換 + 密碼成員保護 + 旗艦完整版)
 */

const { createApp, ref, computed, onMounted, watch } = Vue;

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

    // ----------------------------------------------------
    // 多活動管理 (Multi-trip Management)
    // ----------------------------------------------------
    const allTrips = ref([
      {
        id: "trip_202610_default",
        title: "🌲 2026年10月 新竹尖石露營",
        date: "2026-10-24",
        passcode: "", // 選填通關密碼
        adminPassword: "8888", // 主揪/副主揪管理者密碼 (預設 8888)
        isLocked: false, // 是否出發前鎖定
        members: ["王小明", "李小華"], // 成員白名單
        claimedMembers: {}, // 成員認領綁定 (防重複選取)
        items: [],
        campSiteInfo: {
          name: "新竹尖石之美露營區",
          address: "新竹縣尖石鄉新樂村煤源段8鄰",
          mapUrl: "https://maps.google.com/?q=新竹尖石之美露營區",
          checkInTime: "13:00",
          checkOutTime: "11:00",
          note: "附吹風機、冷藏冷凍冰箱、草皮碎石營位"
        },
        tripDays: [
          {
            dayNumber: 1,
            title: "Day 1 - 採買與營地紮營",
            date: "2026-10-24",
            stops: [
              { id: "stop_1_1", name: "集合出發點 (台北交流道)", depTime: "08:30", travelMin: 60, stayMin: 15, note: "集合完畢準時出發", mapQuery: "台北交流道" },
              { id: "stop_1_2", name: "好市多採買食材 (新竹店)", depTime: "", travelMin: 50, stayMin: 90, note: "採買牛肉、海鮮與冰塊酒水", mapQuery: "好市多 新竹店" },
              { id: "stop_1_3", name: "抵達營地 (尖石之美露營區)", depTime: "", travelMin: 0, stayMin: 0, note: "搭帳篷、下午茶時光", mapQuery: "尖石之美露營區" }
            ]
          },
          {
            dayNumber: 2,
            title: "Day 2 - 拔營與內灣老街",
            date: "2026-10-25",
            stops: [
              { id: "stop_2_1", name: "營地早晨與撤帳拔營", depTime: "11:00", travelMin: 30, stayMin: 0, note: "11:00前退場", mapQuery: "尖石之美露營區" },
              { id: "stop_2_2", name: "內灣老街小吃午餐", depTime: "", travelMin: 70, stayMin: 120, note: "吃野薑花粽買伴手禮", mapQuery: "內灣老街" }
            ]
          }
        ],
        expenseList: [
          { id: "exp_1", title: "營位訂金 (2帳)", amount: 2400, paidBy: "王小明", category: "營位住宿", date: "2026-10-24" }
        ],
        splitPeopleCount: 4
      }
    ]);

    const currentTripId = ref("trip_202610_default");
    const showTripSwitchModal = ref(false);
    const showNewTripModal = ref(false);
    const formNewTrip = ref({
      title: "",
      date: "",
      passcode: "",
      adminPassword: "8888", // 預設管理者密碼
      importPresets: true
    });

    // ----------------------------------------------------
    // 👑 方案 A：雙管理員密碼驗證權限機制
    // ----------------------------------------------------
    const verifiedAdminTrips = ref([]); // 記錄已通過管理員密碼驗證的 tripId 陣列
    const showAdminLoginModal = ref(false);
    const adminPasswordInput = ref('');
    const adminLoginMessage = ref('');
    let pendingAdminAction = null;

    function loadVerifiedAdminsFromStorage() {
      try {
        const saved = localStorage.getItem('camp_verified_admin_trips');
        if (saved) {
          verifiedAdminTrips.value = JSON.parse(saved);
        } else {
          // 預設將初始範例行程認證為管理者，方便使用者直接試用體驗
          verifiedAdminTrips.value = ["trip_202610_default"];
          saveVerifiedAdminsToStorage();
        }
      } catch (e) {
        verifiedAdminTrips.value = ["trip_202610_default"];
      }
    }

    function saveVerifiedAdminsToStorage() {
      try {
        localStorage.setItem('camp_verified_admin_trips', JSON.stringify(verifiedAdminTrips.value));
      } catch (e) {}
    }

    function setTripAdminVerified(tripId, isVerified) {
      if (isVerified) {
        if (!verifiedAdminTrips.value.includes(tripId)) {
          verifiedAdminTrips.value.push(tripId);
        }
      } else {
        verifiedAdminTrips.value = verifiedAdminTrips.value.filter(id => id !== tripId);
      }
      saveVerifiedAdminsToStorage();
    }

    // 當前活動是否具有管理者身分 (主揪或副主揪)
    const isCurrentTripAdmin = computed(() => {
      return verifiedAdminTrips.value.includes(currentTripId.value);
    });

    // 呼叫需要管理權限的操作。若非管理員則彈出密碼輸入彈窗
    function requireAdminPermission(actionDescription, callback) {
      if (isCurrentTripAdmin.value) {
        if (typeof callback === 'function') callback();
        return true;
      }
      adminLoginMessage.value = actionDescription ? `操作「${actionDescription}」需要主揪或副主揪管理權限，請輸入管理者密碼：` : '請輸入本活動管理者密碼：';
      adminPasswordInput.value = '';
      pendingAdminAction = callback;
      showAdminLoginModal.value = true;
      return false;
    }

    function openAdminLoginModal(actionDescription = '登入管理者後台') {
      adminLoginMessage.value = `欲進入本活動後台，請輸入管理者密碼：`;
      adminPasswordInput.value = '';
      pendingAdminAction = null;
      showAdminLoginModal.value = true;
    }

    function verifyAdminPassword() {
      const correctPass = currentTrip.value?.adminPassword || "8888";
      if (!adminPasswordInput.value.trim()) {
        alert('請輸入管理者密碼！');
        return;
      }
      if (adminPasswordInput.value.trim() === correctPass) {
        setTripAdminVerified(currentTripId.value, true);
        showAdminLoginModal.value = false;
        alert(`🎉 驗證成功！您現在是「${currentTrip.value?.title}」的管理者 (主揪/副主揪)！\n已解鎖後台設定、鎖定清單、成員管理與清空重置權限。`);
        if (typeof pendingAdminAction === 'function') {
          const cb = pendingAdminAction;
          pendingAdminAction = null;
          cb();
        }
      } else {
        alert('❌ 管理者密碼錯誤！若非主揪請向開團主揪索取密碼。');
      }
    }

    function logoutAdmin() {
      if (confirm(`確定要登出目前活動「${currentTrip.value?.title}」的管理者身分，切換為【普通團員】視角嗎？`)) {
        setTripAdminVerified(currentTripId.value, false);
        alert('👤 已切換為普通團員視角。');
      }
    }

    function openSettingsWithAdminCheck() {
      requireAdminPermission('開啟活動後台設定', () => {
        showSettingsModal.value = true;
      });
    }

    // 當前選中的活動物件 (雙向綁定)
    const currentTrip = computed(() => {
      let t = allTrips.value.find(x => x.id === currentTripId.value);
      if (!t && allTrips.value.length > 0) {
        currentTripId.value = allTrips.value[0].id;
        t = allTrips.value[0];
      }
      return t || allTrips.value[0];
    });

    // 常用捷徑參考當前活動
    const items = computed({
      get: () => currentTrip.value ? currentTrip.value.items : [],
      set: (val) => { if (currentTrip.value) currentTrip.value.items = val; }
    });

    const campSiteInfo = computed({
      get: () => currentTrip.value?.campSiteInfo || {},
      set: (val) => { if (currentTrip.value) currentTrip.value.campSiteInfo = val; }
    });

    const tripDays = computed({
      get: () => currentTrip.value?.tripDays || [],
      set: (val) => { if (currentTrip.value) currentTrip.value.tripDays = val; }
    });

    const expenseList = computed({
      get: () => currentTrip.value?.expenseList || [],
      set: (val) => { if (currentTrip.value) currentTrip.value.expenseList = val; }
    });

    const splitPeopleCount = computed({
      get: () => currentTrip.value?.splitPeopleCount || 4,
      set: (val) => { if (currentTrip.value) currentTrip.value.splitPeopleCount = Number(val) || 4; }
    });

    // 狀態變數
    const currentCategory = ref('all');
    const searchQuery = ref('');
    const filterUnclaimedOnly = ref(false);
    const filterMyItemsOnly = ref(false);
    const syncStatus = ref('local');
    const isLineClient = ref(false);

    // 當前使用者
    const currentUser = ref({
      userId: 'user_' + Math.floor(Math.random() * 10000),
      displayName: '露營夥伴',
      pictureUrl: ''
    });

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

    // 行程點 Modal
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

    // 記帳 Modal
    const showExpenseModal = ref(false);
    const formExpense = ref({
      title: "",
      amount: "",
      paidBy: "",
      category: "食材採買"
    });

    // 系統設定 Modal
    const showSettingsModal = ref(false);
    const newMemberInput = ref('');

    // 上車點檢狀態
    const carLoadedMap = ref({});

    // 匯出摘要
    const showExportModal = ref(false);
    const copyButtonText = ref('複製清單文字');

    // Firebase 參考
    let realtimeDb = null;
    let rtdbRef = null;
    let firestoreDb = null;
    let docUnsubscribe = null;
    const FIRESTORE_COLLECTION = 'camping_events';
    const FIRESTORE_DOC_ID = 'trips_root';

    const presetLibrary = ref(window.PRESET_ITEM_LIBRARY || []);

    // ----------------------------------------------------
    // 生命週期
    // ----------------------------------------------------
    onMounted(async () => {
      loadFavoritesFromStorage();
      loadCarCheckFromStorage();
      loadTripsFromLocal();
      loadVerifiedAdminsFromStorage();
      initUserIdentity();
      await initFirebaseIfConfigured();
      await initLiffIfConfigured();

      // 若目前活動 items 為空，預設匯入範本
      if (currentTrip.value && currentTrip.value.items.length === 0) {
        if (window.DEFAULT_CAMPING_ITEMS) {
          currentTrip.value.items = JSON.parse(JSON.stringify(window.DEFAULT_CAMPING_ITEMS));
          persistData();
        }
      }
    });

    // ----------------------------------------------------
    // 多活動管理操作
    // ----------------------------------------------------
    function switchTrip(tripId) {
      const target = allTrips.value.find(x => x.id === tripId);
      if (target && target.passcode) {
        const savedPass = sessionStorage.getItem('camp_pass_' + tripId);
        if (savedPass !== target.passcode) {
          const input = prompt(`🔒 本活動「${target.title}」設有通關密碼，請輸入：`);
          if (input !== target.passcode) {
            alert('❌ 密碼不正確，無法進入此活動！');
            return;
          }
          sessionStorage.setItem('camp_pass_' + tripId, input);
        }
      }
      currentTripId.value = tripId;
      localStorage.setItem('camp_current_trip_id', tripId);
      showTripSwitchModal.value = false;

      // 自動同步本活動之認領身分
      const claims = target?.claimedMembers || {};
      for (const name in claims) {
        if (claims[name]?.userId === currentUser.value.userId) {
          currentUser.value.displayName = name;
          saveUserIdentity();
          break;
        }
      }
    }

    function createNewTrip() {
      if (!formNewTrip.value.title.trim()) return;

      const newId = 'trip_' + Date.now();
      let initItems = [];
      if (formNewTrip.value.importPresets && window.DEFAULT_CAMPING_ITEMS) {
        initItems = JSON.parse(JSON.stringify(window.DEFAULT_CAMPING_ITEMS));
      }

      const adminPass = (formNewTrip.value.adminPassword && formNewTrip.value.adminPassword.trim()) ? formNewTrip.value.adminPassword.trim() : "8888";

      const newTrip = {
        id: newId,
        title: formNewTrip.value.title.trim(),
        date: formNewTrip.value.date || "",
        passcode: formNewTrip.value.passcode.trim(),
        adminPassword: adminPass, // 👑 主揪/副主揪管理密碼
        isLocked: false,
        members: [currentUser.value.displayName],
        claimedMembers: {},
        items: initItems,
        campSiteInfo: {
          name: "待定營地 / 飯店",
          address: "",
          mapUrl: "",
          checkInTime: "13:00",
          checkOutTime: "11:00",
          note: ""
        },
        tripDays: [
          {
            dayNumber: 1,
            title: "Day 1 - 出發行程",
            date: formNewTrip.value.date || "",
            stops: [
              { id: "stop_1_1", name: "集合出發", depTime: "08:30", travelMin: 60, stayMin: 0, note: "準時集合出發", mapQuery: "" }
            ]
          }
        ],
        expenseList: [],
        splitPeopleCount: 4
      };

      allTrips.value.push(newTrip);
      currentTripId.value = newId;

      // 👑 開團主揪自動獲得本活動之管理者授權
      setTripAdminVerified(newId, true);

      persistData();

      showNewTripModal.value = false;
      showTripSwitchModal.value = false;
      formNewTrip.value = { title: "", date: "", passcode: "", adminPassword: "8888", importPresets: true };
      alert(`🎉 活動「${newTrip.title}」建立成功！\n👑 您已自動成為本活動管理者。\n管理者密碼為：【${adminPass}】（副主揪輸入此密碼亦可共同管理）。`);
    }

    function deleteCurrentTrip(tripId) {
      if (allTrips.value.length <= 1) {
        alert('至少需保留一個活動！');
        return;
      }
      const t = allTrips.value.find(x => x.id === tripId);
      requireAdminPermission(`刪除活動「${t?.title || ''}」`, () => {
        if (confirm(`確定要刪除「${t?.title || '此活動'}」嗎？所有相關資料將會移除。`)) {
          allTrips.value = allTrips.value.filter(x => x.id !== tripId);
          currentTripId.value = allTrips.value[0].id;
          persistData();
        }
      });
    }

    // ----------------------------------------------------
    // 人員成員管理與防大亂
    // ----------------------------------------------------
    // ----------------------------------------------------
    // 人員成員管理與身分認領獨佔機制 (防大亂、防重複選取)
    // ----------------------------------------------------
    const showClaimMemberModal = ref(false);
    const customNewMemberName = ref('');

    // 當前使用者在目前活動中認領的名字
    const myClaimedName = computed(() => {
      const claims = currentTrip.value?.claimedMembers || {};
      for (const name in claims) {
        if (claims[name]?.userId === currentUser.value.userId) {
          return name;
        }
      }
      return null;
    });

    // 檢查某成員名稱是否已被任何人認領
    function isMemberClaimed(name) {
      const claims = currentTrip.value?.claimedMembers || {};
      return !!claims[name];
    }

    // 取得某成員名稱的認領者詳細資訊
    function getMemberClaimant(name) {
      const claims = currentTrip.value?.claimedMembers || {};
      return claims[name] || null;
    }

    // 檢查某成員是否被「其他人」認領了 (自己認領的除外)
    function isClaimedByOther(name) {
      const claims = currentTrip.value?.claimedMembers || {};
      const claimant = claims[name];
      return !!(claimant && claimant.userId !== currentUser.value.userId);
    }

    // 檢查某成員是否由「自己」認領
    function isClaimedByMeName(name) {
      const claims = currentTrip.value?.claimedMembers || {};
      const claimant = claims[name];
      return !!(claimant && claimant.userId === currentUser.value.userId);
    }

    // 認領身分/名字 (獨佔性：防重複認領)
    function claimMemberName(name) {
      if (!name || !name.trim() || !currentTrip.value) return;
      const targetName = name.trim();

      if (currentTrip.value.isLocked) {
        alert('⚠️ 目前活動已鎖定，無法變更成員身分認領！');
        return;
      }

      if (!currentTrip.value.claimedMembers) {
        currentTrip.value.claimedMembers = {};
      }

      // 檢查是否已被其他人認領
      const existing = currentTrip.value.claimedMembers[targetName];
      if (existing && existing.userId !== currentUser.value.userId) {
        alert(`❌ 名字「${targetName}」已被其他群友認領！每位成員只能認領一個獨立名字，請選擇您自己的名字。`);
        return;
      }

      // 若自己原本已認領了其他名字，先自動釋放舊名字
      for (const key in currentTrip.value.claimedMembers) {
        if (currentTrip.value.claimedMembers[key]?.userId === currentUser.value.userId) {
          delete currentTrip.value.claimedMembers[key];
        }
      }

      // 綁定新名字
      currentTrip.value.claimedMembers[targetName] = {
        userId: currentUser.value.userId,
        lineName: currentUser.value.displayName,
        claimedAt: new Date().toLocaleTimeString('zh-TW', { hour12: false })
      };

      // 將當前使用者 displayName 設為該名字
      currentUser.value.displayName = targetName;
      saveUserIdentity();

      // 確保該名字在 members 名單中
      if (!currentTrip.value.members) currentTrip.value.members = [];
      if (!currentTrip.value.members.includes(targetName)) {
        currentTrip.value.members.push(targetName);
      }

      persistData();
      showClaimMemberModal.value = false;
      alert(`🎉 認領成功！您現在在「${currentTrip.value.title}」的身分為【${targetName}】。\n其他人無法再重複選取此名字，主揪指定給您的物品將自動顯示於「上車點檢」！`);
    }

    // 解除認領 (本人可解除自己；主揪/副主揪管理者可重置他人)
    function releaseMemberClaim(name) {
      if (!currentTrip.value || !currentTrip.value.claimedMembers) return;
      if (currentTrip.value.isLocked) {
        alert('⚠️ 目前活動已鎖定，無法解除認領！');
        return;
      }

      // 若解除的是自己認領的名字，本人可直接解除
      if (name === myClaimedName.value) {
        if (confirm(`確定要解除您認領的名字「${name}」嗎？解除後可重新選取其他名字。`)) {
          delete currentTrip.value.claimedMembers[name];
          persistData();
          alert(`✅ 已解除「${name}」的認領。`);
        }
        return;
      }

      // 若解除的是「其他人」認領的名字，必須具有管理者權限
      requireAdminPermission(`重置他人認領（${name}）`, () => {
        if (confirm(`確定要強制解除「${name}」的認領綁定嗎？解除後該名字可重新被任何人選取。`)) {
          delete currentTrip.value.claimedMembers[name];
          persistData();
          alert(`✅ 已強制解除「${name}」的認領綁定。`);
        }
      });
    }

    // 自行新增名字並直接認領
    function addNewMemberAndClaim() {
      if (!customNewMemberName.value.trim() || !currentTrip.value) return;
      const newName = customNewMemberName.value.trim();
      customNewMemberName.value = '';

      if (!currentTrip.value.members) currentTrip.value.members = [];
      if (!currentTrip.value.members.includes(newName)) {
        currentTrip.value.members.push(newName);
      }

      claimMemberName(newName);
    }

    function addMember() {
      if (!newMemberInput.value.trim() || !currentTrip.value) return;
      requireAdminPermission('新增成員名單', () => {
        const name = newMemberInput.value.trim();
        if (!currentTrip.value.members) currentTrip.value.members = [];
        if (!currentTrip.value.members.includes(name)) {
          currentTrip.value.members.push(name);
          persistData();
        }
        newMemberInput.value = '';
      });
    }

    function removeMember(name) {
      if (!currentTrip.value || !currentTrip.value.members) return;
      requireAdminPermission(`移除成員「${name}」`, () => {
        if (confirm(`確定要從名單中移除「${name}」嗎？`)) {
          currentTrip.value.members = currentTrip.value.members.filter(m => m !== name);
          if (currentTrip.value.claimedMembers && currentTrip.value.claimedMembers[name]) {
            delete currentTrip.value.claimedMembers[name];
          }
          persistData();
        }
      });
    }

    function toggleLockTrip() {
      if (!currentTrip.value) return;
      const actionName = currentTrip.value.isLocked ? '解鎖活動清單' : '鎖定活動清單';
      requireAdminPermission(actionName, () => {
        currentTrip.value.isLocked = !currentTrip.value.isLocked;
        persistData();
        if (currentTrip.value.isLocked) {
          alert('🔒 清單已鎖定！出發前防止項目被誤刪或誤改。');
        } else {
          alert('🔓 清單已解鎖，現在可自由編輯。');
        }
      });
    }

    // ----------------------------------------------------
    // 多人共同認領機制 (assignedUsers)
    // ----------------------------------------------------
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

    function isClaimedByMe(item) {
      const users = normalizeItemUsers(item);
      const myName = myClaimedName.value || currentUser.value.displayName;
      return users.some(u => {
        return u.userId === currentUser.value.userId ||
               (u.displayName && u.displayName === currentUser.value.displayName) ||
               (myName && u.displayName === myName);
      });
    }

    function claimItem(item) {
      if (currentTrip.value?.isLocked) {
        alert('⚠️ 目前活動清單已被主揪鎖定，無法更改認領！');
        return;
      }

      // 如果尚未認領本團身分且本團有成員名單，友善提醒先認領名字
      if (!myClaimedName.value && currentTrip.value?.members?.length > 0) {
        if (confirm('💡 建議先認領您的出遊身分/名字，讓大家清楚知道是誰帶的。\n是否現在選擇您的名字？')) {
          showClaimMemberModal.value = true;
          return;
        }
      }

      const users = normalizeItemUsers(item);
      if (users.some(u => u.userId === currentUser.value.userId || u.displayName === currentUser.value.displayName)) return;

      users.push({
        userId: currentUser.value.userId,
        displayName: currentUser.value.displayName,
        pictureUrl: currentUser.value.pictureUrl || null
      });

      // 自動將使用者加入成員名單
      if (currentTrip.value?.members && !currentTrip.value.members.includes(currentUser.value.displayName)) {
        currentTrip.value.members.push(currentUser.value.displayName);
      }

      item.assignedTo = users[0]?.userId || null;
      item.assignedUserName = users[0]?.displayName || null;
      persistData();
    }

    function unclaimItem(item, targetUserIdOrName = null) {
      if (currentTrip.value?.isLocked) {
        alert('⚠️ 目前活動清單已被主揪鎖定，無法取消認領！');
        return;
      }
      const myName = myClaimedName.value || currentUser.value.displayName;
      let users = normalizeItemUsers(item);
      if (targetUserIdOrName) {
        users = users.filter(u => u.userId !== targetUserIdOrName && u.displayName !== targetUserIdOrName);
      } else {
        users = users.filter(u => u.userId !== currentUser.value.userId && u.displayName !== currentUser.value.displayName && u.displayName !== myName);
      }
      item.assignedUsers = users;

      item.assignedTo = users[0]?.userId || null;
      item.assignedUserName = users[0]?.displayName || null;
      persistData();
    }

    function openAssignModal(item) {
      assigningItem.value = item;
      assignTargetName.value = '';
      showAssignModal.value = true;
    }

    function selectQuickMember(name) {
      assignTargetName.value = name;
    }

    function confirmAssignToUser() {
      if (!assignTargetName.value.trim() || !assigningItem.value) return;
      const targetName = assignTargetName.value.trim();
      const users = normalizeItemUsers(assigningItem.value);

      if (!users.some(u => u.displayName === targetName)) {
        users.push({
          userId: 'user_' + Date.now(),
          displayName: targetName,
          pictureUrl: null
        });
        assigningItem.value.assignedTo = users[0].userId;
        assigningItem.value.assignedUserName = users[0].displayName;

        // 加到成員名單
        if (currentTrip.value?.members && !currentTrip.value.members.includes(targetName)) {
          currentTrip.value.members.push(targetName);
        }
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
        try { carLoadedMap.value = JSON.parse(saved); } catch (e) {}
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

    const myCarCheckItems = computed(() => {
      const list = items.value || [];
      return list.filter(item => {
        return isClaimedByMe(item) || item.category === 'personal';
      });
    });

    const carCheckCount = computed(() => {
      const list = myCarCheckItems.value;
      const loaded = list.filter(i => isCarLoaded(i.id)).length;
      const percent = list.length > 0 ? Math.round((loaded / list.length) * 100) : 0;
      return { total: list.length, loaded, percent };
    });

    // ----------------------------------------------------
    // 行程時間自動推算演算法
    // ----------------------------------------------------
    function addMinutesToTime(timeStr, minutesToAdd) {
      if (!timeStr || !timeStr.includes(':')) return '';
      const [h, m] = timeStr.split(':').map(Number);
      const totalMin = h * 60 + m + parseInt(minutesToAdd || 0);
      const newH = Math.floor(totalMin / 60) % 24;
      const newM = totalMin % 60;
      return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    }

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

    function openMapNavigation(queryOrUrl) {
      if (!queryOrUrl) return;
      if (queryOrUrl.startsWith('http')) {
        window.open(queryOrUrl, '_blank');
      } else {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryOrUrl)}`;
        window.open(url, '_blank');
      }
    }

    // ----------------------------------------------------
    // Google 地圖官方互動選點器 (Google Maps API + 圖釘拖曳)
    // ----------------------------------------------------
    const showMapPickerModal = ref(false);
    const mapPickerTarget = ref('stop'); // 'stop' or 'campsite'
    const mapSearchKeyword = ref('');
    const pickedCoords = ref({ lat: 23.7028, lng: 120.4312 }); // 預設台灣中心
    const pickedAddressName = ref('');
    let googleMapInstance = null;
    let googleMarkerInstance = null;

    function openMapPicker(target = 'stop') {
      mapPickerTarget.value = target;
      mapSearchKeyword.value = target === 'stop' ? (formStop.value.name || '') : (campSiteInfo.value.name || '');
      
      let currentQuery = target === 'stop' ? formStop.value.mapQuery : campSiteInfo.value.mapUrl;
      let initLat = 23.7028;
      let initLng = 120.4312;

      // 檢查是否已包含經緯度
      const match = currentQuery && currentQuery.match(/([-+]?\d+\.\d+)[,\s]+([-+]?\d+\.\d+)/);
      if (match) {
        initLat = parseFloat(match[1]);
        initLng = parseFloat(match[2]);
      }

      pickedCoords.value = { lat: initLat, lng: initLng };
      pickedAddressName.value = target === 'stop' ? (formStop.value.name || '已選取座標') : (campSiteInfo.value.name || '已選取座標');

      showMapPickerModal.value = true;

      // 在 DOM 更新後初始化 Google 地圖
      Vue.nextTick(() => {
        setTimeout(() => {
          initOrUpdateGoogleMap(initLat, initLng);
          if (mapSearchKeyword.value && !match) {
            searchGoogleMapLocation();
          }
        }, 180);
      });
    }

    function initOrUpdateGoogleMap(lat, lng) {
      const container = document.getElementById('googlePickerMap');
      if (!container || typeof google === 'undefined' || !google.maps) return;

      const center = { lat, lng };

      if (!googleMapInstance) {
        googleMapInstance = new google.maps.Map(container, {
          center: center,
          zoom: 16,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          gestureHandling: 'greedy' // 手機上單指滑動順暢
        });

        googleMarkerInstance = new google.maps.Marker({
          position: center,
          map: googleMapInstance,
          draggable: true,
          animation: google.maps.Animation.DROP,
          title: "可拖曳圖釘精確定位"
        });

        // 點擊地圖任意處放圖釘
        googleMapInstance.addListener('click', (e) => {
          const clickedLat = e.latLng.lat();
          const clickedLng = e.latLng.lng();
          googleMarkerInstance.setPosition(e.latLng);
          pickedCoords.value = { lat: clickedLat, lng: clickedLng };
          reverseGeocodeGoogle(clickedLat, clickedLng);
        });

        // 拖曳圖釘放開
        googleMarkerInstance.addListener('dragend', (e) => {
          const pos = googleMarkerInstance.getPosition();
          const draggedLat = pos.lat();
          const draggedLng = pos.lng();
          pickedCoords.value = { lat: draggedLat, lng: draggedLng };
          reverseGeocodeGoogle(draggedLat, draggedLng);
        });
      } else {
        googleMapInstance.setCenter(center);
        googleMapInstance.setZoom(16);
        if (googleMarkerInstance) {
          googleMarkerInstance.setPosition(center);
        }
        google.maps.event.trigger(googleMapInstance, 'resize');
      }
    }

    function reverseGeocodeGoogle(lat, lng) {
      if (typeof google === 'undefined' || !google.maps || !google.maps.Geocoder) return;
      const geocoder = new google.maps.Geocoder();
      pickedAddressName.value = '正在查詢 Google 地點資訊...';
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          pickedAddressName.value = results[0].formatted_address.replace(/台灣|台湾/, '').trim();
        } else {
          pickedAddressName.value = `座標 ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
      });
    }

    function searchGoogleMapLocation() {
      if (!mapSearchKeyword.value.trim() || typeof google === 'undefined' || !google.maps) return;
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: mapSearchKeyword.value.trim(), region: 'TW' }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          const lat = loc.lat();
          const lng = loc.lng();
          pickedCoords.value = { lat, lng };
          pickedAddressName.value = results[0].formatted_address.replace(/台灣|台湾/, '').trim();
          if (googleMapInstance && googleMarkerInstance) {
            googleMapInstance.setCenter(loc);
            googleMapInstance.setZoom(16);
            googleMarkerInstance.setPosition(loc);
          }
        } else {
          // 若直接搜尋無結果，嘗試開啟
          console.warn('Google 地圖未找到精確地址結果');
        }
      });
    }

    function openExternalGoogleMaps() {
      const q = mapSearchKeyword.value.trim() || (mapPickerTarget.value === 'stop' ? formStop.value.name : campSiteInfo.value.name) || '台灣';
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
      window.open(url, '_blank');
    }

    async function pasteFromClipboard() {
      try {
        const text = await navigator.clipboard.readText();
        if (text && (text.includes('http') || text.includes('maps') || text.includes('goo.gl'))) {
          if (mapPickerTarget.value === 'stop') {
            formStop.value.mapQuery = text.trim();
          } else {
            campSiteInfo.value.mapUrl = text.trim();
          }
          showMapPickerModal.value = false;
          alert('✅ 已成功自剪貼簿貼上 Google Maps 網址！');
        } else {
          const manual = prompt('請在此貼上您的 Google Maps 分享網址：', text || '');
          if (manual && manual.trim()) {
            if (mapPickerTarget.value === 'stop') formStop.value.mapQuery = manual.trim();
            else campSiteInfo.value.mapUrl = manual.trim();
            showMapPickerModal.value = false;
          }
        }
      } catch (err) {
        const manual = prompt('請在此貼上您的 Google Maps 分享網址：');
        if (manual && manual.trim()) {
          if (mapPickerTarget.value === 'stop') formStop.value.mapQuery = manual.trim();
          else campSiteInfo.value.mapUrl = manual.trim();
          showMapPickerModal.value = false;
        }
      }
    }

    function useCurrentLocationInPicker() {
      if (!navigator.geolocation) {
        alert('您的裝置不支援 GPS 定位');
        return;
      }
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        pickedCoords.value = { lat, lng };
        if (googleMapInstance && googleMarkerInstance) {
          const loc = new google.maps.LatLng(lat, lng);
          googleMapInstance.setCenter(loc);
          googleMapInstance.setZoom(16);
          googleMarkerInstance.setPosition(loc);
        }
        reverseGeocodeGoogle(lat, lng);
      }, (err) => {
        alert('無法取得目前位置，請確認定位權限是否開啟。');
      });
    }

    function useCurrentLocation(target = 'stop') {
      if (!navigator.geolocation) {
        alert('您的裝置不支援 GPS 定位');
        return;
      }
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        if (target === 'stop') {
          formStop.value.mapQuery = mapUrl;
          if (!formStop.value.name) formStop.value.name = '目前打卡位置';
        } else {
          campSiteInfo.value.mapUrl = mapUrl;
        }
        alert(`✅ 已成功帶入目前 GPS 精準座標：${lat}, ${lng}！`);
      }, (err) => {
        alert('無法取得目前位置，請確認定位權限是否開啟。');
      });
    }

    function confirmPickedLocation() {
      const lat = pickedCoords.value.lat.toFixed(6);
      const lng = pickedCoords.value.lng.toFixed(6);
      const googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

      if (mapPickerTarget.value === 'stop') {
        formStop.value.mapQuery = googleMapUrl;
        if (!formStop.value.name.trim() && pickedAddressName.value) {
          formStop.value.name = pickedAddressName.value;
        }
      } else {
        campSiteInfo.value.mapUrl = googleMapUrl;
        if (!campSiteInfo.value.name.trim() && pickedAddressName.value) {
          campSiteInfo.value.name = pickedAddressName.value;
        }
        if (!campSiteInfo.value.address && pickedAddressName.value) {
          campSiteInfo.value.address = pickedAddressName.value;
        }
      }

      showMapPickerModal.value = false;
    }

    function closeMapPicker() {
      showMapPickerModal.value = false;
    }

    function addTripDay() {
      if (!currentTrip.value) return;
      const nextDayNum = currentTrip.value.tripDays.length + 1;
      currentTrip.value.tripDays.push({
        dayNumber: nextDayNum,
        title: `Day ${nextDayNum} - 精彩行程`,
        date: "",
        stops: [
          { id: `stop_${nextDayNum}_1`, name: "出發", depTime: "09:00", travelMin: 30, stayMin: 0, note: "", mapQuery: "" }
        ]
      });
      persistData();
    }

    function removeTripDay(dayIndex) {
      if (!currentTrip.value || currentTrip.value.tripDays.length <= 1) return;
      if (confirm(`確定刪除第 ${dayIndex + 1} 天行程？`)) {
        currentTrip.value.tripDays.splice(dayIndex, 1);
        persistData();
      }
    }

    function openAddStopModal(dayIndex) {
      currentDayIndex.value = dayIndex;
      editingStopIndex.value = -1;
      formStop.value = { name: "", depTime: "", travelMin: 30, stayMin: 60, note: "", mapQuery: "" };
      showStopModal.value = true;
    }

    function openEditStopModal(dayIndex, stopIndex) {
      currentDayIndex.value = dayIndex;
      editingStopIndex.value = stopIndex;
      const target = currentTrip.value.tripDays[dayIndex].stops[stopIndex];
      formStop.value = { ...target };
      showStopModal.value = true;
    }

    function saveStop() {
      if (!formStop.value.name.trim() || !currentTrip.value) return;
      const day = currentTrip.value.tripDays[currentDayIndex.value];
      if (editingStopIndex.value >= 0) {
        day.stops[editingStopIndex.value] = { ...formStop.value };
      } else {
        day.stops.push({ id: 'stop_' + Date.now(), ...formStop.value });
      }
      persistData();
      showStopModal.value = false;
    }

    function deleteStop(dayIndex, stopIndex) {
      if (!currentTrip.value) return;
      if (confirm('確定刪除此行程地點？')) {
        currentTrip.value.tripDays[dayIndex].stops.splice(stopIndex, 1);
        persistData();
      }
    }

    // ----------------------------------------------------
    // 公費記帳邏輯
    // ----------------------------------------------------
    const totalExpense = computed(() => {
      const list = expenseList.value || [];
      return list.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
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
      if (!formExpense.value.title.trim() || !formExpense.value.amount || !currentTrip.value) return;
      currentTrip.value.expenseList.push({
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
      if (!currentTrip.value) return;
      if (confirm('確定刪除此筆記帳？')) {
        currentTrip.value.expenseList = currentTrip.value.expenseList.filter(e => e.id !== expId);
        persistData();
      }
    }

    // ----------------------------------------------------
    // 經常選擇常用功能
    // ----------------------------------------------------
    function loadFavoritesFromStorage() {
      const saved = localStorage.getItem('camp_favorites_list');
      if (saved) {
        try { favorites.value = JSON.parse(saved); } catch (e) { favorites.value = []; }
      } else {
        favorites.value = presetLibrary.value.filter(i => i.isDefaultFavorite).map(i => i.name);
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
      const list = items.value || [];
      return list.some(i => i.name.toLowerCase() === itemName.toLowerCase());
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
        list = list.filter(item => item.name.toLowerCase().includes(q) || (item.note && item.note.toLowerCase().includes(q)));
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
        selectedPickerItems.value = selectedPickerItems.value.filter(item => !available.some(a => a.name === item.name));
      } else {
        available.forEach(item => {
          if (!isPickerItemSelected(item)) selectedPickerItems.value.push(item);
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
      if (selectedPickerItems.value.length === 0 || !currentTrip.value) return;

      const newItems = selectedPickerItems.value.map(preset => ({
        id: 'item_pick_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: preset.name,
        category: preset.category,
        subCategory: preset.subCategory || '',
        quantity: preset.quantity || '',
        note: preset.note || '',
        assignedUsers: []
      }));

      currentTrip.value.items = [...currentTrip.value.items, ...newItems];
      persistData();
      const count = newItems.length;
      showQuickPickerModal.value = false;
      selectedPickerItems.value = [];
      alert(`✅ 已成功加入 ${count} 項物品！`);
    }

    function addAllFavoritesToCurrentList() {
      if (!currentTrip.value) return;
      const favPresets = presetLibrary.value.filter(item => isFavorite(item.name) && !isInCurrentList(item.name));
      if (favPresets.length === 0) {
        alert('常用項目已都在目前活動清單中！');
        return;
      }

      if (!confirm(`確定要將 ${favPresets.length} 項常用項目加入「${currentTrip.value.title}」？`)) return;

      const newItems = favPresets.map(preset => ({
        id: 'item_fav_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: preset.name,
        category: preset.category,
        subCategory: preset.subCategory || '',
        quantity: preset.quantity || '',
        note: preset.note || '',
        assignedUsers: []
      }));

      currentTrip.value.items = [...currentTrip.value.items, ...newItems];
      persistData();
      showQuickPickerModal.value = false;
      alert(`🎉 已一次加入 ${newItems.length} 項常用裝備食材！`);
    }

    // ----------------------------------------------------
    // 使用者身分初始化
    // ----------------------------------------------------
    function initUserIdentity() {
      const savedUser = localStorage.getItem('camp_user_profile');
      if (savedUser) {
        try { currentUser.value = JSON.parse(savedUser); } catch (e) {}
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
      const liffId = window.APP_CONFIG?.LIFF_ID;
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
    // Firebase 初始化與全功能即時同步 (含多活動同步)
    // ----------------------------------------------------
    async function initFirebaseIfConfigured() {
      const cfg = window.APP_CONFIG?.FIREBASE_CONFIG;
      if (!cfg || !cfg.apiKey || typeof firebase === 'undefined') {
        syncStatus.value = 'local';
        return;
      }

      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(cfg);
        }

        // 優先嘗試 Realtime Database
        if (typeof firebase.database === 'function') {
          try {
            realtimeDb = firebase.database();
            rtdbRef = realtimeDb.ref('camping_trips_data');
            rtdbRef.on('value', (snapshot) => {
              const data = snapshot.val();
              if (data && data.allTrips && Array.isArray(data.allTrips) && data.allTrips.length > 0) {
                syncStatus.value = 'cloud';
                allTrips.value = data.allTrips;
                if (data.currentTripId && allTrips.value.some(x => x.id === data.currentTripId)) {
                  currentTripId.value = data.currentTripId;
                }
                localStorage.setItem('camp_all_trips_cache', JSON.stringify(data.allTrips));
              } else {
                syncStatus.value = 'cloud';
                saveAllToFirebase();
              }
            }, (err) => {
              console.warn('Realtime Database 嘗試轉向 Firestore:', err.message);
              initFirestoreFallback();
            });
            return;
          } catch (e) {
            console.warn('Realtime Database 錯誤:', e);
          }
        }

        initFirestoreFallback();
      } catch (err) {
        console.warn('Firebase 初始化失敗:', err);
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
            if (data && data.allTrips && Array.isArray(data.allTrips) && data.allTrips.length > 0) {
              allTrips.value = data.allTrips;
              if (data.currentTripId && allTrips.value.some(x => x.id === data.currentTripId)) {
                currentTripId.value = data.currentTripId;
              }
              localStorage.setItem('camp_all_trips_cache', JSON.stringify(data.allTrips));
            }
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
        allTrips: allTrips.value,
        currentTripId: currentTripId.value,
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
      localStorage.setItem('camp_all_trips_cache', JSON.stringify(allTrips.value));
      localStorage.setItem('camp_current_trip_id', currentTripId.value);

      if (syncStatus.value === 'cloud') {
        saveAllToFirebase();
      }
    }

    function loadTripsFromLocal() {
      const cached = localStorage.getItem('camp_all_trips_cache');
      if (cached) {
        try {
          const list = JSON.parse(cached);
          if (Array.isArray(list) && list.length > 0) {
            // 確保所有活動均具有管理者密碼欄位 (預設 8888 相容舊快取)
            list.forEach(t => {
              if (!t.adminPassword) t.adminPassword = "8888";
            });
            allTrips.value = list;
          }
        } catch (e) {}
      }
      const curId = localStorage.getItem('camp_current_trip_id');
      if (curId && allTrips.value.some(x => x.id === curId)) {
        currentTripId.value = curId;
      }
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
      if (!formItem.value.name.trim() || !currentTrip.value) return;

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
        currentTrip.value.items.unshift(newItem);
      }

      persistData();
      showItemModal.value = false;
    }

    function deleteItem(itemId) {
      if (currentTrip.value?.isLocked) {
        alert('⚠️ 目前活動清單已被主揪鎖定，無法刪除！');
        return;
      }
      if (confirm('確定要刪除此攜帶項目嗎？')) {
        currentTrip.value.items = currentTrip.value.items.filter(i => i.id !== itemId);
        persistData();
      }
    }

    const eventTitle = computed(() => currentTrip.value?.title || '露營出遊神隊友');

    function saveSettings() {
      persistData();
      showSettingsModal.value = false;
      alert('✅ 設定已儲存並同步至雲端！');
    }

    function clearAllData() {
      requireAdminPermission('清空全團物品', () => {
        if (confirm('⚠️ 警告：這將會清空當前活動的所有物品，確定要重置嗎？')) {
          if (currentTrip.value) currentTrip.value.items = [];
          persistData();
          showSettingsModal.value = false;
        }
      });
    }

    // ----------------------------------------------------
    // 計算屬性與過濾器
    // ----------------------------------------------------
    const filteredItems = computed(() => {
      const list = items.value || [];
      return list.filter(item => {
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
      const list = items.value || [];
      return list.filter(i => normalizeItemUsers(i).length > 0).length;
    });

    const progressPercent = computed(() => {
      const list = items.value || [];
      if (list.length === 0) return 0;
      return Math.round((claimedCount.value / list.length) * 100);
    });

    function getCategoryCount(catId) {
      const list = items.value || [];
      if (catId === 'all') return list.length;
      return list.filter(i => i.category === catId).length;
    }

    function getCategoryName(catId) {
      const map = { equipment: '用品裝備', food: '食材食品', consumables: '飲品消耗', personal: '個人自備' };
      return map[catId] || '一般';
    }

    function getCategoryBadgeClass(catId) {
      const map = { equipment: 'bg-orange-100 text-orange-800', food: 'bg-red-100 text-red-800', consumables: 'bg-blue-100 text-blue-800', personal: 'bg-purple-100 text-purple-800' };
      return map[catId] || 'bg-stone-100 text-stone-700';
    }

    // ----------------------------------------------------
    // 摘要產生與 LINE 聊天室分享
    // ----------------------------------------------------
    const generatedSummaryText = computed(() => {
      const list = items.value || [];
      const title = currentTrip.value ? currentTrip.value.title : "露營備忘錄";
      let text = `🏕️ 【${title}】\n`;
      if (campSiteInfo.value?.name) text += `📍 營地：${campSiteInfo.value.name}\n`;
      text += `📅 認領進度：${claimedCount.value} / ${list.length} (${progressPercent.value}%)\n`;
      text += `=========================\n`;

      const catOrder = [
        { id: 'equipment', title: '⛺ 【用品裝備】' },
        { id: 'food', title: '🥩 【食材食品】' },
        { id: 'consumables', title: '🧊 【飲品與消耗品】' },
        { id: 'personal', title: '🎒 【個人自備】' }
      ];

      for (const cat of catOrder) {
        const catItems = list.filter(i => i.category === cat.id);
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
        setTimeout(() => { copyButtonText.value = '複製清單文字'; }, 2000);
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
        await liff.sendMessages([{ type: 'text', text: generatedSummaryText.value }]);
        alert('✅ 摘要已成功發送至 LINE 聊天室！');
        showExportModal.value = false;
      } catch (err) {
        console.error('發送至 LINE 失敗:', err);
        alert('發送失敗：' + (err.message || '請確認 LINE 授權'));
      }
    }

    return {
      mainView,
      categories,
      itemCategoryOptions,
      pickerTabs,
      currentCategory,
      searchQuery,
      filterUnclaimedOnly,
      filterMyItemsOnly,
      syncStatus,
      isLineClient,
      currentUser,
      // 👑 方案 A：管理員狀態與權限操作
      isCurrentTripAdmin,
      showAdminLoginModal,
      adminPasswordInput,
      adminLoginMessage,
      verifyAdminPassword,
      openAdminLoginModal,
      logoutAdmin,
      openSettingsWithAdminCheck,
      requireAdminPermission,
      // 多活動管理
      allTrips,
      currentTripId,
      currentTrip,
      showTripSwitchModal,
      showNewTripModal,
      formNewTrip,
      switchTrip,
      createNewTrip,
      deleteCurrentTrip,
      // 成員白名單與身分認領獨佔 (防大亂、防重複選取)
      newMemberInput,
      addMember,
      removeMember,
      toggleLockTrip,
      showClaimMemberModal,
      customNewMemberName,
      myClaimedName,
      isMemberClaimed,
      getMemberClaimant,
      isClaimedByOther,
      isClaimedByMeName,
      claimMemberName,
      releaseMemberClaim,
      addNewMemberAndClaim,
      // 物品清單
      items,
      filteredItems,
      claimedCount,
      progressPercent,
      getCategoryCount,
      getCategoryName,
      getCategoryBadgeClass,
      promptChangeName,
      normalizeItemUsers,
      isClaimedByMe,
      claimItem,
      unclaimItem,
      showAssignModal,
      assigningItem,
      assignTargetName,
      openAssignModal,
      selectQuickMember,
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
      // 互動地圖選點器 (Google Maps 官方選點)
      showMapPickerModal,
      mapPickerTarget,
      mapSearchKeyword,
      pickedCoords,
      pickedAddressName,
      openMapPicker,
      searchGoogleMapLocation,
      openExternalGoogleMaps,
      pasteFromClipboard,
      useCurrentLocationInPicker,
      useCurrentLocation,
      confirmPickedLocation,
      closeMapPicker,
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
      // 彈窗與設定
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
      eventTitle,
      saveSettings,
      persistData,
      // 常用選單庫
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
