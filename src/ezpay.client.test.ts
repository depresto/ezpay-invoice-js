import EzpayInvoiceClient from "./ezpay.client";

test("issueB2CInvoice", async () => {
  const client = new EzpayInvoiceClient({
    merchantId: "34633793",
    hashKey: "g07Clo64yO9twIuDIQeNnKg62u3kPjFS",
    hashIV: "CBSBm1IlbqLBRtJP",
    env: "sandbox",
  });
  const data = await client.issueInvoice({
    MerchantOrderNo: Math.floor(Date.now() / 1000).toString(),
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
