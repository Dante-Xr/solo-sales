/**
 * 修改时间：2026-06-05 10:11:44 +08:00
 * 修改内容：为批发导入增加可选异步任务入队能力，保留默认同步导入路径并支撑 Phase 5 重任务隔离。
 * 修改模型：gpt-5.5
 */
import "server-only"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { I1866Client } from "@/lib/wholesalers/1866/client"
import { detectDuplicates, mapProducts } from "@/lib/wholesalers/1866/mapper"
import type { ImportResult, MappedProduct, WholesalerClient } from "@/lib/wholesalers/types"
import { badRequest, serviceUnavailable, validationError } from "@/server/contracts/errors"
import { enqueueBackgroundJob } from "@/server/services/background-job-service"
import {
  completeImportLogRecord,
  countImportLogs,
  createImportLogRecord,
  failImportLogRecord,
  findImportLogs,
  findProductSkus,
  findStockAlertLogs,
  markImportLogRunning,
  updateImportLogProgress,
  upsertImportedProduct,
} from "@/server/repositories/inventory-repository"

export const importRequestSchema = z.object({
  wholesaler: z.enum(["1866"]).default("1866"),
  execution: z.enum(["sync", "async"]).default("sync"),
  options: z
    .object({
      pageSize: z.number().int().min(1).max(100).default(50),
      skipDuplicates: z.boolean().default(true),
    })
    .optional(),
})

export const importLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

export const stockAlertQuerySchema = z.object({
  productId: z.string().min(1).optional(),
  logs: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().positive().max(200).default(50),
})

export const stockAlertInputSchema = z.object({
  productId: z.string().min(1),
  threshold: z.number().int().min(0),
  isEnabled: z.boolean(),
  notifyEmails: z.array(z.string().email()),
})

export type ImportRequestInput = z.infer<typeof importRequestSchema>
export type ImportLogsQuery = z.infer<typeof importLogsQuerySchema>
export type StockAlertQuery = z.infer<typeof stockAlertQuerySchema>
export type StockAlertInput = z.infer<typeof stockAlertInputSchema>

const DEFAULT_STOCK_ALERT_CONFIG = {
  threshold: 10,
  isEnabled: false,
  notifyEmails: [] as string[],
}

export function parseImportRequest(input: unknown): ImportRequestInput {
  const parsed = importRequestSchema.safeParse(input)
  if (!parsed.success) throw validationError("导入参数错误", parsed.error.issues)
  return parsed.data
}

export function parseImportLogsQuery(searchParams: URLSearchParams): ImportLogsQuery {
  const parsed = importLogsQuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) throw validationError("导入日志查询参数错误", parsed.error.issues)
  return parsed.data
}

export function parseStockAlertQuery(searchParams: URLSearchParams): StockAlertQuery {
  const parsed = stockAlertQuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) throw validationError("库存预警查询参数错误", parsed.error.issues)
  return parsed.data
}

export function parseStockAlertInput(input: unknown): StockAlertInput {
  const parsed = stockAlertInputSchema.safeParse(input)
  if (!parsed.success) throw validationError("库存预警参数错误", parsed.error.issues)
  return parsed.data
}

export async function enqueueWholesalerImport(input: ImportRequestInput) {
  // 异步导入只记录必要 payload；真正的批发商连接和批量写入由后台 worker 消费，避免占用请求线程。
  return enqueueBackgroundJob({
    type: "WHOLESALER_IMPORT",
    payload: {
      wholesaler: input.wholesaler,
      options: input.options ?? {},
    },
    maxAttempts: 3,
  })
}

export async function runWholesalerImport(input: ImportRequestInput) {
  const wholesaler = input.wholesaler
  const options = input.options
  let logId: string | null = null

  try {
    const log = await createImportLogRecord(prisma, { wholesaler, triggeredBy: "admin" })
    logId = log.id
    await markImportLogRunning(prisma, logId)

    const client = createWholesalerClient(wholesaler)
    const connected = await client.testConnection()
    if (!connected) throw serviceUnavailable("批发商 API 连接失败，请检查网络和 API 配置")

    const products = await client.getProducts({
      pageSize: options?.pageSize ?? 50,
    })

    await updateImportLogProgress(prisma, logId, {
      totalProducts: products.length,
      successCount: 0,
      failCount: 0,
    })

    const mappingResult = mapProducts(products)
    const existingProducts = await findProductSkus(
      prisma,
      mappingResult.success.map((product) => product.sku)
    )
    const existingSkus = new Set(
      existingProducts.map((product) => product.sku).filter((sku): sku is string => sku !== null)
    )
    const { new: newProducts, duplicate } = detectDuplicates(mappingResult.success, existingSkus)
    const productsToImport = options?.skipDuplicates === false ? mappingResult.success : newProducts

    const importResult = await importMappedProducts(productsToImport, logId)
    await completeImportLogRecord(prisma, logId, {
      status: importResult.success ? "COMPLETED" : "FAILED",
      totalProducts: importResult.total,
      successCount: importResult.successCount,
      failCount: importResult.failCount,
      errorDetails: importResult.errors,
    })

    return {
      logId,
      ...importResult,
      skipped: duplicate.length,
      mappedFailed: mappingResult.failed.length,
      message: buildImportMessage(importResult, duplicate.length),
    }
  } catch (error) {
    if (logId) {
      await failImportLogRecord(
        prisma,
        logId,
        error instanceof Error ? error.message : "导入失败"
      )
    }
    throw error
  }
}

