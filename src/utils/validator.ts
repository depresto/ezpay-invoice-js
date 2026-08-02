/**
 * 參數驗證工具
 */

import { ValidationError } from "../errors";
import {
  InvoiceIssueParams,
  AllowanceIssueParams,
  InvoiceQueryParams,
} from "../types";

/**
 * 驗證必填欄位
 */
function validateRequired(value: unknown, fieldName: string): void {
  if (value === undefined || value === null || value === "") {
    throw new ValidationError(fieldName, "此欄位為必填");
  }
}

/**
 * 驗證字串長度
 */
function validateLength(
  value: string,
  fieldName: string,
  maxLength: number
): void {
  if (value && value.length > maxLength) {
    throw new ValidationError(
      fieldName,
      `字串長度不可超過 ${maxLength} 字元`
    );
  }
}

/**
 * 驗證數字範圍
 */
function validateNumber(
  value: number,
  fieldName: string,
  min?: number,
  max?: number
): void {
  if (isNaN(value)) {
    throw new ValidationError(fieldName, "必須為有效數字");
  }
  if (min !== undefined && value < min) {
    throw new ValidationError(fieldName, `數值不可小於 ${min}`);
  }
  if (max !== undefined && value > max) {
    throw new ValidationError(fieldName, `數值不可大於 ${max}`);
  }
}

/**
 * 驗證統一編號格式
 */
function validateUBN(ubn: string): boolean {
  // 統一編號必須為 8 位數字
  if (!/^\d{8}$/.test(ubn)) {
    return false;
  }

  // 統一編號檢查邏輯
  const weights = [1, 2, 1, 2, 1, 2, 4, 1];
  let sum = 0;

  for (let i = 0; i < 8; i++) {
    let product = parseInt(ubn[i]) * weights[i];
    if (product > 9) {
      product = Math.floor(product / 10) + (product % 10);
    }
    sum += product;
  }

  // 財政部 2023-04 起發放的新統一編號改用「加權和可被 5 整除」規則；
  // 舊制（可被 10 整除）為其子集，故一律以 %5 判定即可同時涵蓋新舊號。
  // 第 7 碼為 7 的加權特例（+1 後再判定）同步沿用 %5。
  return sum % 5 === 0 || (ubn[6] === "7" && (sum + 1) % 5 === 0);
}

/**
 * 驗證開立發票參數
 */
