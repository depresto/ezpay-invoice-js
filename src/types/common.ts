/**
 * ezPay API 通用類型定義
 */

/**
 * API 回應格式
 * @template T - 回應結果的資料類型
 */
export interface EzpayApiResponse<T> {
  /** API 狀態碼，成功為 "SUCCESS" */
  Status: string;
  /** API 回應訊息 */
  Message: string;
  /** API 回應結果資料 */
  Result: T | null;
}

/**
 * 環境設定
 */
export type Environment = "sandbox" | "production";

/**
 * 發票類別
 * - B2B: 買受人為營業人（有統編）
 * - B2C: 買受人為個人
 */
export type InvoiceCategory = "B2B" | "B2C";

/**
 * 開立發票方式
 * - "0": 等待觸發開立
 * - "1": 即時開立
 * - "3": 預約自動開立
 */
export type InvoiceStatus = "0" | "1" | "3";

/**
 * 課稅別
 * - "1": 應稅
 * - "2": 零稅率
 * - "3": 免稅
 * - "9": 混合應稅與免稅或零稅率
 */
export type TaxType = "1" | "2" | "3" | "9";

/**
 * 載具類別
 * - "0": 手機條碼載具
 * - "1": 自然人憑證條碼載具
 * - "2": ezPay 電子發票載具
 */
export type CarrierType = "0" | "1" | "2";

/**
 * 列印註記
 * - "Y": 索取紙本發票（營業人可於本平台列印此發票）
 * - "N": 不索取紙本發票
 */
export type PrintFlag = "Y" | "N";

/**
 * Kiosk 列印註記
 * - "1": 發票中獎後開放於超商 Kiosk 列印
 */
export type KioskPrintFlag = "1";

/**
 * 通關方式
 * - "1": 非經海關出口
 * - "2": 經海關出口
 */
export type CustomsClearance = "1" | "2";

/**
 * 折讓狀態
 * - "0": 等待觸發開立
 * - "1": 即時開立
 */
export type AllowanceStatus = "0" | "1";
