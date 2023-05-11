# ezPay Invoice SDK js

ezPay 發票 SDK

## Installation

```bash
yarn add ezpay-invoice-js
```

## Usage

### Create SDK Instance (ES5)

```javascript
const EzpayInvoiceClient = require("ezpay-invoice-js");
const client = new EzpayInvoiceClient({
  merchantId: "ezPay Invoice Merchant ID",
  hashKey: "ezPay Invoice Hash Key",
  hashIV: "ezPay Invoice Hash IV",
  env: "production", // 'sandbox' | 'production'
});
```

### Create SDK Instance (ES6)

```javascript
import EzpayInvoiceClient from "ezpay-invoice-js";
const client = new EzpayInvoiceClient({
  merchantId: "ezPay Invoice Merchant ID",
  hashKey: "ezPay Invoice Hash Key",
  hashIV: "ezPay Invoice Hash IV",
  env: "production", // 'sandbox' | 'production'
});
```

### 開立發票 Issue invoice

詳情請見官方文件：[文件網址](https://inv.ezpay.com.tw/dw_files/info_api/EZP_INVI_1_2_1.pdf)

```javascript
await client.issueInvoice({
  
})
```

## 作廢發票 Revoke invoice

詳情請見官方文件：[文件網址](https://inv.ezpay.com.tw/dw_files/info_api/EZP_INVI_1_2_1.pdf)

```javascript
await client.revokeInvoice(
  'invoice number',   // 發票號碼 
  'invoke reason'     // 作廢原因
)
```

### 開立折讓 Issue allowance

詳情請見官方文件：[文件網址](https://inv.ezpay.com.tw/dw_files/info_api/EZP_INVI_1_2_1.pdf)

```javascript
await client.issueAllowance({
  
})
```

## 作廢折讓 Revoke allowance

詳情請見官方文件：[文件網址](https://inv.ezpay.com.tw/dw_files/info_api/EZP_INVI_1_2_1.pdf)

```javascript
await client.revokeAllowance(
  'allowance number',   // 折讓號碼
  'invoke reason'     // 作廢原因
)
```
