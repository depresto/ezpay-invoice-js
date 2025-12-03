/**
 * ezPay Invoice SDK 錯誤類型定義
 */

/**
 * SDK 基礎錯誤類別
 */
export class EzpayInvoiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EzpayInvoiceError";
    Object.setPrototypeOf(this, EzpayInvoiceError.prototype);
  }
}

/**
 * 參數驗證錯誤
 */
export class ValidationError extends EzpayInvoiceError {
  public field: string;

  constructor(field: string, message: string) {
    super(`參數驗證失敗: ${field} - ${message}`);
    this.name = "ValidationError";
    this.field = field;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * API 請求錯誤
 */
export class ApiError extends EzpayInvoiceError {
  public status?: string;
  public originalError?: unknown;

  constructor(message: string, status?: string, originalError?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.originalError = originalError;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * 配置錯誤
 */
export class ConfigurationError extends EzpayInvoiceError {
  constructor(message: string) {
    super(`配置錯誤: ${message}`);
    this.name = "ConfigurationError";
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}
