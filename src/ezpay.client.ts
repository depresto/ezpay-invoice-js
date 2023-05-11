import axios from "axios";
import crypto from "crypto";
import {
  IssueAllowanceProps,
  EzpayApiResponse,
  InvoiceProps,
  IssueInvoiceResult,
  RevokeInvoiceResult,
  IssueAllowanceResult,
  RevokeAllowanceResult,
} from ".";

class EzpayInvoiceClient {
  apiEndpoint: string;
  merchantId: string;
  hashKey: string;
  hashIV: string;

  constructor(params: {
    merchantId: string;
    hashKey: string;
    hashIV: string;
    env: "sandbox" | "production";
  }) {
    this.merchantId = params.merchantId;
    this.hashKey = params.hashKey;
    this.hashIV = params.hashIV;

    this.apiEndpoint =
      params.env === "sandbox"
        ? "https://cinv.ezpay.com.tw/Api/"
        : "https://inv.ezpay.com.tw/Api/";
  }

  private buildPostParams(params: { [key: string]: any }) {
    const postData = new URLSearchParams(params).toString();
    const cipher = crypto.createCipheriv("aes256", this.hashKey, this.hashIV);
    let encrypted = cipher.update(postData, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }

  public async issueInvoice(
    params: InvoiceProps
  ): Promise<EzpayApiResponse<IssueInvoiceResult>> {
    const data = await this.queryApi("invoice_issue", {
      Version: "1.5",
      TransNum: "",
      TaxType: "1",
      Status: "1",
      CreateStatusTime: "",
      TaxRate: 5,
      TaxAmt: params.Amt * 0.05,
      TotalAmt: params.Amt * 1.05,
      PrintFlag: "N",
      CarrierType: "2",
      CarrierNum: params.BuyerEmail ?? params.BuyerPhone,
      ...params,
    });

    let Result = data.Result;
    try {
      Result = JSON.parse(data.Result);
    } catch {}

    return {
      Status: data.Status,
      Message: data.Message,
      Result,
    };
  }

  public async revokeInvoice(
    InvoiceNumber: string,
    InvalidReason = ""
  ): Promise<EzpayApiResponse<RevokeInvoiceResult>> {
    return this.queryApi("invoice_invalid", {
      Version: "1.0",
      InvoiceNumber,
      InvalidReason,
    });
  }

  public async issueAllowance(
    params: IssueAllowanceProps
  ): Promise<EzpayApiResponse<IssueAllowanceResult>> {
    const data = await this.queryApi("allowance_issue", {
      Version: "1.3",
      Status: "1",
      ...params,
    });

    let Result = data.Result;
    try {
      Result = JSON.parse(data.Result);
    } catch {}

    return {
      Status: data.Status,
      Message: data.Message,
      Result,
    };
  }

  public async revokeAllowance(
    AllowanceNo: string,
    InvalidReason = ""
  ): Promise<EzpayApiResponse<RevokeAllowanceResult>> {
    return this.queryApi("allowanceInvalid", {
      Version: "1.0",
      AllowanceNo,
      InvalidReason,
    });
  }

  private async queryApi(
    action: string,
    params: { [key: string]: any }
  ): Promise<EzpayApiResponse<any>> {
    const query = new URLSearchParams({
      MerchantID_: this.merchantId.toString(),
      PostData_: this.buildPostParams({
        RespondType: "JSON",
        TimeStamp: ~~(Date.now() / 1000),
        ...params,
      }),
    });
    const { data } = await axios.post(`${this.apiEndpoint}${action}`, query, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return data;
  }
}

export default EzpayInvoiceClient;
