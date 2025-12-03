/**
 * 查詢相關類型定義
 */

import {
  InvoiceCategory,
  TaxType,
  CarrierType,
  PrintFlag,
  KioskPrintFlag,
} from "./common";

/**
 * 查詢發票參數
 */
export interface InvoiceQueryParams {
  /** 商店自訂編號（選填），與 InvoiceNumber 擇一必填 */
  MerchantOrderNo?: string;

  /** 發票總金額（選填），純數字，為發票總金額（含稅） */
  TotalAmt?: string;

  /** 發票號碼（選填），與 MerchantOrderNo 擇一必填 */
  InvoiceNumber?: string;

  /** 發票防偽隨機碼（選填），於開立發票時產生的 4 碼隨機碼 */
  RandomNum?: string;
}

/**
 * 查詢發票回應結果
 */
export interface InvoiceQueryResult {
  /** ezPay 電子發票加值服務平台商店代號 */
  MerchantID: string;

  /** ezPay 電子發票開立序號 */
  InvoiceTransNo: string;

  /** 商店自訂編號 */
  MerchantOrderNo: string;

  /** 發票號碼 */
  InvoiceNumber: string;

  /** 發票防偽隨機碼（4 碼） */
  RandomNum: string;

  /** 買受人名稱 */
  BuyerName: string;

  /** 買受人統一編號 */
  BuyerUBN?: string;

  /** 買受人地址 */
  BuyerAddress?: string;

  /** 買受人手機號碼 */
  BuyerPhone?: string;

  /** 買受人電子信箱 */
  BuyerEmail?: string;

  /** 發票字軌類型，"07": 一般稅額計算, "08": 特種稅額計算 */
  InvoiceType: "07" | "08";

  /** 發票類別 */
  Category: InvoiceCategory;

  /** 課稅別 */
  TaxType: TaxType;

  /** 稅率，例：0.05 */
  TaxRate: number;

  /** 銷售額（課稅別應稅的未稅金額） */
  Amt: number;

  /** 銷售額（課稅別應稅的未稅金額） */
  AmtSales: number;

  /** 銷售額（課稅別零稅率的未稅金額） */
  AmtZero: number;

  /** 銷售額（課稅別免稅的未稅金額） */
  AmtFree: number;

  /** 稅額 */
  TaxAmt: number;

  /** 總金額（含稅） */
  TotalAmt: number;

  /** 載具類別 */
  CarrierType?: CarrierType;

  /** 載具編號 */
  CarrierNum?: string;

  /** 捐贈碼 */
  LoveCode?: string;

  /** 列印註記 */
  PrintFlag: PrintFlag;

  /** Kiosk 列印註記 */
  KioskPrintFlag?: KioskPrintFlag;

  /** 發票開立時間，格式：YYYY-MM-DD HH:mm:ss */
  CreateTime: string;

  /** 商品資訊（JSON 格式） */
  ItemDetail: string;

  /** 發票狀態，"1": 已開立（有產生發票號碼）, "2": 已作廢 */
  InvoiceStatus: "1" | "2";

  /** 上傳財政部狀態，"0": 未上傳, "1": 已上傳成功, "2": 上傳中, "3": 上傳失敗, "4": 上傳逾時 */
  UploadStatus: "0" | "1" | "2" | "3" | "4";

  /** 檢查碼 */
  CheckCode: string;

  /** 條碼資料（當 PrintFlag=Y 時提供） */
  BarCode?: string;

  /** QR Code 左邊資料（當 PrintFlag=Y 時提供） */
  QRcodeL?: string;

  /** QR Code 右邊資料（當 PrintFlag=Y 時提供） */
  QRcodeR?: string;

  /** 結束標記，固定回傳 "##" */
  EndStr: string;
}
