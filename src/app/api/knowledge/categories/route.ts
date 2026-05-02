/**
 * 修改时间：2026-05-02 20:35:22 +08:00
 * 修改内容：统一知识库分类路由响应与错误处理，改用共享 Prisma 实例。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * RAG 知识库 - 分类管理 API
 * ============================================
 * 功能说明：
 *   - GET: 获取分类列表
 *   - POST: 创建新分类
 *   - DELETE: 删除分类
 * ============================================
 */

import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest, notFound, validationError } from "@/server/contracts/errors"

/** 创建分类的请求体验证 Schema */
const CreateCategorySchema = z.object({
  name: z.string().min(1, "分类名称不能为空").max(50, "分类名称不能超过50字符"),
  parentId: z.string().optional(),
  order: z.number().int().min(0).default(0),
})

/**
 * GET handler - 获取分类列表
 */
export async function GET() {
  try {
    const categories = await prisma.knowledgeCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { articles: true },
        },
      },
    })

    return successResponse(categories)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST handler - 创建新分类
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateCategorySchema.parse(body)

    const category = await prisma.knowledgeCategory.create({
      data: {
        name: validatedData.name,
        parentId: validatedData.parentId,
        order: validatedData.order,
      },
    })

    return createdResponse(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleApiError(validationError("参数验证失败", error.issues))
    }

    return handleApiError(error)
  }
}

/**
 * DELETE handler - 删除分类
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      throw badRequest("分类ID不能为空")
    }

    // 分类删除依赖数据库外键约束保护已关联文章的分类。
    await prisma.knowledgeCategory.delete({
      where: { id },
    })

    return successResponse({ deleted: true }, { meta: { message: "删除成功" } })
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return handleApiError(notFound("分类"))
    }

    return handleApiError(error)
  }
}
