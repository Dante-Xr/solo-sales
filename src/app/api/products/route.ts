/**
 * 修改时间：2026-05-02 21:09:54 +08:00
 * 修改内容：统一产品列表 route 响应 helper，移除手写 NextResponse.json 包装。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import {
  createProductFromInput,
  listProducts,
  parseCreateProductInput,
  parseListProductsQuery,
} from "@/server/services/product-service"

export async function GET(request: NextRequest) {
  try {
    // 产品列表保留原查询参数协议，解析和缓存策略统一放在 service 层。
    const query = parseListProductsQuery(request.nextUrl.searchParams)
    const result = await listProducts(query)

    // listProducts 已统一返回 success/data；route 只负责用响应 helper 保留缓存标记。
    return successResponse(result.data, {
      fromCache: "fromCache" in result && result.fromCache === true,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = parseCreateProductInput(await request.json())
    const product = await createProductFromInput(input)

    return createdResponse(product)
  } catch (error) {
    return handleApiError(error)
  }
}
