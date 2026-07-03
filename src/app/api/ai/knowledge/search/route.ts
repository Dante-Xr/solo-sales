/**
 * ?????2026-05-27
 * ????v0.1.0
 * ??????? 10 - SoloSales ??
 * ?????
 * 1. ??? Python CustomerService ??????????????
 * 2. ??? PUBLISHED ???
 * 3. ????? Bearer token ?????
 */
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { unauthorized, validationError } from "@/server/contracts/errors"

const SearchKnowledgeSchema = z.object({
  tenant_id: z.string().min(1),
  query: z.string().min(1),
  limit: z.number().int().min(1).max(20).default(5),
})

export async function POST(request: NextRequest) {
  try {
    const expectedToken = process.env.AI_CUSTOMER_SERVICE_TOKEN
    const authorization = request.headers.get("authorization")

    if (!expectedToken || authorization !== `Bearer ${expectedToken}`) {
      throw unauthorized("Invalid AI customer service token")
    }

    const body = await request.json()
    const input = SearchKnowledgeSchema.parse(body)

    const rows = await prisma.knowledgeBase.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: input.query, mode: "insensitive" } },
          { content: { contains: input.query, mode: "insensitive" } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: input.limit,
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
      },
    })

    return successResponse(
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        tags: row.tags,
        source: "solosales",
      }))
    )
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return handleApiError(validationError("Invalid AI knowledge search request", error.issues))
    }

    return handleApiError(error)
  }
}