import EzpayInvoiceClient from "./ezpay.client";

export type EzpayApiResponse<T> = {
  Status: string;
  Message: string;
  Result: T | null;
};

export type InvoiceProps = {
  TransNum?: string;
  MerchantOrderNo: string;
  Status?: "0" | "1" | "3";
  CreateStatusTime?: string;
  Category: "B2B" | "B2C";
  BuyerName: string;
  BuyerEmail?: string;
  BuyerPhone?: string;
  BuyerUBN?: string;
  BuyerAddress?: string;
  CarrierType?: "0" | "1" | "2";
  CarrierNum?: string;
  LoveCode?: number;
  PrintFlag?: "Y";
  KioskPrintFlag?: "1";
  TaxType?: "1" | "2" | "3" | "9";
  TaxRate?: number;
  CustomsClearance?: "1" | "2";
  Amt: number;
  AmtSales?: number;
  AmtZero?: number;
  AmtFree?: number;
  TaxAmt?: number;
  TotalAmt?: number;
  ItemName: string;
  ItemCount: string;
  ItemUnit: string;
  ItemPrice: string;
  ItemAmt: string;
  ItemTaxType?: string;
  Comment?: string;
};
export type IssueInvoiceResult = {
  MerchantID: string;
  InvoiceTransNo: string;
  MerchantOrderNo: string;
  TotalAmt: number;
  InvoiceNumber: string;
  RandomNum: string;
  BarCode?: string;
  QRcodeL?: string;
  QRcodeR?: string;
  CreateTime: string;
  CheckCode: string;
};

export type RevokeInvoiceResult = {
  MerchantID: string;
  InvoiceNumber: string;
  CreateTime: string;
  CheckCode: string;
};

export type IssueAllowanceProps = {
  InvoiceNo: string;
  MerchantOrderNo: string;
  ItemName: string;
  ItemCount: string;
  ItemUnit: string;
  ItemPrice: string;
  ItemAmt: string;
  TaxTypeForMixed?: "1" | "2" | "3";
  ItemTaxAmt: string;
  TotalAmt: string;
  BuyerEmail?: string;
  Status?: "0" | "1";
};
export type IssueAllowanceResult = {
  MerchantID: string;
  AllowanceNo: string;
  InvoiceNumber: string;
  MerchantOrderNo: string;
  AllowanceAmt: string;
  RemainAmt: string;
  CheckCode: string;
};
export type RevokeAllowanceResult = {
  MerchantID: string;
  AllowanceNo: string;
  CreateTime: string;
  CheckCode: string;
};

export type QueryInvoiceProps = {
  /** 商店於開立發票時帶入的自訂編號 */
  MerchantOrderNo?: string;
  /** 純數字，為發票總金額(含稅) */
  TotalAmt?: string;
  /** 此次查詢的發票號碼 */
  InvoiceNumber?: string;
  /** 於開立發票時，所產生的 4 碼發票防偽隨機碼 */
  RandomNum?: string;
};

export type QueryInvoiceResult = {
  /** ezPay 電子發票加值服務平台商店代號 */
  MerchantID: string;
  /** ezPay 電子發票開立序號 */
  InvoiceTransNo: string;
  /** 商店於開立發票時帶入的自訂編號 */
  MerchantOrderNo: string;
  /** 此次查詢的發票號碼 */
  InvoiceNumber: string;
  /** 於開立發票時，所產生的 4 碼發票防偽隨機碼 */
  RandomNum: string;
  /** 開立發票時的買受人名稱，個人姓名或營業人名稱 */
  BuyerName: string;
  /** 於開立發票時，該張發票的買受人統一編號 */
  BuyerUBN?: string;
  /** 於開立發票時，該張發票的買受人地址 */
  BuyerAddress?: string;
  /** 於開立發票時，該張發票的買受人手機號碼 */
  BuyerPhone?: string;
  /** 於開立發票時，該張發票的買受人電子信箱 */
  BuyerEmail?: string;
  /** 該張發票的發票字軌類型。07=一般稅額計算, 08=特種稅額計算 */
  InvoiceType: "07" | "08";
  /** 該張發票的發票種類。B2B=買受人為營業人(有統編), B2C=買受人為個人 */
  Category: "B2B" | "B2C";
  /** 該張發票的課稅別。1=應稅, 2=零稅率, 3=免稅, 9=混合應稅與免稅或零稅率 */
  TaxType: "1" | "2" | "3" | "9";
  /** 該張發票的稅率，例：0.05 */
  TaxRate: number;
  /** 純數字，為發票銷售額(課稅別應稅的未稅金額) */
  Amt: number;
  /** 純數字，為發票銷售額(課稅別應稅的未稅金額) */
  AmtSales: number;
  /** 純數字，為發票銷售額(課稅別零稅率的未稅金額) */
  AmtZero: number;
  /** 純數字，為發票銷售額(課稅別免稅的未稅金額) */
  AmtFree: number;
  /** 純數字，為發票稅額 */
  TaxAmt: number;
  /** 純數字，為發票總金額(含稅) */
  TotalAmt: number;
  /** 該張發票儲存的載具類別。0=手機條碼載具, 1=自然人憑證條碼載具, 2=ezPay 電子發票載具。若買受人無提供載具，則此參數為空值。當 Category=B2C 時，才適用此參數。 */
  CarrierType?: "0" | "1" | "2";
  /** 該張發票儲存的載具之載具編號 */
  CarrierNum?: string;
  /** 該張發票捐贈的捐贈碼。買受人選擇不捐贈則此參數為空值。當 Category=B2C 時，才適用此參數。 */
  LoveCode?: string;
  /** 該張發票是否索取紙本發票。Y=索取(營業人可於本平台列印此發票), N=不索取 */
  PrintFlag: "Y" | "N";
  /** 該張發票是否開放買受人可至本平台合作之超商 Kiosk 進行列印。1 = 發票中獎後開放 */
  KioskPrintFlag?: "1";
  /** 該張發票開立時間，例：2014-09-25 12:12:12 */
  CreateTime: string;
  /** 該張發票開立時的商品資訊(JSON 格式) */
  ItemDetail: string;
  /** 該張發票之發票狀態。1 = 已開立 (有產生發票號碼), 2 = 已作廢 */
  InvoiceStatus: "1" | "2";
  /** 該張發票上傳財政部之狀態。0 = 未上傳, 1 =已上傳成功, 2 = 上傳中, 3 = 上傳失敗, 4 = 上傳逾時 */
  UploadStatus: "0" | "1" | "2" | "3" | "4";
  /** 用來檢查此次資料回傳的合法性，企業用戶串接時可以比對此參數資料來檢核是否為 ezPay 電子發票平台所回傳 */
  CheckCode: string;
  /** 當 PrintFlag=Y 索取紙本發票時，才提供此參數。提供兌領獎時輸入使用，記載項目含發票期別、發票字軌號碼及隨機碼。 */
  BarCode?: string;
  /** 當 PrintFlag=Y 索取紙本發票時，才提供此參數。提供行動應用時讀取發票資訊及資訊防偽用途。 */
  QRcodeL?: string;
  /** 當 PrintFlag=Y 索取紙本發票時，才提供此參數。接續左方二維條碼不敷記載之中文編碼後資訊。 */
  QRcodeR?: string;
  /** 固定回傳 ##，使用 String 方式接收資料的用戶，須多判斷 EndStr=##，確保資料傳遞完整。 */
  EndStr: string;
};

export default EzpayInvoiceClient;
