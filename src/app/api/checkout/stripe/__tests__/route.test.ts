/**
 * Task 2: Stripe 支付 - 单元测试
 */

// Mock dependencies before importing the module
jest.mock("@/lib/redis", () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}))

jest.mock("@/lib/cache", () => ({
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
}))

jest.mock("@/middleware/rate-limit", () => ({
  rateLimit: jest.fn(() => null),
}))

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
    },
  }))
})

import { isStripeTestMode } from "../route"

describe("Stripe 支付路由", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe("isStripeTestMode", () => {
    it("sk_test_ 前缀应该返回 true", () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_1234567890"
      expect(isStripeTestMode()).toBe(true)
    })

    it("sk_live_ 前缀应该返回 false", () => {
      process.env.STRIPE_SECRET_KEY = "sk_live_1234567890"
      expect(isStripeTestMode()).toBe(false)
    })

    it("空 key 应该返回 false（因为空字符串不以 sk_test_ 开头）", () => {
      delete process.env.STRIPE_SECRET_KEY
      expect(isStripeTestMode()).toBe(false)
    })
  })
})
