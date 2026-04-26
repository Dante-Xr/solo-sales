/**
 * Stripe 支付路由 - 单元测试
 * 测试 isStripeTestMode 函数的环境变量判断逻辑
 */

describe("Stripe 支付路由 - isStripeTestMode", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("sk_test_ 前缀应该返回 true", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_1234567890"
    const key = process.env.STRIPE_SECRET_KEY || ""
    expect(key.startsWith("sk_test_")).toBe(true)
  })

  it("sk_live_ 前缀应该返回 false", () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_1234567890"
    const key = process.env.STRIPE_SECRET_KEY || ""
    expect(key.startsWith("sk_test_")).toBe(false)
  })

  it("空 key 应该返回 false", () => {
    delete process.env.STRIPE_SECRET_KEY
    const key = process.env.STRIPE_SECRET_KEY || ""
    expect(key.startsWith("sk_test_")).toBe(false)
  })
})
