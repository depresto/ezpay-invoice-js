/**
 * ezPay Invoice Client
 */

import axios, { AxiosError } from "axios";
import crypto from "crypto";
import {
  EzpayApiResponse,
  Environment,
  InvoiceIssueParams,
  InvoiceIssueResult,
  InvoiceInvalidResult,
  AllowanceIssueParams,
  AllowanceIssueResult,
  AllowanceInvalidResult,
  InvoiceQueryParams,
  InvoiceQueryResult,
} from "./types";
import {
  validateInvoiceIssueParams,
  validateAllowanceIssueParams,
  validateInvoiceQueryParams,
} from "./utils/validator";
import { ApiError, ConfigurationError } from "./errors";

/**
 * 客戶端配置選項
 */
export interface EzpayInvoiceClientConfig {
  /** ezPay 電子發票加值服務平台商店代號 */
  merchantId: string;
  /** ezPay 提供的 Hash Key */
  hashKey: string;
  /** ezPay 提供的 Hash IV */
  hashIV: string;
  /** 環境設定：sandbox (測試) 或 production (正式) */
  env: Environment;
  /** API 請求超時時間（毫秒），預設 30000 */
  timeout?: number;
}

/**
 * ezPay 電子發票客戶端
 */
export class EzpayInvoiceClient {
  private readonly apiEndpoint: string;
  private readonly merchantId: string;
  private readonly hashKey: string;
  private readonly hashIV: string;
  private readonly timeout: number;

  /**
   * 建立 ezPay 電子發票客戶端實例
   * @param config - 客戶端配置選項
   */
  constructor(config: EzpayInvoiceClientConfig) {
    // 驗證配置
    if (!config.merchantId) {
      throw new ConfigurationError("merchantId 為必填欄位");
    }
    if (!config.hashKey) {
      throw new ConfigurationError("hashKey 為必填欄位");
    }
    if (!config.hashIV) {
      throw new ConfigurationError("hashIV 為必填欄位");
    }
    if (config.hashKey.length !== 32) {
      throw new ConfigurationError("hashKey 長度必須為 32 字元");
    }
    if (config.hashIV.length !== 16) {
      throw new ConfigurationError("hashIV 長度必須為 16 字元");
    }

    this.merchantId = config.merchantId;
    this.hashKey = config.hashKey;
    this.hashIV = config.hashIV;
    this.timeout = config.timeout ?? 30000;

    this.apiEndpoint =
      config.env === "sandbox"
        ? "https://cinv.ezpay.com.tw/Api/"
        : "https://inv.ezpay.com.tw/Api/";
  }

