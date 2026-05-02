/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：新增商品与分类仓储封装，集中 Prisma 查询、更新和删除操作。
 * 修改模型：gpt-5.5
 */
import "server-only"

import type { Prisma, PrismaClient } from "@prisma/client"

export type ProductDbClient = PrismaClient | Prisma.TransactionClient

export const productListInclude = {
  category: {
    select: { id: true, name: true },
  },
  _count: {
    select: { orderItems: true },
  },
} satisfies Prisma.ProductInclude

export const categoryWithCountInclude = {
  _count: {
    select: { products: true },
  },
} satisfies Prisma.CategoryInclude

export function findProducts(
  db: ProductDbClient,
  args: {
    where: Prisma.ProductWhereInput
    skip?: number
    take?: number
  }
) {
  // 商品列表统一带分类摘要和订单数量，满足后台表格与前台排序展示需求。
  return db.product.findMany({
    where: args.where,
    include: productListInclude,
    orderBy: { createdAt: "desc" },
    skip: args.skip,
    take: args.take,
  })
}

export function countProducts(db: ProductDbClient, where: Prisma.ProductWhereInput) {
  return db.product.count({ where })
}

export function findProductById(db: ProductDbClient, id: string) {
  return db.product.findUnique({
    where: { id },
    include: productListInclude,
  })
}

export function findProductBySku(db: ProductDbClient, sku: string) {
  return db.product.findUnique({
    where: { sku },
  })
}

export function createProduct(db: ProductDbClient, data: Prisma.ProductCreateInput) {
  return db.product.create({
    data,
    include: {
      category: {
        select: { id: true, name: true },
      },
    },
  })
}

export function updateProduct(
  db: ProductDbClient,
  id: string,
  data: Prisma.ProductUpdateInput
) {
  return db.product.update({
    where: { id },
    data,
    include: {
      category: {
        select: { id: true, name: true },
      },
    },
  })
}

export function deleteProduct(db: ProductDbClient, id: string) {
  return db.product.delete({ where: { id } })
}

export function updateProductsPublished(db: ProductDbClient, ids: string[], isPublished: boolean) {
  return db.product.updateMany({
    where: { id: { in: ids } },
    data: { isPublished },
  })
}

export function deleteProducts(db: ProductDbClient, ids: string[]) {
  return db.product.deleteMany({
    where: { id: { in: ids } },
  })
}

export function findCategories(db: ProductDbClient) {
  // 分类列表带商品数量，供后台判断分类是否可删除和展示统计。
  return db.category.findMany({
    include: categoryWithCountInclude,
    orderBy: { createdAt: "asc" },
  })
}

export function findCategoryById(db: ProductDbClient, id: string) {
  return db.category.findUnique({
    where: { id },
    include: categoryWithCountInclude,
  })
}

export function findCategoryByName(db: ProductDbClient, name: string, excludeId?: string) {
  return db.category.findFirst({
    where: {
      name,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  })
}

export function createCategory(
  db: ProductDbClient,
  data: Prisma.CategoryCreateInput
) {
  return db.category.create({
    data,
    include: categoryWithCountInclude,
  })
}

export function updateCategory(
  db: ProductDbClient,
  id: string,
  data: Prisma.CategoryUpdateInput
) {
  return db.category.update({
    where: { id },
    data,
    include: categoryWithCountInclude,
  })
}

export function deleteCategory(db: ProductDbClient, id: string) {
  return db.category.delete({ where: { id } })
}
