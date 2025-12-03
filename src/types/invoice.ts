/**
 * 發票相關類型定義
 */

import {
  InvoiceCategory,
  InvoiceStatus,
  TaxType,
  CarrierType,
  PrintFlag,
  KioskPrintFlag,
  CustomsClearance,
} from "./common";

/**
 * 開立發票參數
 */
export interface InvoiceIssueParams {
  /** ezPay 電子發票開立序號（選填） */
  TransNum?: string;

  /** 商店自訂編號（必填），限英數字，長度限制 20 字 */
  MerchantOrderNo: string;

  /** 開立發票方式（選填），預設為 "1" 即時開立 */
  Status?: InvoiceStatus;

  /** 預約開立時間（選填），格式：YYYY-MM-DD HH:mm:ss，當 Status=3 時為必填 */
  CreateStatusTime?: string;

  /** 發票類別（必填） */
  Category: InvoiceCategory;

  /** 買受人名稱（必填），長度限制 60 字 */
  BuyerName: string;

  /** 買受人電子信箱（選填），長度限制 200 字，多組信箱以 | 分隔 */
  BuyerEmail?: string;

  /** 買受人手機號碼（選填） */
  BuyerPhone?: string;

  /** 買受人統一編號（選填），當 Category=B2B 時為必填，長度限制 8 字 */
  BuyerUBN?: string;

  /** 買受人地址（選填），長度限制 200 字 */
  BuyerAddress?: string;

  /** 載具類別（選填），當 Category=B2C 且 PrintFlag=N 時為必填 */
  CarrierType?: CarrierType;

  /** 載具編號（選填），當有提供 CarrierType 時為必填 */
  CarrierNum?: string;

  /** 愛心碼（選填），限數字，長度 3-7 字 */
  LoveCode?: number;

  /** 列印註記（選填），預設為 "N" */
  PrintFlag?: PrintFlag;

  /** Kiosk 列印註記（選填） */
  KioskPrintFlag?: KioskPrintFlag;

  /** 課稅別（選填），預設為 "1" 應稅 */
  TaxType?: TaxType;

  /** 稅率（選填），預設為 5，當 TaxType 為 2 或 3 時，請帶 0 */
  TaxRate?: number;

  /** 通關方式（選填），當 TaxType=2 時為必填 */
  CustomsClearance?: CustomsClearance;

  /** 銷售額（必填），為發票銷售額（未稅） */
  Amt: number;

  /** 課稅別為應稅的銷售額（選填），當 TaxType=9 時為必填 */
  AmtSales?: number;

  /** 課稅別為零稅率的銷售額（選填），當 TaxType=9 時為必填 */
  AmtZero?: number;

  /** 課稅別為免稅的銷售額（選填），當 TaxType=9 時為必填 */
  AmtFree?: number;

  /** 稅額（選填），系統會自動計算 */
  TaxAmt?: number;

  /** 總金額（選填），系統會自動計算 */
  TotalAmt?: number;

  /** 商品名稱（必填），多項商品以 | 分隔，長度限制 100 字 */
  ItemName: string;

  /** 商品數量（必填），多項商品以 | 分隔 */
  ItemCount: string;

  /** 商品單位（必填），多項商品以 | 分隔，長度限制 6 字 */
  ItemUnit: string;

  /** 商品單價（必填），多項商品以 | 分隔 */
  ItemPrice: string;

  /** 商品金額（必填），多項商品以 | 分隔 */
  ItemAmt: string;

  /** 商品課稅別（選填），多項商品以 | 分隔，當 TaxType=9 時為必填 */
  ItemTaxType?: string;

  /** 備註（選填），長度限制 200 字 */
  Comment?: string;
}

/**
 * 開立發票回應結果
 */
export interface InvoiceIssueResult {
  /** ezPay 電子發票加值服務平台商店代號 */
  MerchantID: string;

  /** ezPay 電子發票開立序號 */
  InvoiceTransNo: string;

  /** 商店自訂編號 */
  MerchantOrderNo: string;

  /** 發票總金額（含稅） */
  TotalAmt: number;

  /** 發票號碼 */
  InvoiceNumber: string;

  /** 發票防偽隨機碼（4 碼） */
  RandomNum: string;

  /** 條碼資料（當 PrintFlag=Y 時提供） */
  BarCode?: string;

  /** QR Code 左邊資料（當 PrintFlag=Y 時提供） */
  QRcodeL?: string;

  /** QR Code 右邊資料（當 PrintFlag=Y 時提供） */
  QRcodeR?: string;

  /** 發票開立時間，格式：YYYY-MM-DD HH:mm:ss */
  CreateTime: string;

  /** 檢查碼 */
  CheckCode: string;
}

/**
 * 作廢發票回應結果
 */
export interface InvoiceInvalidResult {
  /** ezPay 電子發票加值服務平台商店代號 */
  MerchantID: string;

  /** 發票號碼 */
  InvoiceNumber: string;

  /** 作廢時間，格式：YYYY-MM-DD HH:mm:ss */
  CreateTime: string;

  /** 檢查碼 */
  CheckCode: string;
}
