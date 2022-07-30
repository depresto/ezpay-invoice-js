import EzpayInvoiceClient from "./ezpay.client";

const randomStr = () => (Math.random() + 1).toString(36).substring(7);

test("issueB2CInvoice", async () => {
  const orderId = randomStr();

  const client = new EzpayInvoiceClient({
    merchantId: "34633793",
    hashKey: "g07Clo64yO9twIuDIQeNnKg62u3kPjFS",
    hashIV: "CBSBm1IlbqLBRtJP",
    env: "sandbox",
  });
  const data = await client.issueInvoice({
    MerchantOrderNo: orderId,
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
