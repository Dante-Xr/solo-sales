/**
 * ============================================
 * RAG 知识库 - 列表和创建 API (Task 1.2)
 * ============================================
 * 功能说明：
 *   - GET: 获取知识库列表，支持分页、分类筛选、关键词搜索
 *   - POST: 创建新的知识条目
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"

// Prisma 客户端实例
const prisma = new PrismaClient()

/**
 * 创建知识条目的请求体验证 Schema
 * 用于验证 POST 请求的参数
 */
const CreateKnowledgeSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200, "标题不能超过200字符"),
  content: z.string().min(1, "内容不能为空"),
  category: z.string().min(1, "分类不能为空"),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  createdBy: z.string().min(1, "创建者不能为空"),
})

/**
 * 获取知识列表的查询参数 Schema
 */
const GetKnowledgeSchema = z.object({
  page: z.coerce.number().min(1).default(1),        // 页码，默认第1页
  pageSize: z.coerce.number().min(1).max(100).default(20), // 每页数量，默认20条
  category: z.string().optional(),                   // 分类筛选
  keyword: z.string().optional(),                    // 关键词搜索（搜索标题和内容）
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(), // 状态筛选
})

/**
 * GET handler - 获取知识库列表
 * 支持分页、分类筛选、关键词搜索
 */
export async function GET(request: NextRequest) {
  try {
    // 解析查询参数
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const queryParams = GetKnowledgeSchema.parse(searchParams)
    const { page, pageSize, category, keyword, status } = queryParams

    // 构建 where 条件
    const where: Record<string, unknown> = {}

    // 分类筛选
    if (category) {
      where.category = category
    }

    // 状态筛选
    if (status) {
      where.status = status
    }

    // 关键词搜索（搜索标题和内容）
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { content: { contains: keyword, mode: "insensitive" } },
      ]
    }

    // 查询知识列表和总数
    const [knowledgeList, total] = await Promise.all([
      // 查询知识列表
      prisma.knowledgeBase.findMany({
        where,
        orderBy: { updatedAt: "desc" }, // 按更新时间倒序
        skip: (page - 1) * pageSize,    // 分页偏移
        take: pageSize,                  // 每页数量
        include: {
          // 关联查询分类信息
          categoryRelation: {
            select: { id: true, name: true },
          },
        },
      }),
      // 查询总数
      prisma.knowledgeBase.count({ where }),
    ])

    // 返回分页结果
    return NextResponse.json({
      success: true,
      data: {
        list: knowledgeList,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    })
  } catch (error) {
    // 错误处理
    console.error("获取知识库列表失败:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "参数验证失败", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "获取知识库列表失败" },
      { status: 500 }
    )
  }
}

/**
 * POST handler - 创建新的知识条目
 * 自动创建第一条历史版本记录
 */
export async function POST(request: NextRequest) {
  try {
    // 解析并验证请求体
    const body = await request.json()
    const validatedData = CreateKnowledgeSchema.parse(body)

    // 创建知识条目和初始历史版本（事务保证一致性）
    const result = await prisma.$transaction(async (tx) => {
      // 创建知识条目
      const knowledge = await tx.knowledgeBase.create({
        data: {
          title: validatedData.title,
          content: validatedData.content,
          category: validatedData.category,
          tags: validatedData.tags,
          status: validatedData.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
          createdBy: validatedData.createdBy,
          version: 1,
        },
      })

      // 创建初始历史版本记录
      await tx.knowledgeHistory.create({
        data: {
          knowledgeId: knowledge.id,
          version: 1,
          title: knowledge.title,
          content: knowledge.content,
          changedBy: validatedData.createdBy,
        },
      })

      return knowledge
    })

    // 返回创建结果
    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    )
  } catch (error) {
    // 错误处理
    console.error("创建知识条目失败:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "参数验证失败", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "创建知识条目失败" },
      { status: 500 }
    )
  }
}