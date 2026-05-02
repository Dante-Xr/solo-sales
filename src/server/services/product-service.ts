/**
 * 修改时间：2026-05-02 22:10:24 +08:00
 * 修改内容：加厚商品只读查询的 Prisma 断连重试和查询超时保护，并统一首页与商品页可复用的 storefront 商品读取入口。
 * 修改模型：gpt-5.5
 */
import "server-only"

import { Prisma } from "@prisma/client"
import { z } from "zod"
import { cacheDelPattern, cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import {
  badRequest,
  conflict,
  notFound,
  serviceUnavailable,
  validationError,
} from "@/server/contracts/errors"
import {
  countProducts,
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  deleteProducts,
  findCategories,
  findCategoryById,
  findCategoryByName,
  findProductById,
  findProductBySku,
  findProducts,
  updateCategory,
  updateProduct,
  updateProductsPublished,
} from "@/server/repositories/product-repository"

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  keyword: z.string().optional(),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  isPublished: z.string().optional(),
  exclude: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
})

export const createProductSchema = z.object({
  name: z.string().min(1, "产品名称不能为空"),
  description: z.string().min(1, "产品描述不能为空"),
  price: z.number().positive("价格必须为正数"),
  stock: z.number().int().nonnegative("库存不能为负数").default(0),
  images: z.array(z.string()).default([]),
  categoryId: z.string().optional(),
  isPublished: z.boolean().default(true),
  sku: z.string().optional(),
})

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
  sku: z.string().nullable().optional(),
})

export const batchUpdateProductsSchema = z.object({
  ids: z.array(z.string()).min(1, "至少选择一个产品"),
  isPublished: z.boolean(),
})

export const createCategorySchema = z.object({
  name: z.string().min(1, "分类名称不能为空"),
  description: z.string().optional(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
})

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type BatchUpdateProductsInput = z.infer<typeof batchUpdateProductsSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type StorefrontProductFilter = "new" | "best" | "sale" | string | undefined
export type StorefrontProductItem = {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number
  image: string
  sales: number
  stock: number
}

const PRISMA_READ_TIMEOUT_MS = 3000

function parseWithSchema<T>(schema: z.ZodSchema<T>, data: unknown, message = "参数错误"): T {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw validationError(message, parsed.error.issues)
  }
  return parsed.data
}

function isTransientPrismaConnectionError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false
  const code = "code" in error ? (error as { code?: unknown }).code : undefined
  const message = "message" in error ? (error as { message?: unknown }).message : undefined
  // P1017 是当前 smoke 里出现的“连接已关闭”；P1001/P1002 是常见短暂连接不可达/超时。
  return (
    code === "P1017" ||
    code === "P1001" ||
    code === "P1002" ||
    (typeof message === "string" &&
      (message.includes("Can't reach database server") ||
        message.includes("Server has closed the connection") ||
        message.includes("Timed out fetching a new connection")))
  )
}

function withPrismaReadTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined

  // 外部数据库不可达时 Prisma 初始化可能长时间阻塞；只读路径用短超时快速降级为 503/页面兜底。
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => {
      reject(serviceUnavailable(`${label} 查询超时，请稍后重试`))
    }, PRISMA_READ_TIMEOUT_MS)
  })

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) clearTimeout(timeout)
  })
}

async function withTransientPrismaRetry<T>(
  label: string,
  operation: () => Promise<T>
): Promise<T> {
  const maxAttempts = 3
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await withPrismaReadTimeout(operation(), label)
    } catch (error) {
      lastError = error
      if (!isTransientPrismaConnectionError(error) || attempt === maxAttempts) {
        throw isTransientPrismaConnectionError(error)
          ? serviceUnavailable("数据库连接暂时不可用，请稍后重试")
          : error
      }

      // 只读查询允许多次轻量重试；每次先断开旧连接，强制下一轮使用新连接池，降低本地数据库短暂抖动导致的 500。
      console.warn(
        `[product-service] retrying transient Prisma read failure: ${label} (${attempt}/${maxAttempts})`,
        error
      )
      await prisma.$disconnect().catch((disconnectError) => {
        console.warn("[product-service] failed to disconnect stale Prisma client", disconnectError)
      })
      await new Promise((resolve) => setTimeout(resolve, attempt * 100))
    }
  }

  throw lastError
}

export function parseListProductsQuery(params: URLSearchParams): ListProductsQuery {
  return parseWithSchema(listProductsQuerySchema, Object.fromEntries(params.entries()))
}

export function parseCreateProductInput(body: unknown): CreateProductInput {
  return parseWithSchema(createProductSchema, body)
}

export function parseUpdateProductInput(body: unknown): UpdateProductInput {
  return parseWithSchema(updateProductSchema, body)
}