export function validateInvoiceIssueParams(
  params: InvoiceIssueParams
): void {
  // 必填欄位
  validateRequired(params.MerchantOrderNo, "MerchantOrderNo");
  validateRequired(params.Category, "Category");
  validateRequired(params.BuyerName, "BuyerName");
  validateRequired(params.Amt, "Amt");
  validateRequired(params.ItemName, "ItemName");
  validateRequired(params.ItemCount, "ItemCount");
  validateRequired(params.ItemUnit, "ItemUnit");
  validateRequired(params.ItemPrice, "ItemPrice");
  validateRequired(params.ItemAmt, "ItemAmt");

  // 長度驗證
  validateLength(params.MerchantOrderNo, "MerchantOrderNo", 20);
  validateLength(params.BuyerName, "BuyerName", 60);
  if (params.BuyerEmail) {
    validateLength(params.BuyerEmail, "BuyerEmail", 200);
  }
  if (params.BuyerAddress) {
    validateLength(params.BuyerAddress, "BuyerAddress", 200);
  }
  if (params.Comment) {
    validateLength(params.Comment, "Comment", 200);
  }

  // B2B 必須提供統一編號
  if (params.Category === "B2B") {
    validateRequired(params.BuyerUBN, "BuyerUBN");
    if (params.BuyerUBN) {
      validateLength(params.BuyerUBN, "BuyerUBN", 8);
      if (!validateUBN(params.BuyerUBN)) {
        throw new ValidationError("BuyerUBN", "統一編號格式不正確");
      }
    }
  }

  // CarrierType 型別宣告為字串 "0"/"1"/"2"，但呼叫端常見會傳入數字（如 0/1/2）。
  // 用 !params.CarrierType 判斷「是否有提供」在數字 0 時會誤判為 falsy（未提供），
  // 因此一律先正規化成字串再用「是否為 undefined/null/空字串」判斷有無提供。
  const normalizedCarrierType =
    params.CarrierType === undefined || params.CarrierType === null
      ? ""
      : String(params.CarrierType);

  // B2C 且不索取紙本時必須提供載具或愛心碼
  if (
    params.Category === "B2C" &&
    params.PrintFlag !== "Y" &&
    !normalizedCarrierType &&
    !params.LoveCode
  ) {
    throw new ValidationError(
      "CarrierType/LoveCode",
      "B2C 發票不索取紙本時，必須提供載具類別或愛心碼"
    );
  }

  // 有提供值時必須落在合法集合內，避免打錯字的無效值被「非 0/1 就不需要編號」
  // 的邏輯靜默放行，直到 ezpay API 才被拒絕、錯誤訊息也不清楚。
  if (
    normalizedCarrierType &&
    !["0", "1", "2"].includes(normalizedCarrierType)
  ) {
    throw new ValidationError("CarrierType", "載具類別格式不正確");
  }

  // 只有手機條碼（"0"）與自然人憑證（"1"）需要對應的載具編號；
  // 會員載具（"2"）以買受人資料識別，本來就不帶編號，不可比照要求。
  if (
    (normalizedCarrierType === "0" || normalizedCarrierType === "1") &&
    !params.CarrierNum
  ) {
    throw new ValidationError(
      "CarrierNum",
      "提供載具類別時必須提供載具編號"
    );
  }

  // 數值驗證
  validateNumber(params.Amt, "Amt", 0);
  if (params.TaxRate !== undefined) {
    validateNumber(params.TaxRate, "TaxRate", 0, 100);
  }
  if (params.LoveCode !== undefined) {
    const loveCodeStr = params.LoveCode.toString();
    if (loveCodeStr.length < 3 || loveCodeStr.length > 7) {
      throw new ValidationError("LoveCode", "愛心碼長度必須為 3-7 位數字");
    }
  }

  // 零稅率時必須提供通關方式
  if (params.TaxType === "2" && !params.CustomsClearance) {
    throw new ValidationError(
      "CustomsClearance",
      "課稅別為零稅率時必須提供通關方式"
    );
  }

  // 混合課稅時必須提供各課稅別金額
  if (params.TaxType === "9") {
    if (!params.AmtSales && !params.AmtZero && !params.AmtFree) {
      throw new ValidationError(
        "AmtSales/AmtZero/AmtFree",
        "混合課稅時必須提供各課稅別的銷售額"
      );
    }
    if (!params.ItemTaxType) {
      throw new ValidationError(
        "ItemTaxType",
        "混合課稅時必須提供商品課稅別"
      );
    }
  }

  // 商品明細數量一致性檢查
  const itemFields = [
    params.ItemName,
    params.ItemCount,
    params.ItemUnit,
    params.ItemPrice,
    params.ItemAmt,
  ];
  const itemCounts = itemFields.map((field) => field.split("|").length);
  const firstCount = itemCounts[0];

  if (!itemCounts.every((count) => count === firstCount)) {
    throw new ValidationError(
      "Item*",
      "商品明細各欄位數量必須一致（使用 | 分隔）"
    );
  }
}

/**
 * 驗證開立折讓參數
 */
export function validateAllowanceIssueParams(
  params: AllowanceIssueParams
): void {
  // 必填欄位
  validateRequired(params.InvoiceNo, "InvoiceNo");
  validateRequired(params.MerchantOrderNo, "MerchantOrderNo");
  validateRequired(params.ItemName, "ItemName");
  validateRequired(params.ItemCount, "ItemCount");
  validateRequired(params.ItemUnit, "ItemUnit");
  validateRequired(params.ItemPrice, "ItemPrice");
  validateRequired(params.ItemAmt, "ItemAmt");
  validateRequired(params.ItemTaxAmt, "ItemTaxAmt");
  validateRequired(params.TotalAmt, "TotalAmt");

  // 長度驗證
  validateLength(params.InvoiceNo, "InvoiceNo", 10);
  validateLength(params.MerchantOrderNo, "MerchantOrderNo", 20);
  if (params.BuyerEmail) {
    validateLength(params.BuyerEmail, "BuyerEmail", 200);
  }

  // 商品明細數量一致性檢查
  const itemFields = [
    params.ItemName,
    params.ItemCount,
    params.ItemUnit,
    params.ItemPrice,
    params.ItemAmt,
    params.ItemTaxAmt,
  ];
  const itemCounts = itemFields.map((field) => field.split("|").length);
  const firstCount = itemCounts[0];

  if (!itemCounts.every((count) => count === firstCount)) {
    throw new ValidationError(
      "Item*",
      "商品明細各欄位數量必須一致（使用 | 分隔）"
    );
  }
}

/**
 * 驗證查詢發票參數
 */
export function validateInvoiceQueryParams(params: InvoiceQueryParams): void {
  // MerchantOrderNo 或 InvoiceNumber 擇一必填
  if (!params.MerchantOrderNo && !params.InvoiceNumber) {
    throw new ValidationError(
      "MerchantOrderNo/InvoiceNumber",
      "必須提供商店自訂編號或發票號碼其中之一"
    );
  }
}
