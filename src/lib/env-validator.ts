/**
 * 2026-03-24: 环境变量验证模块
 * 功能：统一验证必需的环境变量是否存在，防止 Mock 值泄露到生产环境
 * 使用场景：
 *   - Redis 配置验证
 *   - Stripe 配置验证
 *   - 其他第三方服务配置验证
 */

/**
 * 2026-03-24: 验证 Redis 配置
 * 检查 UPSTASH_REDIS_REST_URL 和 UPSTASH_REDIS_REST_TOKEN 是否存在
 * @returns 经验证的 Redis 配置对象
 * @throws 如果环境变量缺失，抛出明确错误
 */
export function validateRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  // 2026-03-24: 检查环境变量是否存在
  if (!url) {
    throw new Error("缺少必需的环境变量 UPSTASH_REDIS_REST_URL，请从 Upstash 控制台获取")
  }

  if (!token) {
    throw new Error("缺少必需的环境变量 UPSTASH_REDIS_REST_TOKEN，请从 Upstash 控制台获取")
  }

  // 2026-03-24: 验证 URL 格式
  if (!url.startsWith("https://")) {
    throw new Error("UPSTASH_REDIS_REST_URL 必须是 HTTPS URL")
  }

  return {
    url,
    token,
  }
}

/**
 * 2026-03-24: 验证 Stripe 配置
 * 检查 STRIPE_SECRET_KEY 是否存在
 * @returns 经验证的 Stripe 配置对象
 * @throws 如果环境变量缺失，抛出明确错误
 */
export function validateStripeConfig() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  // 2026-03-24: 检查环境变量是否存在
  if (!secretKey) {
    throw new Error("缺少必需的环境变量 STRIPE_SECRET_KEY，请从 Stripe 控制台获取")
  }

  // 2026-03-24: 验证 Key 格式 (sk_test_ 或 sk_live_)
  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    throw new Error("STRIPE_SECRET_KEY 格式不正确，应以 sk_test_ 或 sk_live_ 开头")
  }

  // 2026-03-24: 禁止使用 Mock Key
  if (secretKey === "sk_test_mock" || secretKey.includes("mock")) {
    throw new Error("检测到 Mock Stripe Key，请配置真实的 STRIPE_SECRET_KEY")
  }

  return {
    secretKey,
  }
}

/**
 * 2026-03-24: 验证 Better Auth 配置
 * 检查 BETTER_AUTH_SECRET 和 BETTER_AUTH_URL 是否存在
 * @returns 经验证的 Better Auth 配置对象
 * @throws 如果环境变量缺失，抛出明确错误
 */
export function validateBetterAuthConfig() {
  const secret = process.env.BETTER_AUTH_SECRET
  const url = process.env.BETTER_AUTH_URL

  if (!secret) {
    throw new Error("缺少必需的环境变量 BETTER_AUTH_SECRET，请生成一个随机字符串")
  }

  if (
    secret.length < 32 ||
    ["your-secret-key", "change-me", "changeme", "secret"].includes(secret.toLowerCase()) ||
    /mock|placeholder|example/.test(secret.toLowerCase())
  ) {
    throw new Error("BETTER_AUTH_SECRET 不能使用占位或弱密钥，请生成至少 32 位随机字符串")
  }

  if (!url) {
    throw new Error("缺少必需的环境变量 BETTER_AUTH_URL，请设置为你的网站 URL")
  }

  return {
    secret,
    url,
  }
}

/**
 * 2026-03-24: 数据库连接 URL 验证
 * 检查 DATABASE_URL 是否存在
 * @returns 经验证的数据库连接 URL
 * @throws 如果环境变量缺失，抛出明确错误
 */
export function validateDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("缺少必需的环境变量 DATABASE_URL，请配置 PostgreSQL 连接字符串")
  }

  // 2026-03-24: 验证 URL 格式
  if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
    throw new Error("DATABASE_URL 必须是 PostgreSQL 连接字符串 (postgresql:// 或 postgres://)")
  }

  return {
    databaseUrl,
  }
}