export function parseBatchUpdateProductsInput(body: unknown): BatchUpdateProductsInput {
  return parseWithSchema(batchUpdateProductsSchema, body)
}

export function parseCreateCategoryInput(body: unknown): CreateCategoryInput {
  return parseWithSchema(createCategorySchema, body)
}

export function parseUpdateCategoryInput(body: unknown): UpdateCategoryInput {
  return parseWithSchema(updateCategorySchema, body)
}

function buildProductWhere(query: ListProductsQuery): Prisma.ProductWhereInput {
  // 产品列表的筛选条件集中在这里，route 不再拼 Prisma where，避免查询规则分散。
  const where: Prisma.ProductWhereInput = {}
  const effectiveCategoryId = query.categoryId || query.category

  if (query.keyword) {
    // 转义 LIKE 通配符，防止用户输入影响 contains 查询语义，同时限制搜索长度。
    const sanitizedKeyword = query.keyword.replace(/[%_\\]/g, "\\$&").slice(0, 100)
    where.OR = [
      { name: { contains: sanitizedKeyword, mode: "insensitive" } },
      { description: { contains: sanitizedKeyword, mode: "insensitive" } },
    ]
  }

  if (effectiveCategoryId) {
    where.categoryId = effectiveCategoryId
  }

  if (query.isPublished !== undefined) {
    where.isPublished = query.isPublished === "true"
  }

  if (query.exclude) {
    where.id = { not: query.exclude }
  }

  return where
}

export async function listProducts(query: ListProductsQuery) {
  // 缓存键必须完整包含分页和筛选条件，否则不同列表请求可能互相污染结果。
  const effectiveCategoryId = query.categoryId || query.category
  const cacheKey = CACHE_KEYS.PRODUCT_LIST(
    JSON.stringify({
      page: query.page,
      pageSize: query.pageSize,
      keyword: query.keyword,
      category: effectiveCategoryId,
      isPublished: query.isPublished,
      exclude: query.exclude,
      limit: query.limit,
    })
  )

  const cached = await cacheGet<{
    success: true
    data: {
      list: unknown[]
      pagination: { page: number; pageSize: number; total: number; totalPages: number }
    }
  }>(cacheKey)

  if (cached) {
    return { ...cached, fromCache: true }
  }

  const take = query.limit || query.pageSize
  const skip = (query.page - 1) * (query.limit || query.pageSize)
  const where = buildProductWhere(query)

  const [list, total] = await withTransientPrismaRetry("listProducts", () =>
    Promise.all([
      findProducts(prisma, { where, skip, take }),
      countProducts(prisma, where),
    ])
  )
  const totalPages = Math.ceil(total / query.pageSize)
  const result = {
    success: true as const,
    data: {
      list,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
    },
  }

  await cacheSet(cacheKey, result, CACHE_TTL.MEDIUM)

  return result
}

async function clearProductCaches() {
  // 商品写操作后统一清理列表和 featured 缓存，避免前台/后台读到旧商品状态。
  await Promise.all([
    cacheDelPattern("solo:products:list:*"),
    cacheDelPattern("solo:products:featured"),
  ])
}

export async function createProductFromInput(input: CreateProductInput) {
  // SKU 是唯一业务键；创建前主动检查，返回可读冲突错误而不是数据库异常。
  if (input.sku) {
    const existing = await findProductBySku(prisma, input.sku)
    if (existing) {
      throw conflict("该 SKU 已存在")
    }
  }

  const product = await createProduct(prisma, {
    name: input.name,
    description: input.description,
    price: input.price,
    stock: input.stock,
    images: input.images,
    category: input.categoryId ? { connect: { id: input.categoryId } } : undefined,
    isPublished: input.isPublished,
    sku: input.sku || null,
  })

  await clearProductCaches()

  return product
}

export async function getProductDetail(id: string) {
  const product = await findProductById(prisma, id)
  if (!product) {
    throw notFound("产品")
  }
  return product
}

export async function updateProductFromInput(id: string, input: UpdateProductInput) {
  const existing = await findProductById(prisma, id)
  if (!existing) {
    throw notFound("产品")
  }

  if (input.sku && input.sku !== existing.sku) {
    const skuConflict = await findProductBySku(prisma, input.sku)
    if (skuConflict) {
      throw conflict("该 SKU 已存在")
    }
  }

  // categoryId 为 null 时显式断开分类关系；undefined 则表示不修改分类。
  const { categoryId, ...updateData } = input
  const product = await updateProduct(prisma, id, {
    ...updateData,
    ...(categoryId !== undefined
      ? { category: categoryId ? { connect: { id: categoryId } } : { disconnect: true } }
      : {}),
  })

  await clearProductCaches()

  return product
}

