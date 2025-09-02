# Jigsaw-Wizard
一個基於網頁的拼圖遊戲應用程式，使用 Python Flask 開發。使用者可以上傳任何圖片，系統會自動將其切割成拼圖塊，生成可玩的拼圖遊戲。

## 玩法
1. 點擊 "Choose File" 選擇一張圖片。
2. 點擊 "Upload and Split" 按鈕。
3. 圖片會被切割成數個拼圖塊並顯示在下方。
4. 將拼圖塊拖曳到上方的拼圖板對應的位置。
5. 當所有拼圖塊都放置正確，遊戲即完成！

## 安裝與執行

1. **確認環境**
   請確認您的電腦已安裝 Python 3 與 pip。

2. **複製專案**
   如果您是透過 `git`，可以使用以下指令：
   ```bash
   git clone https://github.com/wanpwang1981-ux/Jigsaw-Wizard.git
   cd Jigsaw-Wizard
   ```
   或者，直接下載 ZIP 檔案並解壓縮。

3. **安裝依賴套件**
   在專案根目錄下，開啟終端機 (Terminal) 或命令提示字元 (Command Prompt)，執行以下指令來安裝所需的套件：
   ```bash
   pip install -r requirements.txt
   ```

4. **啟動應用程式**
   執行以下指令來啟動 Flask 伺服器：
   ```bash
   python app.py
   ```

5. **開啟遊戲**
   伺服器啟動後，您會看到類似 `* Running on http://127.0.0.1:5000/` 的訊息。請打開您的網頁瀏覽器，並訪問以下網址：
   [http://127.0.0.1:5000](http://127.0.0.1:5000)
