# ezPay Invoice SDK for JavaScript/TypeScript

[![codecov](https://badgen.net/codecov/c/github/depresto/ezpay-invoice-js)](https://codecov.io/gh/depresto/ezpay-invoice-js) [![npm version](https://badge.fury.io/js/ezpay-invoice-js.svg)](https://www.npmjs.com/package/ezpay-invoice-js)

ezPay 電子發票 SDK - 支援 TypeScript 的完整型別定義

## 特色功能

- 完整的 TypeScript 型別定義
- 同時支援 CommonJS 和 ES Modules
- 內建參數驗證
- 完整的錯誤處理
- 支援所有 ezPay 發票 API

## 安裝

```bash
npm install ezpay-invoice-js
# or
yarn add ezpay-invoice-js
# or
pnpm add ezpay-invoice-js
```

## 快速開始

### 建立 client instance

#### CommonJS (Node.js)

```javascript
const { EzpayInvoiceClient } = require("ezpay-invoice-js");

const client = new EzpayInvoiceClient({
  merchantId: "YOUR_MERCHANT_ID",
  hashKey: "YOUR_HASH_KEY",        // 32 字元
  hashIV: "YOUR_HASH_IV",          // 16 字元
  env: "sandbox",                  // 'sandbox' 或 'production'
  timeout: 30000,                  // 選填，預設 30000ms
});
```

#### ES Modules (TypeScript/Modern JavaScript)

```typescript
import { EzpayInvoiceClient } from "ezpay-invoice-js";

const client = new EzpayInvoiceClient({
  merchantId: "YOUR_MERCHANT_ID",
  hashKey: "YOUR_HASH_KEY",
  hashIV: "YOUR_HASH_IV",
  env: "production",
});
```

## API 使用說明

詳細的 API 文件請參考：[ezPay 電子發票 API 文件](https://inv.ezpay.com.tw/dw_files/info_api/EZP_INVI_1_2_1.pdf)

### 1. 開立發票 (Issue Invoice)

#### B2C 發票（個人）

```typescript
const result = await client.issueInvoice({
  MerchantOrderNo: "ORDER20231203001",    // 商店自訂編號（必填）
  Category: "B2C",                        // 發票類別（必填）
  BuyerName: "王小明",                    // 買受人名稱（必填）
  BuyerEmail: "buyer@example.com",        // 買受人信箱（選填）
  Amt: 1000,                              // 銷售額-未稅（必填）
  ItemName: "商品A|商品B",                 // 商品名稱，多項以 | 分隔（必填）
  ItemCount: "1|2",                       // 商品數量（必填）
  ItemUnit: "件|個",                      // 商品單位（必填）
  ItemPrice: "500|250",                   // 商品單價（必填）
  ItemAmt: "500|500",                     // 商品小計（必填）
});

console.log(result.Result?.InvoiceNumber);  // 發票號碼
console.log(result.Result?.RandomNum);      // 防偽隨機碼
```

#### B2B 發票（營業人）

```typescript
const result = await client.issueInvoice({
  MerchantOrderNo: "ORDER20231203002",
  Category: "B2B",                        // B2B 發票
  BuyerName: "某某股份有限公司",
  BuyerUBN: "12345678",                   // 統一編號（B2B 必填）
  BuyerAddress: "台北市信義區信義路五段7號",
  BuyerEmail: "company@example.com",
  PrintFlag: "Y",                         // 索取紙本發票
  Amt: 10000,
  ItemName: "軟體服務",
  ItemCount: "1",
  ItemUnit: "式",
  ItemPrice: "10000",
  ItemAmt: "10000",
});
```

#### 使用載具（手機條碼）

```typescript
const result = await client.issueInvoice({
  MerchantOrderNo: "ORDER20231203003",
  Category: "B2C",
  BuyerName: "王小明",
  CarrierType: "0",                       // 0: 手機條碼
  CarrierNum: "/ABC1234",                 // 手機載具條碼
  Amt: 1500,
  ItemName: "商品C",
  ItemCount: "1",
  ItemUnit: "件",
  ItemPrice: "1500",
  ItemAmt: "1500",
});
```

#### 捐贈發票（愛心碼）

```typescript
const result = await client.issueInvoice({
  MerchantOrderNo: "ORDER20231203004",
  Category: "B2C",
  BuyerName: "王小明",
  LoveCode: 919,                          // 愛心碼（3-7 位數字）
  Amt: 500,
  ItemName: "商品D",
  ItemCount: "1",
  ItemUnit: "件",
  ItemPrice: "500",
  ItemAmt: "500",
});
```

### 2. 作廢發票 (Invalid Invoice)

```typescript
const result = await client.invalidInvoice(
  "AB12345678",                           // 發票號碼
  "客戶退貨"                               // 作廢原因（選填）
);

console.log(result.Status);               // SUCCESS
```

### 3. 開立折讓 (Issue Allowance)

```typescript
const result = await client.issueAllowance({
  InvoiceNo: "AB12345678",                // 原發票號碼（必填）
  MerchantOrderNo: "ALLOW20231203001",    // 商店自訂編號（必填）
  ItemName: "商品A",                       // 折讓商品名稱（必填）
  ItemCount: "1",                         // 折讓商品數量（必填）
  ItemUnit: "件",                         // 折讓商品單位（必填）
  ItemPrice: "500",                       // 折讓商品單價（必填）
  ItemAmt: "500",                         // 折讓商品金額（必填）
  ItemTaxAmt: "25",                       // 折讓商品稅額（必填）
  TotalAmt: "525",                        // 折讓總金額-含稅（必填）
  BuyerEmail: "buyer@example.com",        // 買受人信箱（選填）
});

console.log(result.Result?.AllowanceNo);  // 折讓單號
```

### 4. 作廢折讓 (Invalid Allowance)

```typescript
const result = await client.invalidAllowance(
  "A123456789012345",                     // 折讓單號
  "折讓錯誤"                               // 作廢原因（選填）
);
```

### 5. 查詢發票 (Query Invoice)

#### 使用發票號碼查詢

```typescript
const result = await client.queryInvoice({
  InvoiceNumber: "AB12345678",            // 發票號碼
  RandomNum: "1234",                      // 防偽隨機碼（選填）
});

console.log(result.Result?.BuyerName);
console.log(result.Result?.TotalAmt);
console.log(result.Result?.InvoiceStatus);  // 1: 已開立, 2: 已作廢
```

#### 使用商店訂單編號查詢

```typescript
const result = await client.queryInvoice({
  MerchantOrderNo: "ORDER20231203001",    // 商店自訂編號
  TotalAmt: "1050",                       // 總金額（選填）
});
```

### 6. 產生查詢發票的加密資料

用於手動查詢或整合其他系統：

```typescript
const encryptedData = client.getQueryInvoicePostData({
  InvoiceNumber: "AB12345678",
  RandomNum: "1234",
});

// 回傳加密後的十六進位字串，可用於 POST 請求
console.log(encryptedData);
```

## 錯誤處理

SDK 提供了完整的錯誤類型定義：

```typescript
import {
  EzpayInvoiceClient,
  ValidationError,
  ApiError,
  ConfigurationError,
} from "ezpay-invoice-js";

try {
  const result = await client.issueInvoice({
    MerchantOrderNo: "",  // 錯誤：空值
    // ... 其他參數
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("參數驗證失敗:", error.field, error.message);
  } else if (error instanceof ApiError) {
    console.error("API 請求失敗:", error.status, error.message);
  } else if (error instanceof ConfigurationError) {
    console.error("配置錯誤:", error.message);
  }
}
```

### 錯誤類型說明

- **`ValidationError`**: 參數驗證失敗（例如：必填欄位缺失、格式不正確）
- **`ApiError`**: API 請求失敗（例如：網路錯誤、API 回應錯誤）
- **`ConfigurationError`**: 客戶端配置錯誤（例如：merchantId、hashKey、hashIV 不正確）

## TypeScript 型別定義

SDK 提供了完整的 TypeScript 型別定義，包括：

```typescript
import type {
  InvoiceIssueParams,
  InvoiceIssueResult,
  AllowanceIssueParams,
  AllowanceIssueResult,
  InvoiceQueryParams,
  InvoiceQueryResult,
  EzpayApiResponse,
} from "ezpay-invoice-js";
```

## 參數驗證規則

SDK 會自動驗證以下規則：

### 開立發票驗證
- 必填欄位檢查
- 字串長度限制
- B2B 發票必須提供統一編號
- B2C 不索取紙本時必須提供載具或愛心碼
- 統一編號格式驗證（含檢查碼）
- 商品明細欄位數量一致性檢查
- 零稅率發票必須提供通關方式
- 混合課稅時必須提供各課稅別金額

### 開立折讓驗證
- 必填欄位檢查
- 商品明細欄位數量一致性檢查

### 查詢發票驗證
- MerchantOrderNo 或 InvoiceNumber 擇一必填

## 開發

### 建置專案

```bash
npm run build          # 同時建置 CommonJS 和 ESM
npm run build:cjs      # 僅建置 CommonJS
npm run build:esm      # 僅建置 ES Modules
```

### 執行測試

```bash
npm test               # 執行測試
npm run test:watch     # 監聽模式
npm run test:coverage  # 產生覆蓋率報告
```

### 程式碼品質

```bash
npm run lint           # 檢查程式碼
npm run lint:fix       # 自動修復
npm run format         # 格式化程式碼
npm run format:check   # 檢查格式
```

## 系統需求

- Node.js >= 14.0.0
- TypeScript >= 4.0 (如果使用 TypeScript)

## 授權

MIT License

## 相關連結

- [ezPay 電子發票官網](https://inv.ezpay.com.tw/)
- [ezPay API 文件](https://inv.ezpay.com.tw/dw_files/info_api/EZP_INVI_1_2_1.pdf)
- [GitHub Repository](https://github.com/depresto/ezpay-invoice-js)
- [NPM Package](https://www.npmjs.com/package/ezpay-invoice-js)

## 更新日誌

### v2.0.0 (2025-12-03)

#### 重大變更
- 完整重構為 TypeScript
- 模組化架構設計
- 同時支援 CommonJS 和 ES Modules
- 新增完整的參數驗證
- 新增自訂錯誤類型
- 方法名稱變更：
  - `revokeInvoice` → `invalidInvoice`
  - `revokeAllowance` → `invalidAllowance`

#### 新增功能
- 完整的 TypeScript 型別定義
- 內建參數驗證（統一編號、商品明細一致性等）
- 自訂錯誤類型（ValidationError, ApiError, ConfigurationError）
- 配置超時時間選項
- Source maps 支援

#### 改進
- 更好的錯誤訊息
- 更完整的文件
- 更嚴格的型別檢查
- 程式碼品質工具（ESLint, Prettier）

## 貢獻

歡迎提交 Issue 或 Pull Request！

## 支援

如有問題或建議，請至 [GitHub Issues](https://github.com/depresto/ezpay-invoice-js/issues) 提出。
