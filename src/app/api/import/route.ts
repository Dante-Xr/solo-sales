/**
 * ============================================
 * 批发商品批量导入 API (Task 1.10)
 * ============================================
 * 功能说明：
 *   - POST: 触发批发商品批量导入
 *   - 支持商品去重检测、数据库写入
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import { I1866Client } from "@/lib/wholesalers/1866/client"
import { mapProducts, detectDuplicates } from "@/lib/wholesalers/1866/mapper"
import {
  createImportLog,
  startImportLog,
  updateImportProgress,
  completeImportLog,
  failImportLog,
  logToConsole,
} from "@/lib/wholesalers/logger"
import type { ImportResult } from "@/lib/wholesalers/types"

const prisma = new PrismaClient()

/**
 * 导入请求参数验证 Schema
 */
const ImportRequestSchema = z.object({
  wholesaler: z.enum(["1866"]).default("1866"),
  options: z
    .object({
      pageSize: z.number().min(1).max(100).default(50),
      skipDuplicates: z.boolean().default(true),
    })
    .optional(),
})

/**
 * POST handler - 触发批量导入
 */
export async function POST(request: NextRequest) {
  let logId: string | null = null

  try {
    const body = await request.json()
    const { wholesaler, options } = ImportRequestSchema.parse(body)

    logToConsole("info", "开始导入任务，批发商: " + wholesaler)

    logId = await createImportLog(wholesaler, "admin")
    logToConsole("info", "创建导入日志，ID: " + logId)

    await startImportLog(logId)

    let client: I1866Client | null = null

    if (wholesaler === "1866") {
      const apiKey = process.env.WHOLESALER_1866_API_KEY
      if (!apiKey) {
        throw new Error("1866 API Key 未配置，请设置 WHOLESALER_1866_API_KEY 环境变量")
      }

      client = new I1866Client({
        name: "1866",
        baseUrl: process.env.WHOLESALER_1866_BASE_URL || "https://api.1866.com/v1",
        apiKey,
        timeout: 30000,
        retryTimes: 3,
      })
    }

    if (!client) {
      throw new Error("不支持的批发商: " + wholesaler)
    }

    logToConsole("info", "测试 API 连接...")
    const connected = await client.testConnection()
    if (!connected) {
      throw new Error("API 连接失败，请检查网络和 API 配置")
    }

    logToConsole("info", "获取商品列表...")
    const products = await client.getProducts({
      pageSize: options?.pageSize || 50,
    })

    logToConsole("info", "获取到 " + products.length + " 个商品")

    await updateImportProgress(logId, products.length, 0, 0)

    logToConsole("info", "映射商品数据...")
    const mappingResult = mapProducts(products)

    logToConsole("info", "映射完成，成功: " + mappingResult.success.length + "，失败: " + mappingResult.failed.length)

    logToConsole("info", "检查重复商品...")
    const existingProducts = await prisma.product.findMany({
      where: {
        sku: {
          in: mappingResult.success.map((p) => p.sku),
        },
      },
      select: { sku: true },
    })

    const existingSkus = new Set(existingProducts.map((p) => p.sku).filter((sku): sku is string => sku !== null))

    const { new: newProducts, duplicate } = detectDuplicates(
      mappingResult.success,
      existingSkus
    )

    logToConsole("info", "重复检测完成，新增: " + newProducts.length + "，重复: " + duplicate.length)

    const productsToImport = options?.skipDuplicates !== false ? newProducts : mappingResult.success

    logToConsole("info", "开始导入 " + productsToImport.length + " 个商品...")
    const importResult = await importProducts(productsToImport, logId)

    await completeImportLog(logId, importResult)

    logToConsole("info", "导入完成")
    logToConsole("info", "成功: " + importResult.successCount + "，失败: " + importResult.failCount)

    let successMessage = "Import completed. Success: " + importResult.successCount + ", Failed: " + importResult.failCount
    if (duplicate.length > 0) {
      successMessage += ", Skipped duplicates: " + duplicate.length
    }

    return NextResponse.json({
      success: true,
      data: {
        logId,
        ...importResult,
        skipped: duplicate.length,
      },
      message: successMessage,
    })
  } catch (error) {
    console.error("导入失败:", error)

    if (logId) {
      await failImportLog(
        logId,
        error instanceof Error ? error.message : "导入失败"
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "导入失败",
      },
      { status: 500 }
    )
  }
}

/**
 * 批量导入商品到数据库
 */
async function importProducts(
  products: Array<{
    externalId: string
    sku: string
    name: string
    description: string
    price: number
    originalPrice: number
    stock: number
    images: string
    category: string
    tags: string
    isPublished: boolean
    wholesaler: string
  }>,
  logId: string
): Promise<ImportResult> {
  let successCount = 0
  let failCount = 0
  const errors: string[] = []

  const batchSize = 20
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)

    try {
      await Promise.all(
        batch.map((product) => {
          const productId = "prod_" + product.externalId
          return prisma.product.upsert({
            where: { sku: product.sku },
            update: {
              name: product.name,
              description: product.description,
              price: product.price,
              stock: product.stock,
              images: product.images as unknown as string[],
              isPublished: product.isPublished,
            },
            create: {
              id: productId,
              sku: product.sku,
              name: product.name,
              description: product.description,
              price: product.price,
              stock: product.stock,
              images: product.images as unknown as string[],
              isPublished: product.isPublished,
            },
          })
        })
      )

      successCount += batch.length
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      const batchNumber = Math.ceil(i / batchSize)
      errors.push("Batch " + batchNumber + ": " + errorMsg)
      failCount += batch.length
    }

    await updateImportProgress(logId, products.length, successCount, failCount)
  }

  return {
    success: failCount === 0,
    total: products.length,
    successCount,
    failCount,
    errors,
  }
}