export async function deleteProductById(id: string) {
  const existing = await findProductById(prisma, id)
  if (!existing) {
    throw notFound("产品")
  }

  // 已产生订单明细的商品不能硬删除，避免历史订单失去商品引用。
  if (existing._count.orderItems > 0) {
    throw badRequest("该产品存在订单关联，无法删除")
  }

  await deleteProduct(prisma, id)
  await clearProductCaches()

  return { message: "删除成功" }
}

type FeaturedProductSource = {
  id: string
  name: string
  description: string
  price: { toNumber: () => number }
  stock: number
  images: string[]
  isPublished: boolean
  _count?: { orderItems: number }
}

export function transformFeaturedProduct(product: FeaturedProductSource): StorefrontProductItem {
  // featured 接口保持旧前台展示结构，避免首页轮播等客户端同步大改。
  const price = product.price.toNumber()
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price,
    originalPrice: Math.round(price * 1.4 * 100) / 100,
    image: product.images[0] || "",
    sales: product._count?.orderItems ?? 0,
    stock: product.stock,
  }
}

export async function getFeaturedProducts(): Promise<{
  products: StorefrontProductItem[]
  fromCache: boolean
}> {
  const cached = await cacheGet<StorefrontProductItem[]>(CACHE_KEYS.FEATURED_PRODUCTS)
  if (cached) {
    return { products: cached, fromCache: true }
  }

  const products = await withTransientPrismaRetry("getFeaturedProducts", () =>
    prisma.product.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    })
  )
  const transformed = products.map(transformFeaturedProduct)

  await cacheSet(CACHE_KEYS.FEATURED_PRODUCTS, transformed, CACHE_TTL.FEATURED_PRODUCTS)

  return { products: transformed, fromCache: false }
}

export async function getStorefrontProducts(
  filter?: StorefrontProductFilter
): Promise<StorefrontProductItem[]> {
  const where: Prisma.ProductWhereInput = { isPublished: true }

  if (filter === "new") {
    where.createdAt = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  }

  // 商品页筛选只影响服务端排序/过滤，返回结构继续复用首页轮播的 ProductItem 兼容格式。
  const products = await withTransientPrismaRetry("getStorefrontProducts", () =>
    prisma.product.findMany({
      where,
      orderBy: filter === "best" ? { orderItems: { _count: "desc" } } : { createdAt: "desc" },
      include: {
        _count: { select: { orderItems: true } },
      },
    })
  )

  return products.map(transformFeaturedProduct)
}

export async function batchUpdateProducts(input: BatchUpdateProductsInput) {
  await updateProductsPublished(prisma, input.ids, input.isPublished)
  await clearProductCaches()

  return {
    message: input.isPublished ? "批量上架成功" : "批量下架成功",
    data: { count: input.ids.length },
  }
}

export async function batchDeleteProducts(ids: string[]) {
  if (ids.length === 0) {
    throw badRequest("至少选择一个产品")
  }

  // 批量删除先在同一事务里检查订单关联，再执行删除，避免检查后数据变化。
  const result = await prisma.$transaction(async (tx) => {
    const productsWithOrders = await tx.product.findMany({
      where: { id: { in: ids } },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    })
    const productsWithOrderItems = productsWithOrders.filter(
      (product) => product._count.orderItems > 0
    )

    if (productsWithOrderItems.length > 0) {
      throw badRequest(`${productsWithOrderItems.length} 个产品存在订单关联，无法删除`)
    }

    return deleteProducts(tx, ids)
  })

  await clearProductCaches()

  return {
    message: "批量删除成功",
    data: { count: result.count },
  }
}

export async function listCategories() {
  return findCategories(prisma)
}

export async function createCategoryFromInput(input: CreateCategoryInput) {
  const existing = await findCategoryByName(prisma, input.name)
  if (existing) {
    throw conflict("该分类名称已存在")
  }

  return createCategory(prisma, {
    name: input.name,
    description: input.description,
  })
}

export async function updateCategoryFromInput(id: string, input: UpdateCategoryInput) {
  const existing = await findCategoryById(prisma, id)
  if (!existing) {
    throw notFound("分类")
  }

  // 分类名更新时只检查其他分类，允许保存当前分类原名称。
  if (input.name && input.name !== existing.name) {
    const nameConflict = await findCategoryByName(prisma, input.name, id)
    if (nameConflict) {
      throw conflict("该分类名称已存在")
    }
  }

  return updateCategory(prisma, id, input)
}

export async function deleteCategoryById(id: string) {
  const existing = await findCategoryById(prisma, id)
  if (!existing) {
    throw notFound("分类")
  }

  // 仍有关联商品的分类不能删除，避免商品列表出现悬空分类。
  if (existing._count.products > 0) {
    throw badRequest("该分类下存在产品，无法删除")
  }

  await deleteCategory(prisma, id)

  return { message: "删除成功" }
}
