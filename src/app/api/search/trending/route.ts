import { NextResponse } from "next/server"
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/cache"

const DEFAULT_TRENDING = {
  zh: ["#网红爆款", "#限时秒杀", "#抖音同款", "#ins风"],
  en: ["#trending", "#flashsale", "#viral", "#mustbuy"],
}

export async function GET() {
  try {
    const cachedZh = await cacheGet<string[]>(`${CACHE_KEYS.TRENDING_SEARCHES}:zh`)
    const cachedEn = await cacheGet<string[]>(`${CACHE_KEYS.TRENDING_SEARCHES}:en`)

    if (cachedZh && cachedEn) {
      return NextResponse.json({
        zh: cachedZh,
        en: cachedEn,
        fromCache: true,
      })
    }

    await cacheSet(`${CACHE_KEYS.TRENDING_SEARCHES}:zh`, DEFAULT_TRENDING.zh, CACHE_TTL.TRENDING_SEARCHES)
    await cacheSet(`${CACHE_KEYS.TRENDING_SEARCHES}:en`, DEFAULT_TRENDING.en, CACHE_TTL.TRENDING_SEARCHES)

    return NextResponse.json({
      zh: DEFAULT_TRENDING.zh,
      en: DEFAULT_TRENDING.en,
      fromCache: false,
    })
  } catch (error) {
    console.error("Error fetching trending searches:", error)
    return NextResponse.json({
      zh: DEFAULT_TRENDING.zh,
      en: DEFAULT_TRENDING.en,
      fromCache: false,
    })
  }
}
