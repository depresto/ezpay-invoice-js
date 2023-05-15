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
}
export type RevokeAllowanceResult = {
  MerchantID: string;
  AllowanceNo: string;
  CreateTime: string;
  CheckCode: string;
};

export default EzpayInvoiceClient;