  /**
   * 加密 POST 參數
   * @param params - 要加密的參數物件
   * @returns 加密後的十六進位字串
   */
  private buildPostParams(params: Record<string, unknown>): string {
    const postData = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    const cipher = crypto.createCipheriv("aes256", this.hashKey, this.hashIV);
    let encrypted = cipher.update(postData, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }

  /**
   * 呼叫 ezPay API
   * @param action - API 動作名稱
   * @param params - API 參數
   * @returns API 回應結果
   */
  private async queryApi<T>(
    action: string,
    params: Record<string, unknown>
  ): Promise<EzpayApiResponse<T>> {
    try {
      const query = new URLSearchParams({
        MerchantID_: this.merchantId,
        PostData_: this.buildPostParams({
          RespondType: "JSON",
          TimeStamp: Math.floor(Date.now() / 1000),
          ...params,
        }),
      });

      const { data } = await axios.post<EzpayApiResponse<T>>(
        `${this.apiEndpoint}${action}`,
        query,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: this.timeout,
        }
      );

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new ApiError(
          `API 請求失敗: ${axiosError.message}`,
          axiosError.response?.status?.toString(),
          axiosError
        );
      }
      throw new ApiError("未知錯誤", undefined, error);
    }
  }

  /**
   * 開立發票
   * @param params - 開立發票參數
   * @returns 開立發票結果
   */
  public async issueInvoice(
    params: InvoiceIssueParams
  ): Promise<EzpayApiResponse<InvoiceIssueResult>> {
    // 參數驗證
    validateInvoiceIssueParams(params);

    // 設定預設值
    const requestParams = {
      Version: "1.5",
      TransNum: "",
      TaxType: "1",
      Status: "1",
      CreateStatusTime: "",
      TaxRate: 5,
      TaxAmt: params.Amt * 0.05,
      TotalAmt: params.Amt * 1.05,
      PrintFlag: "N",
      CarrierNum: params.BuyerEmail ?? params.BuyerPhone,
      ...params,
    };

    const data = await this.queryApi<string | InvoiceIssueResult>(
      "invoice_issue",
      requestParams
    );

    // 處理回應結果（可能是 JSON 字串或物件）
    let result = data.Result;
    if (typeof result === "string") {
      try {
        result = JSON.parse(result) as InvoiceIssueResult;
      } catch {
        // 如果解析失敗，保持原值
      }
    }

    return {
      Status: data.Status,
      Message: data.Message,
      Result: result as InvoiceIssueResult | null,
    };
  }

  /**
   * 作廢發票
   * @param invoiceNumber - 發票號碼
   * @param invalidReason - 作廢原因（選填）
   * @returns 作廢發票結果
   */
  public async invalidInvoice(
    invoiceNumber: string,
    invalidReason = ""
  ): Promise<EzpayApiResponse<InvoiceInvalidResult>> {
    if (!invoiceNumber) {
      throw new ApiError("invoiceNumber 為必填欄位");
    }

    const data = await this.queryApi<string | InvoiceInvalidResult>(
      "invoice_invalid",
      {
        Version: "1.0",
        InvoiceNumber: invoiceNumber,
        InvalidReason: invalidReason,
      }
    );

    // 處理回應結果（可能是 JSON 字串或物件）
    let result = data.Result;
    if (typeof result === "string") {
      try {
        result = JSON.parse(result) as InvoiceInvalidResult;
      } catch {
        // 如果解析失敗，保持原值
      }
    }

    return {
      Status: data.Status,
      Message: data.Message,
      Result: result as InvoiceInvalidResult | null,
    };
  }

  /**
   * 開立折讓
   * @param params - 開立折讓參數
   * @returns 開立折讓結果
   */
  public async issueAllowance(
    params: AllowanceIssueParams
  ): Promise<EzpayApiResponse<AllowanceIssueResult>> {
    // 參數驗證
    validateAllowanceIssueParams(params);

    const requestParams = {
      Version: "1.3",
      Status: "1",
      ...params,
    };

    const data = await this.queryApi<string | AllowanceIssueResult>(
      "allowance_issue",
      requestParams
    );

    // 處理回應結果
    let result = data.Result;
    if (typeof result === "string") {
      try {
        result = JSON.parse(result) as AllowanceIssueResult;
      } catch {
        // 如果解析失敗，保持原值
      }
    }

    return {
      Status: data.Status,
      Message: data.Message,
      Result: result as AllowanceIssueResult | null,
    };
  }

  /**
   * 作廢折讓
   * @param allowanceNo - 折讓單號碼
   * @param invalidReason - 作廢原因（選填）
   * @returns 作廢折讓結果
   */
  public async invalidAllowance(
    allowanceNo: string,
    invalidReason = ""
  ): Promise<EzpayApiResponse<AllowanceInvalidResult>> {
    if (!allowanceNo) {
      throw new ApiError("allowanceNo 為必填欄位");
    }

    const data = await this.queryApi<string | AllowanceInvalidResult>(
      "allowanceInvalid",
      {
        Version: "1.0",
        AllowanceNo: allowanceNo,
        InvalidReason: invalidReason,
      }
    );

    // 處理回應結果（可能是 JSON 字串或物件）
    let result = data.Result;
    if (typeof result === "string") {
      try {
        result = JSON.parse(result) as AllowanceInvalidResult;
      } catch {
        // 如果解析失敗，保持原值
      }
    }

    return {
      Status: data.Status,
      Message: data.Message,
      Result: result as AllowanceInvalidResult | null,
    };
  }

  /**
   * 查詢發票
   * @param params - 查詢發票參數
   * @returns 查詢發票結果
   */
  public async queryInvoice(
    params: InvoiceQueryParams
  ): Promise<EzpayApiResponse<InvoiceQueryResult>> {
    // 參數驗證
    validateInvoiceQueryParams(params);

    const data = await this.queryApi<string | InvoiceQueryResult>(
      "invoice_search",
      {
        Version: "1.3",
        ...params,
      }
    );

    if (data.Status !== "SUCCESS") {
      return {
        Status: data.Status,
        Message: data.Message,
        Result: null,
      };
    }

    // 處理回應結果
    let result = data.Result;
    if (typeof result === "string") {
      try {
        result = JSON.parse(result) as InvoiceQueryResult;
      } catch {
        // 如果解析失敗，保持原值
      }
    }

    return {
      Status: data.Status,
      Message: data.Message,
      Result: result as InvoiceQueryResult | null,
    };
  }

  /**
   * 產生查詢發票的 POST 資料（用於手動查詢）
   * @param params - 查詢發票參數
   * @returns 加密後的 POST 資料
   */
  public getQueryInvoicePostData(params: InvoiceQueryParams): string {
    validateInvoiceQueryParams(params);

    return this.buildPostParams({
      Version: "1.3",
      RespondType: "JSON",
      TimeStamp: Math.floor(Date.now() / 1000),
      ...params,
    });
  }
}
