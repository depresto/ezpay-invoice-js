import axios from "axios";
import crypto from "crypto";

export type InvoiceResponse<T> = {
  Status: string;
  Message: string;
  Result: T | null;
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
};
export type RevokeInvoiceResult = {
  MerchantID: string;
  InvoiceNumber: string;
  CreateTime: string;
  CheckCode: string;
};

export type InvoiceProps = {
  Version?: string;
  TimeStamp?: number;
  TransNum?: string;
  MerchantOrderNo: string;
  Status?: "0" | "1";
  CreateStatusTime?: string;
  Category: "B2B" | "B2C";
  BuyerName: string;
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
  TotalAmt: number;
  ItemName: string;
  ItemCount: string;
  ItemUnit: string;
  ItemPrice: string;
  ItemAmt: string;
  ItemTaxType?: string;
  Comment?: string;
};

class EzpayInvoiceClient {
  version = "1.5";
  merchantId: string;
  hashKey: string;
  hashIV: string;
  dryRun: boolean;
  constructor(params: {
    merchantId: string;
    hashKey: string;
    hashIV: string;
    env: "sandbox" | "production";
    version?: string;
  }) {
    this.merchantId = params.merchantId;
    this.hashKey = params.hashKey;
    this.hashIV = params.hashIV;
    this.dryRun = params.env === "sandbox";

    if (params.version) {
      this.version = params.version;
    }
  }

  private buildPostParams(params: { [key: string]: any }) {
    const postData = new URLSearchParams(params).toString();
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      this.hashKey,
      this.hashIV
    );
    let encrypted = cipher.update(postData, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }

  public async issueInvoice(
    params: InvoiceProps
  ): Promise<InvoiceResponse<IssueInvoiceResult>> {
    const query = new URLSearchParams({
      MerchantID_: this.merchantId.toString(),
      PostData_: this.buildPostParams({
        RespondType: "JSON",
        Version: "1.5",
        TimeStamp: ~~(Date.now() / 1000),
        TransNum: "",
        TaxType: "1",
        Status: "1",
        CreateStatusTime: "",
        TaxRate: 5,
        TaxAmt: 0,
        ...params,
      }),
    });
    const { data } = await axios.post(
      this.dryRun === true
        ? "https://cinv.ezpay.com.tw/Api/invoice_issue"
        : "https://inv.ezpay.com.tw/Api/invoice_issue",
      query.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return {
      Status: data.Status,
      Message: data.Message,
      Result: data.Result ? JSON.parse(data.Result) : null,
    };
  }

  public async revokeInvoice(
    InvoiceNumber: string,
    InvalidReason = ""
  ): Promise<InvoiceResponse<RevokeInvoiceResult>> {
    const query = new URLSearchParams({
      MerchantID_: this.merchantId.toString(),
      PostData_: this.buildPostParams({
        RespondType: "JSON",
        Version: "1.0",
        TimeStamp: ~~(Date.now() / 1000),
        InvoiceNumber,
        InvalidReason,
      }),
    });
    const { data } = await axios.post(
      this.dryRun === true
        ? "https://cinv.ezpay.com.tw/Api/invoice_invalid"
        : "https://inv.ezpay.com.tw/Api/invoice_invalid",
      query.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return data;
  }
}

export default EzpayInvoiceClient;
