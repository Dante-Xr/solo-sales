/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：新增订单仓储查询封装，复用订单详情、订单列表和下单商品查询。
 * 修改模型：gpt-5.5
 */
import "server-only"

import type { Prisma, PrismaClient } from "@prisma/client"

export type PrismaTransactionClient = Prisma.TransactionClient
export type OrderDbClient = PrismaClient | PrismaTransactionClient

export function findOrderById(db: OrderDbClient, id: string) {
  // 订单详情统一带出商品和用户摘要，供前台详情页与权限判断复用。
  return db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  })
}

export function findOrdersByUserId(db: OrderDbClient, userId: string) {
  return db.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export function findProductsForOrder(db: OrderDbClient, productIds: string[]) {
  // 下单只允许使用已发布商品，价格和库存必须来自数据库而不是客户端。
  return db.product.findMany({
    where: {
      id: { in: productIds },
      isPublished: true,
    },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
    },
  })
}
