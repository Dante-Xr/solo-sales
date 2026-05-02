/**
 * 修改时间：2026-05-02 21:59:08 +08:00
 * 修改内容：补齐商品读路径多次断连重试与 storefront 商品筛选读取测试，以及批量删除事务边界测试。
 * 修改模型：gpt-5.5
 */
import { Prisma } from "@prisma/client"
import {
  batchDeleteProducts,
  createProductFromInput,
  deleteCategoryById,
  getStorefrontProducts,
  listProducts,
  transformFeaturedProduct,
} from "../product-service"

jest.mock("@/lib/cache", () => ({
  CACHE_KEYS: {
    PRODUCT_LIST: (params: string) => `solo:products:list:${params}`,
    FEATURED_PRODUCTS: "solo:products:featured",
  },
  CACHE_TTL: {
    MEDIUM: 300,
    FEATURED_PRODUCTS: 300,
  },
  cacheDelPattern: jest.fn().mockResolvedValue(0),
  cacheGet: jest.fn().mockResolvedValue(null),
  cacheSet: jest.fn().mockResolvedValue(true),
}))

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn(),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    category: {
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    product: {
      count: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    $transaction: jest.Mock
    $disconnect: jest.Mock
    category: {
      delete: jest.Mock
      findUnique: jest.Mock
    }
    product: {
      count: jest.Mock
      create: jest.Mock
      deleteMany: jest.Mock
      findMany: jest.Mock
      findUnique: jest.Mock
    }
  }
}

const { cacheDelPattern } = jest.requireMock("@/lib/cache") as {
  cacheDelPattern: jest.Mock
}

