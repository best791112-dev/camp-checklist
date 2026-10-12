# 🏕️ 露營出遊協同攜帶備忘錄 (LINE LIFF + GitHub Pages)

這是一個專門為了 **LINE 群組出遊、露營** 設計的協同攜帶備忘錄。
支援**用品裝備**與**食材食品**分類、**多人認領**（誰負責帶什麼一目了然）、**Firebase 雲端即時同步**，並可直接部署在 **GitHub Pages** 上（100% 永久免費）！

---

## ✨ 核心特色

1. 📱 **LINE 群組直接使用 (LIFF)**：點擊群組內的連結即可在 LINE 內直接彈出操作，自動抓取群友的 LINE 暱稱與大頭照，完全不需要註冊帳號。
2. 📋 **選單勾選庫（免打字）**：內建 50+ 項齊全的露營裝備、食材肉品、零食與消耗品庫，直接打勾一次批量新增，徹底告別手動輸入！
3. ⭐ **經常選擇（常用收藏）**：支援星號標記常用物品，一鍵「加入所有常用」，每次出遊開清單只需 3 秒鐘！
4. 🥩 **清晰分類管理**：
   - ⛺ **用品裝備**（帳篷、卡式爐、營燈、桌椅等）
   - 🥩 **食材食品**（肉品、海鮮、蔬菜、調味料等）
   - 🧊 **飲品消耗**（瓦斯罐、水、冰塊、垃圾袋等）
   - 🎒 **個人自備**（睡袋、換洗衣物、個人藥品等）
5. 🙋‍♂️ **多人協同認領**：
   - 點擊「我來帶！」按鈕即可標記認領。
   - 隨時可取消認領或轉讓。
6. ⚡ **即時同步 (Real-time Sync)**：一人在手機上勾選，其他人畫面即時更新，不需手動重新整理頁面。
7. 📤 **一鍵發送總結回 LINE**：整理完畢後，點擊一鍵直接將排版好的清單摘要傳送回 LINE 群組。

---

## 🚀 部署教學（只要 3 步，完全免費）

### 步驟 1：建立 GitHub 倉庫並推送程式碼

1. 前往 [GitHub](https://github.com/new) 建立新 Repository，名稱建議設為：`camp-checklist`。
2. 在本地終端機（此專案資料夾內）執行以下指令：

```bash
git init
git add .
git commit -m "feat: 露營協同備忘錄初始版本"
git branch -M main
git remote add origin https://github.com/best791112-dev/camp-checklist.git
git push -u origin main
```

3. 開啟 **GitHub Pages**：
   - 到你的 GitHub 倉庫頁面 -> 點選 **Settings** -> 左側選單點選 **Pages**。
   - 在 **Build and deployment** 下方的 **Branch** 選擇 `main` 分支，資料夾選 `/ (root)`，點擊 **Save**。
   - 約等待 1~2 分鐘，你會得到專屬的 HTTPS 網址：
     👉 `https://best791112-dev.github.io/camp-checklist/`

---

### 步驟 2：設定 Firebase Firestore (支援多人即時同步)

> 💡 即使不設定 Firebase，系統也能在單機 LocalStorage 正常體驗！若要「多人跨手機即時同步」，請完成以下 3 分鐘設定：

1. 前往 [Firebase Console](https://console.firebase.google.com/)，點擊「新增專案」。
2. 專案建立完成後，點擊網頁圖示 `</>` (Web)，隨意取個名稱並註冊應用程式。
3. 複製畫面上的 `firebaseConfig` 物件，例如：
   ```javascript
   {
     apiKey: "AIzaSy...",
     authDomain: "xxxx.firebaseapp.com",
     projectId: "xxxx",
     storageBucket: "xxxx.appspot.com",
     messagingSenderId: "xxxx",
     appId: "xxxx"
   }
   ```
4. 在左側選單點擊 **Firestore Database** -> 點擊「建立資料庫」-> 選擇「以測試模式啟動」（方便大家自由讀寫）-> 點擊啟用。
5. 打開專案中的 `config.js`，將你的設定貼到 `FIREBASE_CONFIG` 中（或直接在網頁右上角的 ⚙️ 設定視窗貼上並儲存）。

---

### 步驟 3：申請 LINE LIFF (讓 LINE 群組免登入讀取名字)

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)，登入你的 LINE 帳號。
2. 建立或選擇一個 Provider（例如：`MyCamping`）。
3. 建立一個 **LINE Login** 類型的 Channel。
4. 點選 **LIFF** 標籤頁 -> 點擊 **Add**：
   - **LIFF app name**：露營備忘錄
   - **Size**：建議選擇 **Full** 或 **Tall**
   - **Endpoint URL**：填入你的 GitHub Pages 網址（例如 `https://best791112-dev.github.io/camp-checklist/`）
   - **Scopes**：勾選 `profile` 與 `chat_message.write`（這樣才能讀取大頭照與發送訊息回群組）
5. 建立完成後，複製 **LIFF ID**（格式如 `1234567890-AbCdEfGh`）。
6. 將 LIFF ID 貼入專案的 `config.js`，或在網頁的 ⚙️ 設定視窗儲存即可！

---

## 📲 在 LINE 群組中使用

建立好 LIFF 後，LINE 會提供一組專屬的短網址：
`https://liff.line.me/你的LIFF_ID`

你只要把這串網址傳到 LINE 群組（或設在群組記事本/置頂公告），群友點開後就能直接認領物品，享受無比流暢的出遊準備體驗！🎉
