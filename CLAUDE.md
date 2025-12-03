# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ezPay Invoice SDK for JavaScript/TypeScript - a client library for integrating with ezPay's electronic invoice API system. This SDK handles invoice operations (issue, revoke), allowance operations (issue, revoke), and invoice queries for both B2B and B2C transactions.

## Common Commands

### Build
```bash
pnpm build
# or
npm run build
```
Compiles TypeScript to CommonJS (ES5) in the `build/` directory.

### Testing
```bash
# Run all tests
pnpm test
# or
npm test

# Run a specific test
npx jest -t "issueB2CInvoice"
```
Tests run against ezPay's sandbox environment using test credentials in `src/ezpay.client.test.ts`.

### Publish
```bash
pnpm run deploy-npm
```
Builds and publishes to npm (requires appropriate access).

## Architecture

### Core Files
- **`src/index.ts`**: Main export and TypeScript type definitions for all API request/response types
- **`src/ezpay.client.ts`**: The `EzpayInvoiceClient` class implementing all API methods
- **`src/ezpay.client.test.ts`**: Integration tests for all client methods

### Client Architecture

The `EzpayInvoiceClient` class encapsulates all API interactions:

1. **Initialization**: Requires `merchantId`, `hashKey`, `hashIV`, and `env` (sandbox/production)
2. **Encryption**: Uses AES-256 encryption (`buildPostParams`) to encrypt API payloads with the provided `hashKey` and `hashIV`
3. **API Communication**: All methods route through the private `queryApi` method which:
   - Adds timestamp and response type to parameters
   - Encrypts the payload using `buildPostParams`
   - Posts to the appropriate ezPay API endpoint
   - Returns typed responses

### Public API Methods

- `issueInvoice(params)`: Issue a new invoice (B2B or B2C)
- `revokeInvoice(invoiceNumber, reason)`: Revoke/void an existing invoice
- `issueAllowance(params)`: Issue an allowance (discount/credit note) for an invoice
- `revokeAllowance(allowanceNumber, reason)`: Revoke an allowance
- `queryInvoice(params)`: Query invoice details by various criteria
- `getQueryInvoicePostData(params)`: Generate encrypted POST data for manual invoice queries

### Type System

All request and response types are defined in `src/index.ts`:
- `InvoiceProps`: Parameters for issuing invoices
- `IssueAllowanceProps`: Parameters for issuing allowances
- `QueryInvoiceProps`: Parameters for querying invoices
- `EzpayApiResponse<T>`: Generic wrapper for all API responses with `Status`, `Message`, and `Result`
- Specific result types for each operation (e.g., `IssueInvoiceResult`, `QueryInvoiceResult`)

### Testing Approach

Tests are integration tests that call the real sandbox API. Each test:
1. Uses `getRandomId()` to generate unique `MerchantOrderNo` values
2. Tests full workflows (e.g., issue then revoke)
3. Uses hardcoded sandbox credentials from ezPay's test environment
4. Validates `Status === "SUCCESS"` responses

### API Encryption Details

The SDK uses AES-256 CBC encryption:
- Key: `hashKey` (32 bytes)
- IV: `hashIV` (16 bytes)
- Format: URL-encoded POST data encrypted to hex string
- All API calls include `RespondType: "JSON"` and a Unix timestamp

### Environment Configuration

- **Sandbox**: `https://cinv.ezpay.com.tw/Api/`
- **Production**: `https://inv.ezpay.com.tw/Api/`

API endpoints are suffixed with action names: `invoice_issue`, `invoice_invalid`, `allowance_issue`, `allowanceInvalid`, `invoice_search`.
