/**
 * 修改时间：2026-05-02 18:37:11 +08:00
 * 修改内容：新增库存与批发导入仓储封装，集中导入日志、商品 upsert、SKU 查询和库存预警日志读取。
 * 修改模型：gpt-5.5
 */
import "server-only"

import type { ImportStatus, Prisma, PrismaClient } from "@prisma/client"

export type InventoryDbClient = PrismaClient | Prisma.TransactionClient

export function createImportLogRecord(
  db: InventoryDbClient,
  data: { wholesaler: string; triggeredBy: string }
) {
  return db.importLog.create({
    data: {
      wholesaler: data.wholesaler,
      status: "PENDING",
      triggeredBy: data.triggeredBy,
    },
  })
}

export function markImportLogRunning(db: InventoryDbClient, logId: string) {
  return db.importLog.update({
    where: { id: logId },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  })
}

export function updateImportLogProgress(
  db: InventoryDbClient,
  logId: string,
  data: { totalProducts: number; successCount: number; failCount: number }
) {
  return db.importLog.update({
    where: { id: logId },
    data,
  })
}

export function completeImportLogRecord(
  db: InventoryDbClient,
  logId: string,
  data: {
    status: ImportStatus
    totalProducts: number
    successCount: number
    failCount: number
    errorDetails: string[]
  }
) {
  return db.importLog.update({
    where: { id: logId },
    data: {
      ...data,
      completedAt: new Date(),
    },
  })
}

export function failImportLogRecord(db: InventoryDbClient, logId: string, error: string) {
  return db.importLog.update({
    where: { id: logId },
    data: {
      status: "FAILED",
      errorDetails: [error],
      completedAt: new Date(),
    },
  })
}

export function findImportLogs(
  db: InventoryDbClient,
  args: { skip: number; take: number }
) {
  return db.importLog.findMany({
    orderBy: { startedAt: "desc" },
    skip: args.skip,
    take: args.take,
  })
}

export function countImportLogs(db: InventoryDbClient) {
  return db.importLog.count()
}

export function findProductSkus(db: InventoryDbClient, skus: string[]) {
  return db.product.findMany({
    where: {
      sku: {
        in: skus,
      },
    },
    select: { sku: true },
  })
}

export function upsertImportedProduct(
  db: InventoryDbClient,
  data: {
    id: string
    sku: string
    name: string
    description: string
    price: number
    stock: number
    images: string[]
    isPublished: boolean
  }
) {
  return db.product.upsert({
    where: { sku: data.sku },
    update: {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      images: data.images,
      isPublished: data.isPublished,
    },
    create: data,
  })
}

export function findStockAlertLogs(
  db: InventoryDbClient,
  args: { productId?: string; limit: number }
) {
  return db.stockAlertLog.findMany({
    where: args.productId ? { productId: args.productId } : {},
    orderBy: { createdAt: "desc" },
    take: args.limit,
  })
}