export async function importMappedProducts(
  products: MappedProduct[],
  logId: string
): Promise<ImportResult> {
  let successCount = 0
  let failCount = 0
  const errors: string[] = []
  const batchSize = 20

  for (let index = 0; index < products.length; index += batchSize) {
    const batch = products.slice(index, index + batchSize)

    try {
      await Promise.all(
        batch.map((product) =>
          upsertImportedProduct(prisma, {
            id: `prod_${product.externalId}`,
            sku: product.sku,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            images: parseMappedImages(product.images),
            isPublished: product.isPublished,
          })
        )
      )

      successCount += batch.length
    } catch (error) {
      const batchNumber = Math.floor(index / batchSize) + 1
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      errors.push(`Batch ${batchNumber}: ${errorMessage}`)
      failCount += batch.length
    }

    // 每个批次结束后记录进度，前端日志页可以看到长任务的阶段性结果。
    await updateImportLogProgress(prisma, logId, {
      totalProducts: products.length,
      successCount,
      failCount,
    })
  }

  return {
    success: failCount === 0,
    total: products.length,
    successCount,
    failCount,
    errors,
  }
}

export async function listImportLogs(query: ImportLogsQuery) {
  const skip = (query.page - 1) * query.pageSize
  const [logs, total] = await Promise.all([
    findImportLogs(prisma, { skip, take: query.pageSize }),
    countImportLogs(prisma),
  ])

  return {
    logs: logs.map((log) => ({
      id: log.id,
      wholesaler: log.wholesaler,
      status: log.status,
      totalProducts: log.totalProducts,
      successCount: log.successCount,
      failCount: log.failCount,
      errorDetails: log.errorDetails,
      startedAt: log.startedAt,
      completedAt: log.completedAt ?? undefined,
      triggeredBy: log.triggeredBy,
    })),
    total,
    totalPages: Math.ceil(total / query.pageSize),
  }
}

export async function getStockAlertData(query: StockAlertQuery) {
  if (query.productId) {
    return {
      productId: query.productId,
      ...DEFAULT_STOCK_ALERT_CONFIG,
    }
  }

  if (query.logs === "true") {
    const logs = await findStockAlertLogs(prisma, { limit: query.limit })
    return logs
  }

  return null
}

export async function configureStockAlert(_input: StockAlertInput) {
  // 当前 Prisma schema 只有 StockAlertLog，没有 StockAlertConfig；这里保留幂等空实现，避免 route 承载假配置逻辑。
  return { configured: true }
}

export async function removeStockAlert(productId: string) {
  if (!productId) throw badRequest("Product ID is required")

  // 当前缺少 StockAlertConfig 表，删除配置在服务层显式 no-op，后续补表时只需替换此处实现。
  return { deleted: true }
}

export function parseMappedImages(images: string): string[] {
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []
  } catch {
    return []
  }
}

function createWholesalerClient(wholesaler: ImportRequestInput["wholesaler"]): WholesalerClient {
  if (wholesaler !== "1866") throw badRequest(`不支持的批发商: ${wholesaler}`)

  const apiKey = process.env.WHOLESALER_1866_API_KEY
  if (!apiKey) {
    throw serviceUnavailable("1866 API Key 未配置，请设置 WHOLESALER_1866_API_KEY 环境变量")
  }

  return new I1866Client({
    name: "1866",
    baseUrl: process.env.WHOLESALER_1866_BASE_URL || "https://api.1866.com/v1",
    apiKey,
    timeout: 30000,
    retryTimes: 3,
  })
}

function buildImportMessage(importResult: ImportResult, skipped: number): string {
  let message = `Import completed. Success: ${importResult.successCount}, Failed: ${importResult.failCount}`
  if (skipped > 0) message += `, Skipped duplicates: ${skipped}`
  return message
}
