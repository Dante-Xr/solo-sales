/**
 * ============================================
 * RAG 知识库 - 分类管理 API
 * ============================================
 * 功能说明：
 *   - GET: 获取分类列表
 *   - POST: 创建新分类
 *   - DELETE: 删除分类
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("获取分类列表失败:", error)
    return NextResponse.json(
      { success: false, error: "获取分类列表失败" },
      { status: 500 }
    )
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

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    )
  } catch (error) {
    console.error("创建分类失败:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "参数验证失败", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "创建分类失败" },
      { status: 500 }
    )
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
      return NextResponse.json(
        { success: false, error: "分类ID不能为空" },
        { status: 400 }
      )
    }

    await prisma.knowledgeCategory.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "删除成功",
    })
  } catch (error) {
    console.error("删除分类失败:", error)

    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "分类不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: "删除分类失败" },
      { status: 500 }
    )
  }
}