/**
 * 露營協同清單設定檔
 * 
 * 1. LINE_LIFF_ID: 在 LINE Developers 後台建立 LIFF 取得的 ID (格式如: 1234567890-AbCdEfGh)
 * 2. FIREBASE_CONFIG: 在 Firebase Console 建立專案後取得的 Web 應用設定
 * 
 * 注意：即使尚未填入 Firebase，系統也會以 LocalStorage 正常運行，方便您先預覽操作介面！
 */
window.APP_CONFIG = {
  // LINE LIFF ID (選填，若有填入則在 LINE 內部會自動讀取頭像與名字)
  LIFF_ID: "2011980881-P0EUvNYQ",

  // 預設活動名稱
  DEFAULT_EVENT_TITLE: "🌲 歡樂露營出遊裝備與食材備忘錄",

  // Firebase Firestore 設定 (啟用多人跨裝置即時同步)
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyB9oe8wfbeYEwBdaU8eG9zuF4XcmXweMxQ",
    authDomain: "my-camp-list.firebaseapp.com",
    projectId: "my-camp-list",
    storageBucket: "my-camp-list.firebasestorage.app",
    messagingSenderId: "742920230350",
    appId: "1:742920230350:web:82f4a9885df492044c079f",
    measurementId: "G-PB1N9K60NJ"
  }
};
