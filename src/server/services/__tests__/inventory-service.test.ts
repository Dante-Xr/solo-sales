/**
 * 修改时间：2026-05-02 18:37:11 +08:00
 * 修改内容：新增库存与批发导入服务测试，覆盖图片解析、批量导入进度、失败统计和库存预警查询。
 * 修改模型：gpt-5.5
 */
import {
  getStockAlertData,
  importMappedProducts,
  listImportLogs,
  parseMappedImages,
} from "../inventory-service"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    importLog: {
      count: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    product: {
      upsert: jest.fn(),
    },
    stockAlertLog: {
      findMany: jest.fn(),
    },
  },
}))

jest.mock("@/lib/wholesalers/1866/client", () => ({
  I1866Client: jest.fn(),
}))

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    importLog: {
      count: jest.Mock
      findMany: jest.Mock
      update: jest.Mock
    }
    product: {
      upsert: jest.Mock
    }
    stockAlertLog: {
      findMany: jest.Mock
    }
  }
}

describe("inventory-service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("parses mapped image JSON into a product image array", () => {
    expect(parseMappedImages(JSON.stringify(["https://example.com/a.png", 123, "b.png"]))).toEqual([
      "https://example.com/a.png",
      "b.png",
    ])
    expect(parseMappedImages("not-json")).toEqual([])
  })

  it("imports mapped products with parsed images and updates progress", async () => {
    prisma.product.upsert.mockResolvedValue({})
    prisma.importLog.update.mockResolvedValue({})

    const result = await importMappedProducts(
      [
        {
          externalId: "external_1",
          sku: "SKU-1",
          name: "Imported Product",
          description: "From wholesaler",
          price: 19.99,
          originalPrice: 29.99,
          stock: 8,
          images: JSON.stringify(["image-1.png"]),
          category: "Other",
          tags: "[]",
          isPublished: true,
          wholesaler: "1866",
        },
      ],
      "log_1"
    )

    expect(prisma.product.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          id: "prod_external_1",
          images: ["image-1.png"],
          sku: "SKU-1",
        }),
      })
    )
    expect(prisma.importLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "log_1" },
        data: { totalProducts: 1, successCount: 1, failCount: 0 },
      })
    )
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        total: 1,
        successCount: 1,
        failCount: 0,
      })
    )
  })

  it("records failed batches without stopping later progress updates", async () => {
    prisma.product.upsert.mockRejectedValue(new Error("database unavailable"))
    prisma.importLog.update.mockResolvedValue({})

    const result = await importMappedProducts(
      [
        {
          externalId: "external_2",
          sku: "SKU-2",
          name: "Broken Product",
          description: "",
          price: 10,
          originalPrice: 12,
          stock: 1,
          images: "[]",
          category: "Other",
          tags: "[]",
          isPublished: true,
          wholesaler: "1866",
        },
      ],
      "log_2"
    )

    // 单批次失败时返回失败统计，同时仍写入导入日志进度，方便后台查看失败阶段。
    expect(result.success).toBe(false)
    expect(result.failCount).toBe(1)
    expect(result.errors[0]).toContain("database unavailable")
    expect(prisma.importLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { totalProducts: 1, successCount: 0, failCount: 1 },
      })
    )
  })

  it("lists import logs with pagination metadata", async () => {
    prisma.importLog.findMany.mockResolvedValue([
      {
        id: "log_1",
        wholesaler: "1866",
        status: "COMPLETED",
        totalProducts: 1,
        successCount: 1,
        failCount: 0,
        errorDetails: [],
        startedAt: new Date("2026-05-01T00:00:00.000Z"),
        completedAt: null,
        triggeredBy: "admin",
      },
    ])
    prisma.importLog.count.mockResolvedValue(21)

    const result = await listImportLogs({ page: 2, pageSize: 20 })

    expect(prisma.importLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 20 })
    )
    expect(result.totalPages).toBe(2)
    expect(result.logs[0].completedAt).toBeUndefined()
  })

  it("returns stock alert defaults or recent logs based on query", async () => {
    const defaultConfig = await getStockAlertData({ productId: "product_1", limit: 50 })
    expect(defaultConfig).toEqual({
      productId: "product_1",
      threshold: 10,
      isEnabled: false,
      notifyEmails: [],
    })

    prisma.stockAlertLog.findMany.mockResolvedValue([{ id: "alert_1" }])
    const logs = await getStockAlertData({ logs: "true", limit: 10 })

    expect(prisma.stockAlertLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10 })
    )
    expect(logs).toEqual([{ id: "alert_1" }])
  })
})
