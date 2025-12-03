/**
 * 折讓相關類型定義
 */

import { AllowanceStatus, TaxType } from "./common";

/**
 * 開立折讓參數
 */
export interface AllowanceIssueParams {
  /** 發票號碼（必填），長度限制 10 字 */
  InvoiceNo: string;

  /** 商店自訂編號（必填），限英數字，長度限制 20 字 */
  MerchantOrderNo: string;

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

  /** 混合課稅別（選填），當原發票 TaxType=9 時為必填 */
  TaxTypeForMixed?: TaxType;

  /** 商品稅額（必填），多項商品以 | 分隔 */
  ItemTaxAmt: string;

  /** 折讓單總金額（必填），含稅 */
  TotalAmt: string;

  /** 買受人電子信箱（選填），長度限制 200 字，多組信箱以 | 分隔 */
  BuyerEmail?: string;

  /** 開立折讓方式（選填），預設為 "1" 即時開立 */
  Status?: AllowanceStatus;
}

/**
 * 開立折讓回應結果
 */
export interface AllowanceIssueResult {
  /** ezPay 電子發票加值服務平台商店代號 */
  MerchantID: string;

  /** 折讓單號碼 */
  AllowanceNo: string;

  /** 發票號碼 */
  InvoiceNumber: string;

  /** 商店自訂編號 */
  MerchantOrderNo: string;

  /** 折讓金額 */
  AllowanceAmt: string;

  /** 折讓後剩餘金額 */
  RemainAmt: string;

  /** 檢查碼 */
  CheckCode: string;
}

/**
 * 作廢折讓回應結果
 */
export interface AllowanceInvalidResult {
  /** ezPay 電子發票加值服務平台商店代號 */
  MerchantID: string;

  /** 折讓單號碼 */
  AllowanceNo: string;

  /** 作廢時間，格式：YYYY-MM-DD HH:mm:ss */
  CreateTime: string;

  /** 檢查碼 */
  CheckCode: string;
}