describe("product-service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    prisma.$transaction.mockImplementation(async (callback: (tx: typeof prisma) => Promise<unknown>) => callback(prisma))
  })

  it("builds product list query filters and pagination", async () => {
    prisma.product.findMany.mockResolvedValue([])
    prisma.product.count.mockResolvedValue(0)

    const result = await listProducts({
      page: 2,
      pageSize: 10,
      keyword: "phone%case",
      categoryId: "cat_1",
      isPublished: "true",
      exclude: "prod_old",
    })

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categoryId: "cat_1",
          isPublished: true,
          id: { not: "prod_old" },
          OR: [
            { name: { contains: "phone\\%case", mode: "insensitive" } },
            { description: { contains: "phone\\%case", mode: "insensitive" } },
          ],
        }),
        skip: 10,
        take: 10,
      })
    )
    expect(result.data.pagination).toEqual({
      page: 2,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    })
  })

  it("retries product list reads through multiple transient Prisma disconnects", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined)
    prisma.product.findMany
      .mockRejectedValueOnce({ code: "P1017", message: "Server has closed the connection." })
      .mockRejectedValueOnce({ code: "P1017", message: "Server has closed the connection again." })
      .mockResolvedValueOnce([{ id: "prod_1" }])
    prisma.product.count.mockResolvedValue(1)

    try {
      const result = await listProducts({
        page: 1,
        pageSize: 10,
      })

      // 商品列表是只读路径，P1017 连接瞬断时允许多次短重试，避免临时连接抖动变成页面 500。
      expect(prisma.product.findMany).toHaveBeenCalledTimes(3)
      expect(prisma.product.count).toHaveBeenCalledTimes(3)
      expect(warnSpy).toHaveBeenCalledTimes(2)
      expect(warnSpy).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("retrying transient Prisma read failure"),
        expect.objectContaining({ code: "P1017" })
      )
      expect(prisma.$disconnect).toHaveBeenCalledTimes(2)
      expect(result.data.list).toEqual([{ id: "prod_1" }])
      expect(result.data.pagination.total).toBe(1)
    } finally {
      warnSpy.mockRestore()
    }
  })

  it("rejects duplicate SKU when creating a product", async () => {
    prisma.product.findUnique.mockResolvedValue({ id: "existing" })

    await expect(
      createProductFromInput({
        name: "Test Product",
        description: "Description",
        price: 10,
        stock: 1,
        images: [],
        isPublished: true,
        sku: "SKU-1",
      })
    ).rejects.toMatchObject({
      code: "CONFLICT",
      statusCode: 409,
    })

    expect(prisma.product.create).not.toHaveBeenCalled()
  })

  it("transforms featured products for storefront display", () => {
    const transformed = transformFeaturedProduct({
      id: "prod_1",
      name: "Featured",
      description: "Description",
      price: new Prisma.Decimal(20),
      stock: 3,
      images: ["https://example.com/image.jpg"],
      isPublished: true,
      _count: { orderItems: 7 },
    })

    expect(transformed).toEqual({
      id: "prod_1",
      name: "Featured",
      description: "Description",
      price: 20,
      originalPrice: 28,
      image: "https://example.com/image.jpg",
      sales: 7,
      stock: 3,
    })
  })

  it("loads storefront products with best-seller ordering", async () => {
    prisma.product.findMany.mockResolvedValue([
      {
        id: "prod_1",
        name: "Best Seller",
        description: "Description",
        price: new Prisma.Decimal(50),
        stock: 8,
        images: ["/best.jpg"],
        isPublished: true,
        _count: { orderItems: 12 },
      },
    ])

    const products = await getStorefrontProducts("best")

    // 前台商品页复用服务层查询，避免页面组件直接拼 Prisma 查询并绕过连接重试。
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { isPublished: true },
      orderBy: { orderItems: { _count: "desc" } },
      include: {
        _count: { select: { orderItems: true } },
      },
    })
    expect(products).toEqual([
      {
        id: "prod_1",
        name: "Best Seller",
        description: "Description",
        price: 50,
        originalPrice: 70,
        image: "/best.jpg",
        sales: 12,
        stock: 8,
      },
    ])
  })

  it("prevents deleting categories that still contain products", async () => {
    prisma.category.findUnique.mockResolvedValue({
      id: "cat_1",
      _count: { products: 2 },
    })

    await expect(deleteCategoryById("cat_1")).rejects.toMatchObject({
      code: "BAD_REQUEST",
      statusCode: 400,
    })
    expect(prisma.category.delete).not.toHaveBeenCalled()
  })

  it("rejects empty batch product deletion before opening a transaction", async () => {
    await expect(batchDeleteProducts([])).rejects.toMatchObject({
      code: "BAD_REQUEST",
      statusCode: 400,
    })

    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(prisma.product.deleteMany).not.toHaveBeenCalled()
  })

  it("prevents batch deleting products that already have order items in the same transaction", async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: "prod_1", _count: { orderItems: 1 } },
      { id: "prod_2", _count: { orderItems: 0 } },
    ])

    await expect(batchDeleteProducts(["prod_1", "prod_2"])).rejects.toMatchObject({
      code: "BAD_REQUEST",
      statusCode: 400,
    })

    // 订单关联检查和删除在同一事务回调内执行，检查失败时不能继续硬删除。
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(prisma.product.deleteMany).not.toHaveBeenCalled()
    expect(cacheDelPattern).not.toHaveBeenCalled()
  })

  it("does not clear product caches when batch deletion fails inside the transaction", async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: "prod_1", _count: { orderItems: 0 } },
    ])
    prisma.product.deleteMany.mockRejectedValue(new Error("database delete failed"))

    await expect(batchDeleteProducts(["prod_1"])).rejects.toThrow("database delete failed")

    // 事务失败后不能清理缓存，否则前端可能提前看不到仍然存在的商品。
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(prisma.product.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["prod_1"] } },
    })
    expect(cacheDelPattern).not.toHaveBeenCalled()
  })

  it("batch deletes products and clears product caches after a successful transaction", async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: "prod_1", _count: { orderItems: 0 } },
      { id: "prod_2", _count: { orderItems: 0 } },
    ])
    prisma.product.deleteMany.mockResolvedValue({ count: 2 })

    const result = await batchDeleteProducts(["prod_1", "prod_2"])

    expect(result).toEqual({
      message: "批量删除成功",
      data: { count: 2 },
    })
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { id: { in: ["prod_1", "prod_2"] } },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    })
    expect(prisma.product.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["prod_1", "prod_2"] } },
    })
    expect(cacheDelPattern).toHaveBeenCalledWith("solo:products:list:*")
    expect(cacheDelPattern).toHaveBeenCalledWith("solo:products:featured")
  })
})
