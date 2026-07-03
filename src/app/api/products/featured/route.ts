/**
 * 修改时间：2026-05-02 21:09:54 +08:00
 * 修改内容：统一 featured 产品查询响应与错误处理，移除手写 NextResponse.json 模板。
 * 修改模型：gpt-5.5
 */
import { handleApiError, successResponse } from "@/server/contracts/api"
import { getFeaturedProducts } from "@/server/services/product-service"

export async function GET() {
  try {
    const result = await getFeaturedProducts()
    // featured 首页数据保留 products/fromCache 形态在 data 内，缓存标记同步到标准响应 meta。
    return successResponse(result, { fromCache: result.fromCache })
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
