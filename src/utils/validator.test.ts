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
