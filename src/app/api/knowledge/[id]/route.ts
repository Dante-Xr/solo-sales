/**
 * ============================================
 * RAG 知识库 - 单条知识操作 API (Task 1.3)
 * ============================================
 * 功能说明：
 *   - GET: 获取单条知识详情
 *   - PATCH: 更新知识内容（自动增加版本号）
 *   - DELETE: 删除知识条目
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"

// Prisma 客户端实例
const prisma = new PrismaClient()

/**
 * 更新知识条目的请求体验证 Schema
 */
const UpdateKnowledgeSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  changedBy: z.string().min(1, "修改者不能为空"),
})

/**
 * 获取知识详情的路由参数 Schema
 */
const ParamsSchema = z.object({
  id: z.string().min(1, "知识ID不能为空"),
})

/**
 * GET handler - 获取单条知识详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 解析路由参数
    const { id } = ParamsSchema.parse(await params)

    // 查询知识详情
    const knowledge = await prisma.knowledgeBase.findUnique({
      where: { id },
      include: {
        // 关联查询分类信息
        categoryRelation: {
          select: { id: true, name: true },
        },
        // 关联查询历史版本（最近5条）
        history: {
          orderBy: { version: "desc" },
          take: 5,
          select: {
            version: true,
            changedAt: true,
            changedBy: true,
          },
        },
      },
    })

    // 如果知识不存在，返回404
    if (!knowledge) {
      return NextResponse.json(
        { success: false, error: "知识条目不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: knowledge,
    })
  } catch (error) {
    console.error("获取知识详情失败:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "参数验证失败", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "获取知识详情失败" },
      { status: 500 }
    )
  }
}

/**
 * PATCH handler - 更新知识内容
 * 自动增加版本号并记录历史
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 解析路由参数
    const { id } = ParamsSchema.parse(await params)

    // 解析并验证请求体
    const body = await request.json()
    const validatedData = UpdateKnowledgeSchema.parse(body)

    // 获取当前知识条目
    const currentKnowledge = await prisma.knowledgeBase.findUnique({
      where: { id },
    })

    // 如果知识不存在，返回404
    if (!currentKnowledge) {
      return NextResponse.json(
        { success: false, error: "知识条目不存在" },
        { status: 404 }
      )
    }

    // 计算新版本号
    const newVersion = currentKnowledge.version + 1

    // 更新知识条目并创建历史版本（事务保证一致性）
    const result = await prisma.$transaction(async (tx) => {
      // 更新知识条目
      const updated = await tx.knowledgeBase.update({
        where: { id },
        data: {
          title: validatedData.title,
          content: validatedData.content,
          category: validatedData.category,
          tags: validatedData.tags,
          status: validatedData.status,
          version: newVersion,
        },
      })

      // 记录历史版本
      await tx.knowledgeHistory.create({
        data: {
          knowledgeId: id,
          version: newVersion,
          title: validatedData.title ?? currentKnowledge.title,
          content: validatedData.content ?? currentKnowledge.content,
          changedBy: validatedData.changedBy,
        },
      })

      return updated
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: `更新成功，当前版本：v${newVersion}`,
    })
  } catch (error) {
    console.error("更新知识失败:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "参数验证失败", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "更新知识失败" },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler - 删除知识条目
 * 同时删除关联的历史版本记录
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 解析路由参数
    const { id } = ParamsSchema.parse(await params)

    // 删除知识条目及其历史版本（事务保证一致性）
    await prisma.$transaction(async (tx) => {
      // 先删除关联的历史版本
      await tx.knowledgeHistory.deleteMany({
        where: { knowledgeId: id },
      })

      // 再删除知识条目
      await tx.knowledgeBase.delete({
        where: { id },
      })
    })

    return NextResponse.json({
      success: true,
      message: "删除成功",
    })
  } catch (error) {
    console.error("删除知识失败:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "参数验证失败", details: error.issues },
        { status: 400 }
      )
    }

    // 处理 Prisma 记录不存在的错误
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "知识条目不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: "删除知识失败" },
      { status: 500 }
    )
  }
}