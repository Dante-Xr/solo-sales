import {
  normalizePublicBaseUrl,
  validateBetterAuthConfig,
  validateDatabaseConfig,
  validateRedisConfig,
  validateStripeConfig,
} from "../env-validator"

const originalEnv = process.env

describe("env-validator production gates", () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it("rejects missing production secrets for database, Better Auth, Redis, and Stripe", () => {
    delete process.env.DATABASE_URL
    delete process.env.BETTER_AUTH_SECRET
    delete process.env.BETTER_AUTH_URL
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    delete process.env.STRIPE_SECRET_KEY

    expect(() => validateDatabaseConfig()).toThrow(/DATABASE_URL/)
    expect(() => validateBetterAuthConfig()).toThrow(/BETTER_AUTH_SECRET/)
    expect(() => validateRedisConfig()).toThrow(/UPSTASH_REDIS_REST_URL/)
    expect(() => validateStripeConfig()).toThrow(/STRIPE_SECRET_KEY/)
  })

  it("rejects mock or placeholder production secrets", () => {
    process.env.BETTER_AUTH_SECRET = "your-secret-key"
    process.env.BETTER_AUTH_URL = "https://example.com"
    process.env.STRIPE_SECRET_KEY = "sk_test_mock"

    expect(() => validateBetterAuthConfig()).toThrow(/占位|placeholder|随机/)
    expect(() => validateStripeConfig()).toThrow(/Mock Stripe Key/)
  })

  it("accepts well-formed production configuration values", () => {
    process.env.DATABASE_URL = "postgresql://user:password@example.com:5432/solo_sales"
    process.env.BETTER_AUTH_SECRET = "S".repeat(32)
    process.env.BETTER_AUTH_URL = "https://example.com"
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io"
    process.env.UPSTASH_REDIS_REST_TOKEN = "upstash-token-value"
    process.env.STRIPE_SECRET_KEY = "sk_live_12345678901234567890"

    expect(validateDatabaseConfig()).toEqual({ databaseUrl: process.env.DATABASE_URL })
    expect(validateBetterAuthConfig()).toEqual({
      secret: process.env.BETTER_AUTH_SECRET,
      url: process.env.BETTER_AUTH_URL,
    })
    expect(validateRedisConfig()).toEqual({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    expect(validateStripeConfig()).toEqual({ secretKey: process.env.STRIPE_SECRET_KEY })
  })

  it("normalizes bare Netlify domains to HTTPS base URLs", () => {
    expect(normalizePublicBaseUrl("solo-sales-xxx.netlify.app")).toBe(
      "https://solo-sales-xxx.netlify.app"
    )
  })

  it("rejects malformed public base URLs", () => {
    expect(() => normalizePublicBaseUrl("not a valid url")).toThrow(/有效 URL|valid URL/)
  })
})
