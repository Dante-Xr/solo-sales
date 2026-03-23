import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "https://mock.upstash.io",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "mock-token",
})

export default redis
