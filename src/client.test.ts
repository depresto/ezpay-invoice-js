/**
 * ezPay Invoice Client Tests
 */

import { EzpayInvoiceClient } from "./client";
import { ValidationError, ConfigurationError } from "./errors";

const getRandomId = (): string =>
  Math.floor(Math.random() * 1_000_000).toString();

const client = new EzpayInvoiceClient({
  merchantId: "34633793",
  hashKey: "g07Clo64yO9twIuDIQeNnKg62u3kPjFS",
  hashIV: "CBSBm1IlbqLBRtJP",
  env: "sandbox",
});

describe("EzpayInvoiceClient", () => {
  describe("Constructor", () => {
    it("should throw ConfigurationError if merchantId is missing", () => {
      expect(() => {
        new EzpayInvoiceClient({
          merchantId: "",
          hashKey: "g07Clo64yO9twIuDIQeNnKg62u3kPjFS",
          hashIV: "CBSBm1IlbqLBRtJP",
          env: "sandbox",
        });
      }).toThrow(ConfigurationError);
    });

    it("should throw ConfigurationError if hashKey length is invalid", () => {
      expect(() => {
        new EzpayInvoiceClient({
          merchantId: "34633793",
          hashKey: "invalid",
          hashIV: "CBSBm1IlbqLBRtJP",
          env: "sandbox",
        });
      }).toThrow(ConfigurationError);
    });

    it("should throw ConfigurationError if hashIV length is invalid", () => {
      expect(() => {
        new EzpayInvoiceClient({
          merchantId: "34633793",
          hashKey: "g07Clo64yO9twIuDIQeNnKg62u3kPjFS",
          hashIV: "invalid",
          env: "sandbox",
        });
      }).toThrow(ConfigurationError);
    });
  });

  describe("issueInvoice", () => {
    it("should issue B2C invoice successfully", async () => {
      const data = await client.issueInvoice({
        MerchantOrderNo: getRandomId(),
        Category: "B2C",
        BuyerEmail: "wayne@havbitx.com",
        BuyerName: "測試使用者",
        CarrierType: "2",
        CarrierNum: "wayne@havbitx.com",
        Amt: 1000,
        ItemName: "測試商品",
        ItemCount: "1",
        ItemUnit: "個",
        ItemPrice: "1000",
        ItemAmt: "1000",
      });

      expect(data.Status).toBe("SUCCESS");
      expect(data.Result).toBeDefined();
      if (data.Result) {
        expect(data.Result.InvoiceNumber).toBeDefined();
        expect(data.Result.RandomNum).toBeDefined();
      }
    }, 30000);

    it("should throw ValidationError if required fields are missing", async () => {
      await expect(
        client.issueInvoice({
          MerchantOrderNo: "",
          Category: "B2C",
          BuyerName: "測試使用者",
          Amt: 1000,
          ItemName: "測試商品",
          ItemCount: "1",
          ItemUnit: "個",
          ItemPrice: "1000",
          ItemAmt: "1000",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if item fields count mismatch", async () => {
      await expect(
        client.issueInvoice({
          MerchantOrderNo: getRandomId(),
          Category: "B2C",
          BuyerEmail: "wayne@havbitx.com",
          BuyerName: "測試使用者",
          Amt: 1000,
          ItemName: "商品1|商品2",
          ItemCount: "1",
          ItemUnit: "個",
          ItemPrice: "1000",
          ItemAmt: "1000",
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("invalidInvoice", () => {
    it("should invalid invoice successfully", async () => {
      // 先開立一張發票
      const issueData = await client.issueInvoice({
        MerchantOrderNo: getRandomId(),
        Category: "B2C",
        BuyerEmail: "wayne@havbitx.com",
        BuyerName: "測試使用者",
        CarrierType: "2",
        CarrierNum: "wayne@havbitx.com",
        Amt: 1000,
        ItemName: "測試商品",
        ItemCount: "1",
        ItemUnit: "個",
        ItemPrice: "1000",
        ItemAmt: "1000",
      });

      expect(issueData.Status).toBe("SUCCESS");
      expect(issueData.Result).toBeDefined();

      if (!issueData.Result) return;

      // 作廢發票
      const { InvoiceNumber } = issueData.Result;
      const invalidData = await client.invalidInvoice(
        InvoiceNumber,
        "測試發票作廢"
      );

      expect(invalidData.Status).toBe("SUCCESS");
      expect(invalidData.Result).toBeDefined();
      if (invalidData.Result) {
        expect(invalidData.Result.InvoiceNumber).toBe(InvoiceNumber);
      }
    }, 30000);
  });

  describe("issueAllowance", () => {
    it("should issue allowance successfully", async () => {
      const MerchantOrderNo = getRandomId();

      // 先開立一張發票
      const issueData = await client.issueInvoice({
        MerchantOrderNo,
        Category: "B2C",
        BuyerEmail: "wayne@havbitx.com",
        BuyerName: "測試使用者",
        CarrierType: "2",
        CarrierNum: "wayne@havbitx.com",
        Amt: 2000,
        ItemName: "測試商品1|測試商品2",
        ItemCount: "1|1",
        ItemUnit: "個|個",
        ItemPrice: "1000|1000",
        ItemAmt: "1000|1000",
      });

      expect(issueData.Status).toBe("SUCCESS");
      expect(issueData.Result).toBeDefined();

      if (!issueData.Result) return;

      // 開立折讓
      const { InvoiceNumber } = issueData.Result;
      const allowanceData = await client.issueAllowance({
        InvoiceNo: InvoiceNumber,
        MerchantOrderNo,
        ItemName: "測試商品1",
        ItemCount: "1",
        ItemUnit: "個",
        ItemPrice: "1000",
        ItemAmt: "1000",
        ItemTaxAmt: "0",
        TotalAmt: "1000",
      });

      expect(allowanceData.Status).toBe("SUCCESS");
      expect(allowanceData.Result).toBeDefined();
      if (allowanceData.Result) {
        expect(allowanceData.Result.AllowanceNo).toBeDefined();
        expect(allowanceData.Result.InvoiceNumber).toBe(InvoiceNumber);
      }
    }, 30000);
  });

  describe("invalidAllowance", () => {
    it("should invalid allowance successfully", async () => {
      const MerchantOrderNo = getRandomId();

      // 先開立一張發票
      const issueData = await client.issueInvoice({
        MerchantOrderNo,
        Category: "B2C",
        BuyerEmail: "wayne@havbitx.com",
        BuyerName: "測試使用者",
        CarrierType: "2",
        CarrierNum: "wayne@havbitx.com",
        Amt: 2000,
        ItemName: "測試商品1|測試商品2",
        ItemCount: "1|1",
        ItemUnit: "個|個",
        ItemPrice: "1000|1000",
        ItemAmt: "1000|1000",
      });

      expect(issueData.Status).toBe("SUCCESS");
      expect(issueData.Result).toBeDefined();

      if (!issueData.Result) return;

      // 開立折讓
      const { InvoiceNumber } = issueData.Result;
      const allowanceData = await client.issueAllowance({
        InvoiceNo: InvoiceNumber,
        MerchantOrderNo,
        ItemName: "測試商品1",
        ItemCount: "1",
        ItemUnit: "個",
        ItemPrice: "1000",
        ItemAmt: "1000",
        ItemTaxAmt: "0",
        TotalAmt: "1000",
      });

      expect(allowanceData.Status).toBe("SUCCESS");
      expect(allowanceData.Result).toBeDefined();

      if (!allowanceData.Result) return;

      // 作廢折讓
      const { AllowanceNo } = allowanceData.Result;
      const invalidData = await client.invalidAllowance(
        AllowanceNo,
        "測試折讓作廢"
      );

      expect(invalidData.Status).toBe("SUCCESS");
      expect(invalidData.Result).toBeDefined();
      if (invalidData.Result) {
        expect(invalidData.Result.AllowanceNo).toBe(AllowanceNo);
      }
    }, 30000);
  });

  describe("queryInvoice", () => {
    it("should query invoice successfully", async () => {
      const data = await client.queryInvoice({
        InvoiceNumber: "NM00000036",
        RandomNum: "4573",
      });

      expect(data.Status).toBe("SUCCESS");
      expect(data.Result).toBeDefined();
      if (data.Result) {
        expect(data.Result.InvoiceNumber).toBe("NM00000036");
      }
    }, 30000);

    it("should throw ValidationError if both params are missing", async () => {
      await expect(client.queryInvoice({})).rejects.toThrow(ValidationError);
    });
  });

  describe("getQueryInvoicePostData", () => {
    it("should generate encrypted post data", () => {
      const postData = client.getQueryInvoicePostData({
        InvoiceNumber: "NM00000036",
        RandomNum: "4573",
      });

      expect(postData).toBeDefined();
      expect(typeof postData).toBe("string");
      expect(postData.length).toBeGreaterThan(0);
    });
  });
});
