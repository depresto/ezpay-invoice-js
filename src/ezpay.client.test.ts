import EzpayInvoiceClient from "./ezpay.client";

const getRandomId = () => Math.floor(Math.random() * 1_000_000).toString();

const client = new EzpayInvoiceClient({
  merchantId: "34633793",
  hashKey: "g07Clo64yO9twIuDIQeNnKg62u3kPjFS",
  hashIV: "CBSBm1IlbqLBRtJP",
  env: "sandbox",
});

test("issueB2CInvoice", async () => {
  const data = await client.issueInvoice({
    MerchantOrderNo: getRandomId(),
    Category: "B2C",
    BuyerEmail: "wayne@havbitx.com",
    BuyerName: "測試使用者",
    Amt: 1000,
    ItemName: "測試商品",
    ItemCount: "1",
    ItemUnit: "個",
    ItemPrice: "1000",
    ItemAmt: "1000",
  });

  expect(data.Status).toBe("SUCCESS");
});

test("revokeInvoice", async () => {
  const data = await client.issueInvoice({
    MerchantOrderNo: getRandomId(),
    Category: "B2C",
    BuyerEmail: "wayne@havbitx.com",
    BuyerName: "測試使用者",
    Amt: 1000,
    ItemName: "測試商品",
    ItemCount: "1",
    ItemUnit: "個",
    ItemPrice: "1000",
    ItemAmt: "1000",
  });
  expect(data.Status).toBe("SUCCESS");

  if (!data.Result) return;

  const { InvoiceNumber } = data.Result;
  const revokeInvoiceData = await client.revokeInvoice(
    InvoiceNumber,
    "測試發票作廢"
  );
  expect(revokeInvoiceData.Status).toBe("SUCCESS");
});

test("issueAllowance", async () => {
  const MerchantOrderNo = getRandomId();
  const data = await client.issueInvoice({
    MerchantOrderNo,
    Category: "B2C",
    BuyerEmail: "wayne@havbitx.com",
    BuyerName: "測試使用者",
    Amt: 1000,
    ItemName: "測試商品|測試商品2",
    ItemCount: "1|1",
    ItemUnit: "個|個",
    ItemPrice: "1000|1000",
    ItemAmt: "1000|1000",
  });
  expect(data.Status).toBe("SUCCESS");

  if (!data.Result) return;

  const { InvoiceNumber } = data.Result;
  const allowanceData = await client.issueAllowance({
    InvoiceNo: InvoiceNumber,
    MerchantOrderNo,
    ItemName: "測試商品",
    ItemCount: "1",
    ItemUnit: "個",
    ItemPrice: "1000",
    ItemAmt: "1000",
    ItemTaxAmt: "0",
    TotalAmt: "1000",
  });
  expect(allowanceData.Status).toBe("SUCCESS");
});

test("revokeAllowance", async () => {
  const MerchantOrderNo = getRandomId();
  const data = await client.issueInvoice({
    MerchantOrderNo,
    Category: "B2C",
    BuyerEmail: "wayne@havbitx.com",
    BuyerName: "測試使用者",
    Amt: 1000,
    ItemName: "測試商品|測試商品2",
    ItemCount: "1|1",
    ItemUnit: "個|個",
    ItemPrice: "1000|1000",
    ItemAmt: "1000|1000",
  });
  expect(data.Status).toBe("SUCCESS");

  if (!data.Result) return;

  const { InvoiceNumber } = data.Result;
  const allowanceData = await client.issueAllowance({
    InvoiceNo: InvoiceNumber,
    MerchantOrderNo,
    ItemName: "測試商品",
    ItemCount: "1",
    ItemUnit: "個",
    ItemPrice: "1000",
    ItemAmt: "1000",
    ItemTaxAmt: "0",
    TotalAmt: "1000",
  });
  expect(allowanceData.Status).toBe("SUCCESS");

  if (!allowanceData.Result) return;

  const { AllowanceNo } = allowanceData.Result;
  const revokeAllowanceData = await client.revokeAllowance(
    AllowanceNo,
    "測試折讓作廢"
  );
  expect(revokeAllowanceData.Status).toBe("SUCCESS");
});
