# STM32 智能車 BLE 藍牙遠程遙控小程序

本項目是基於 **Taro 4 + React 18 + TypeScript + Zustand** 的跨端小程序，配套 STM32 智能車固件（JDY-31 9600 波特率）實現手機遠程遙控。

---

## 🎯 功能一覽

### TabBar 頁面
| 頁面 | 功能 |
|------|------|
| 遙控 (Remote) | 5 按鍵方向鍵 + 中間 STOP / 4 個模式快捷按鈕（避障/循跡/開燈/關燈）/ 手動字節發送輸入框 / 連接狀態卡片（RSSI、發送字節、發送次數、速度油門） |
| 藍牙 (Bluetooth) | 開始/停止掃描、設備列表（RSSI、名稱、MAC/設備 ID）、連接/斷開操作 |
| 設置 (Settings) | HEX ↔ ASCII 發送模式切換、**完整指令協議對照表**（每條都有「試發」按鈕）、清空本地緩存、關於版本 |

### 藍牙兼容性
- 自動識別常見 BLE 透傳服務 UUID：**FFE0/FFE1**（TI CC2541/JDY-31M/HC-08/AT-09）與 **Nordic UART Service (NUS)**
- 支持 HEX 與 ASCII 雙模式，與固件完全匹配：
  - HEX 模式 → 直接發送 `0x01~0x08` 單字節
  - ASCII 模式 → 發送字符 `'0'~'8'`（0x30~0x38），固件自動映射

### 固件指令對照
| HEX  | ASCII | 功能 | 固件備註 |
|------|-------|------|---------|
| 0x00 | '0'   | 停止 | Motor_Stop() |
| 0x01 | '1'   | 前進 | Motor_Control(50, 50) |
| 0x02 | '2'   | 後退 | Motor_Control(-40, -40) |
| 0x03 | '3'   | 左轉 | Motor_Control(-40, 40) |
| 0x04 | '4'   | 右轉 | Motor_Control(40, -40) |
| 0x05 | '5'   | 避障模式 | 舵機掃描 3 方向 |
| 0x06 | '6'   | 循跡模式 | 紅外循跡運行 |
| 0x07 | '7'   | 開燈 | LED_ON() |
| 0x08 | '8'   | 關燈 | LED_OFF() |

---

## 🧩 關於 JDY-31 的硬件提示

微信小程序在 **iOS 端不支持經典藍牙 SPP**（僅支持 BLE）：

| 模組型號 | 協議 | iOS 兼容 | 建議 |
|---------|------|----------|------|
| JDY-31 經典版 | Bluetooth Classic SPP | ❌ 不兼容 | **更換 JDY-31M（BLE 版本）** |
| JDY-31M / JDY-33 | BLE 4.2 | ✅ | 本項目首選，Service UUID FFE0/FFE1 全自動匹配 |
| HC-08 / AT-09 / CC2541 | BLE | ✅ | 直接可用 |
| HC-05/06 | Classic SPP | ❌ | 更換 HC-08 BLE 版本 |

> 💡 如果你堅持用經典版 JDY-31，只能在 Android 手機上使用第三方「SPP 藍牙串口」App，**本小程序無法連接**。iOS 平台請務必換 BLE 版本模組。

### 波特率
固件端已改為 `9600bps`（USART1），與 JDY-31/JDY-31M 出廠默認一致。若你手動改了模組波特率，請同步修改 STM32 的 `MX_USART1_UART_Init()` 或通過 AT 指令把模組改回 9600。

---

## 🚀 啟動與運行

### 1. 環境要求
- Node.js **>= 18**
- 微信小程序 AppID（可在 `project.config.json` 填入；開發階段使用「測試號」即可）

### 2. 安裝依賴
```bash
cd miniapp
npm install
```

### 3. 開發編譯
```bash
# 微信小程序
npm run dev:weapp

# H5 預覽（H5 不支持 BLE，僅查看 UI）
npm run dev:h5
```

### 4. 在微信小程序中調試
1. 執行 `npm run dev:weapp` 後，會在 `miniapp/dist/` 生成微信小程序源碼
2. 打開微信公眾平台「微信開發者工具」 → 匯入項目 → 選擇 `miniapp/dist` 作為項目根，AppID 使用測試號
3. 點擊「預覽」掃碼，即可在手機上真機測試

---

## 📁 項目結構
```
miniapp/
├── package.json             # 依賴 + 構建腳本
├── tsconfig.json            # TS 配置（含 @/* 路徑別名）
├── babel.config.js          # Taro 4 + React 18 babel 配置
├── config/                  # Taro 構建配置（index/dev/prod）
├── project.config.json      # 微信小程序項目配置
├── project.tt.json          # 抖音小程序配置
└── src/
    ├── app.ts / app.config.ts / app.scss   # 小程序入口 + TabBar 全局配置
    ├── styles/theme.scss      # 霓虹青科技感主題配色
    ├── styles/variables.scss # 間距/圓角/字體/Mixin 全局變量
    ├── types/ble.ts          # BLE + 指令協議類型定義 + 指令表
    ├── store/ble.ts          # Zustand 全局狀態（連接狀態、設備、發送模式、字節計數）
    ├── hooks/useBluetoothLE.ts # BLE 掃描/連接/寫入 Hook（FFE0+NUS 自動匹配）
    ├── utils/hex.ts          # HEX ↔ bytes 工具
    ├── utils/command.ts      # 指令轉字節緩衝、手動輸入解析
    ├── components/
    │   ├── DirectionPad/      # 圓形 5 向方向鍵組件（前後左右+STOP）
    │   ├── ConnectionCard/    # 連接狀態卡片（RSSI、發送計數、速度滑條）
    │   └── DeviceCard/        # 掃描結果設備卡片
    └── pages/
        ├── remote/            # TabBar 頁：遙控主頁
        ├── bluetooth/         # TabBar 頁：藍牙掃描連接
        ├── settings/          # TabBar 頁：設置 + 協議表
        ├── command/           # 二級頁：指令詳情（佔位）
        └── logs/              # 二級頁：收發日誌（佔位）
```

---

## 🔧 常見問題排查

| 症狀 | 原因 | 解決方案 |
|------|------|---------|
| 掃描不到任何設備 | 手機未開藍牙 / 未給定位權限 / 模組是經典 SPP | 開啟藍牙+定位；確認模組是 BLE 版本（JDY-31M/HC-08）|
| 掃描到了但連接失敗 | 信號太弱 / GATT service 不匹配 / 超時 | 靠近模組重試；日誌查看發現的 UUID，必要時在 CANDIDATE_* 列表中追加 |
| 連接成功但車不動 | 寫入特徵值不正確 / 模組未進入透傳 / 波特率不匹配 | 連接成功後在設置頁按「試發」觀察 OLED 顯示 RX 值 |
| iOS 可以掃描但連不上 | JDY-31 不是 BLE 版 | 更換 JDY-31M/HC-08 BLE 模組 |
| HEX 模式發送 `01` 車不動 | 固件不識別（波特率/接線問題）| 先確認車載 OLED 顯示 `RX:01 CMD:01`（表示鏈路通） |

> **建議調試流程**：先在手機 App 裏發送 `01` → 觀察小車 OLED 的 `RX:XX CMD:YY` → 根據顯示值定位是「手機端發送格式問題」還是「車端接收/執行問題」。
