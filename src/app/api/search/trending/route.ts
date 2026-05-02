/**
 * 修改时间：2026-05-02 19:21:48 +08:00
 * 修改内容：统一热门搜索路由响应和错误兜底，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/cache"
import { successResponse } from "@/server/contracts/api"

const DEFAULT_TRENDING = {
  zh: ["#网红爆款", "#限时秒杀", "#抖音同款", "#ins风"],
  en: ["#trending", "#flashsale", "#viral", "#mustbuy"],
}

export async function GET() {
  try {
    const cachedZh = await cacheGet<string[]>(`${CACHE_KEYS.TRENDING_SEARCHES}:zh`)
    const cachedEn = await cacheGet<string[]>(`${CACHE_KEYS.TRENDING_SEARCHES}:en`)

    if (cachedZh && cachedEn) {
      return successResponse({
        zh: cachedZh,
        en: cachedEn,
      }, { fromCache: true })
    }

    // 缓存未命中时写入默认热搜，避免后续请求反复访问初始化路径。
    await cacheSet(`${CACHE_KEYS.TRENDING_SEARCHES}:zh`, DEFAULT_TRENDING.zh, CACHE_TTL.TRENDING_SEARCHES)
    await cacheSet(`${CACHE_KEYS.TRENDING_SEARCHES}:en`, DEFAULT_TRENDING.en, CACHE_TTL.TRENDING_SEARCHES)

    return successResponse({
      zh: DEFAULT_TRENDING.zh,
      en: DEFAULT_TRENDING.en,
    })
  } catch (error) {
    console.error("Error fetching trending searches:", error)
    return successResponse({
      zh: DEFAULT_TRENDING.zh,
      en: DEFAULT_TRENDING.en,
    })
  }
}
