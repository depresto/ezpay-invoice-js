/**
 * validateInvoiceIssueParams 單元測試
 *
 * 背景：havppen-api-v1 實際下單開票會用 CarrierType=2（會員載具，無需 CarrierNum）
 * 與 CarrierType=0（手機條碼，數字 0）這兩種呼叫方式。這兩種都是既有生產環境的
 * 常見路徑，任何驗證邏輯的調整都不能讓它們變成拋錯。
 */

import { validateInvoiceIssueParams } from "./validator";
import { InvoiceIssueParams } from "../types";

function buildBaseParams(
  overrides: Partial<InvoiceIssueParams> = {}
): InvoiceIssueParams {
  return {
    MerchantOrderNo: "order-1",
    Category: "B2C",
    BuyerName: "測試使用者",
    BuyerEmail: "test@example.com",
    Amt: 100,
    ItemName: "商品",
    ItemCount: "1",
    ItemUnit: "個",
    ItemPrice: "100",
    ItemAmt: "100",
    PrintFlag: "N",
    ...overrides,
  } as InvoiceIssueParams;
}

describe("validateInvoiceIssueParams — CarrierType 相容性", () => {
  it("CarrierType=2（會員載具）不帶 CarrierNum 不應拋錯", () => {
    expect(() =>
      validateInvoiceIssueParams(
        buildBaseParams({ CarrierType: "2" as InvoiceIssueParams["CarrierType"] })
      )
    ).not.toThrow();
  });

  it("CarrierType 為數字 0（手機條碼，呼叫端誤傳數字型別）不應被誤判為未提供載具", () => {
    expect(() =>
      validateInvoiceIssueParams(
        buildBaseParams({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 刻意模擬呼叫端傳入數字型別
          CarrierType: 0 as any,
          CarrierNum: "/ABC1234",
        })
      )
    ).not.toThrow();
  });

  it("CarrierType='0'（手機條碼）沒有 CarrierNum 仍應拋錯（真正缺少載具編號）", () => {
    expect(() =>
      validateInvoiceIssueParams(buildBaseParams({ CarrierType: "0" }))
    ).toThrow(/提供載具類別時必須提供載具編號/);
  });

  it("B2C 不索取紙本、無載具、無愛心碼時仍應拋錯（既有規則不受影響）", () => {
    expect(() =>
      validateInvoiceIssueParams(buildBaseParams({ PrintFlag: "N" }))
    ).toThrow(/必須提供載具類別或愛心碼/);
  });

  it("CarrierType='1'（自然人憑證）沒有 CarrierNum 仍應拋錯", () => {
    expect(() =>
      validateInvoiceIssueParams(buildBaseParams({ CarrierType: "1" }))
    ).toThrow(/提供載具類別時必須提供載具編號/);
  });

  it("CarrierType 為不存在於規格的無效值（如 '3'）應拋錯，不可被靜默放行到 ezpay API", () => {
    expect(() =>
      validateInvoiceIssueParams(
        buildBaseParams({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 刻意模擬呼叫端傳入不合法的 CarrierType 值
          CarrierType: "3" as any,
        })
      )
    ).toThrow(/CarrierType.*不正確|不正確.*CarrierType/);
  });
});

/**
 * 統一編號檢查碼 — 2023-04 新制（%5）
 *
 * 背景：財政部自 2023-04 起發放的新統一編號改用「加權和可被 5 整除」的檢查碼規則，
 * 舊制（可被 10 整除）為其子集。原本寫死 %10 的驗證會把合法新統編誤判為格式錯，
 * 導致 B2B 開票在 client 端直接拋錯、根本送不到 ezpay（生產實際卡關案例：
 * app kaiyan 60560570、lustbookstore 60746149）。
 */
function buildB2BParams(
  overrides: Partial<InvoiceIssueParams> = {}
): InvoiceIssueParams {
  return buildBaseParams({
    Category: "B2B",
    BuyerUBN: "90410461",
    PrintFlag: "Y",
    ...overrides,
  });
}

describe("validateInvoiceIssueParams — 統一編號檢查碼（2023 新制 %5）", () => {
  it("新制統編 60560570（加權和 %5=0、第7碼為7）應通過", () => {
    expect(() =>
      validateInvoiceIssueParams(buildB2BParams({ BuyerUBN: "60560570" }))
    ).not.toThrow();
  });

  it("新制統編 60746149（加權和 %5=0、非第7碼特例）應通過", () => {
    expect(() =>
      validateInvoiceIssueParams(buildB2BParams({ BuyerUBN: "60746149" }))
    ).not.toThrow();
  });

  it("舊制統編 90410461（加權和 %10=0）仍應通過（不得回歸）", () => {
    expect(() =>
      validateInvoiceIssueParams(buildB2BParams({ BuyerUBN: "90410461" }))
    ).not.toThrow();
  });

  it("真正無效的統編（加權和 %5!=0，如 12345678）仍應拋錯", () => {
    expect(() =>
      validateInvoiceIssueParams(buildB2BParams({ BuyerUBN: "12345678" }))
    ).toThrow(/統一編號格式不正確/);
  });

  it("非 8 碼數字（如 1234567）仍應拋錯", () => {
    expect(() =>
      validateInvoiceIssueParams(buildB2BParams({ BuyerUBN: "1234567" }))
    ).toThrow(/BuyerUBN/);
  });
});
