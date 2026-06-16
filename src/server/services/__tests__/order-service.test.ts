/**
 * 修改时间：2026-06-04 16:40:36 +08:00
 * 修改内容：补充订单创建幂等、库存竞争和稳定订单 ID 测试，覆盖 Phase 2 交易域并发边界。
 * 修改模型：gpt-5.5
 */
import { Prisma } from "@prisma/client"
import { createOrder, getOrderByIdForViewer, parseCreateOrderInput } from "../order-service"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn(),
    order: {
      findUnique: jest.fn(),
    },
  },
}))

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    $transaction: jest.Mock
    order: {
      findUnique: jest.Mock
    }
  }
}

describe("order-service", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    prisma.order.findUnique.mockResolvedValue(null)
  })

  it("strips client supplied prices from create order input", () => {
    const input = parseCreateOrderInput({
      items: [{ productId: "prod_1", quantity: 2, price: 1 }],
      totalAmount: 2,
      shippingAddress: "123 Main St",
      contactInfo: { email: "buyer@example.com" },
    })

    expect(input).toEqual({
      items: [{ productId: "prod_1", quantity: 2 }],
      shippingAddress: "123 Main St",
      contactInfo: { email: "buyer@example.com" },
    })
  })

  it("rejects anonymous order creation before opening a transaction", async () => {
    await expect(
      createOrder(
        {
          items: [{ productId: "prod_1", quantity: 1 }],
          shippingAddress: "123 Main St",
          contactInfo: { email: "buyer@example.com" },
        },
        null
      )
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      statusCode: 401,
    })

    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it("calculates order totals from product prices inside the transaction", async () => {
    const tx = {
      product: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "prod_1",
            name: "Test Product",
            price: new Prisma.Decimal(12.5),
            stock: 10,
          },
        ]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      user: {
        upsert: jest.fn().mockResolvedValue({ id: "user_1" }),
      },
      order: {
        create: jest.fn().mockResolvedValue({ id: "order_1" }),
      },
    }

    prisma.$transaction.mockImplementation(async (callback) => callback(tx))

    await createOrder(
      {
        items: [{ productId: "prod_1", quantity: 3 }],
        shippingAddress: "123 Main St",
        contactInfo: { email: "buyer@example.com" },
      },
      { id: "user_1", email: "buyer@example.com" }
    )

    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalAmount: expect.objectContaining({
            toString: expect.any(Function),
          }),
          items: {
            create: [
              {
                productId: "prod_1",
                quantity: 3,
                price: expect.objectContaining({
                  toString: expect.any(Function),
                }),
              },
            ],
          },
        }),
      })
    )

    const createArg = tx.order.create.mock.calls[0][0]
    expect(createArg.data.totalAmount.toString()).toBe("37.5")
    expect(createArg.data.items.create[0].price.toString()).toBe("12.5")
  })

  it("returns an existing order for repeated idempotent create requests", async () => {
    const existingOrder = { id: "ord_existing" }
    prisma.order.findUnique.mockResolvedValue(existingOrder)

    const result = await createOrder(
      {
        items: [{ productId: "prod_1", quantity: 1 }],
        shippingAddress: "123 Main St",
        contactInfo: { email: "buyer@example.com" },
      },
      { id: "user_1", email: "buyer@example.com" },
      { idempotencyKey: "idem_123" }
    )

    expect(result).toBe(existingOrder)
    expect(prisma.order.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: expect.stringMatching(/^ord_[a-f0-9]{24}$/) },
      })
    )
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it("creates idempotent orders with a stable deterministic order id", async () => {
    const tx = {
      product: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "prod_1",
            name: "Test Product",
            price: new Prisma.Decimal(12.5),
            stock: 10,
          },
        ]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      user: {
        upsert: jest.fn().mockResolvedValue({ id: "user_1" }),
      },
      order: {
        create: jest.fn().mockResolvedValue({ id: "order_1" }),
      },
    }

    prisma.$transaction.mockImplementation(async (callback) => callback(tx))

    await createOrder(
      {
        items: [{ productId: "prod_1", quantity: 1 }],
        shippingAddress: "123 Main St",
        contactInfo: { email: "buyer@example.com" },
      },
      { id: "user_1", email: "buyer@example.com" },
      { idempotencyKey: "idem_123" }
    )

    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: expect.stringMatching(/^ord_[a-f0-9]{24}$/),
        }),
      })
    )
  })

  it("rejects anonymous reads for legacy guest orders", async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: "ord_guest",
      userId: "guest",
      items: [],
    })

    await expect(getOrderByIdForViewer("ord_guest", null)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      statusCode: 401,
    })
  })

  it("rejects order creation when requested quantity exceeds stock", async () => {
    const tx = {
      product: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "prod_1",
            name: "Low Stock Product",
            price: new Prisma.Decimal(12.5),
            stock: 1,
          },
        ]),
        updateMany: jest.fn(),
      },
      user: {
        upsert: jest.fn(),
      },
      order: {
        create: jest.fn(),
      },
    }

    prisma.$transaction.mockImplementation(async (callback) => callback(tx))

    await expect(
      createOrder(
        {
          items: [{ productId: "prod_1", quantity: 2 }],
          shippingAddress: "123 Main St",
          contactInfo: { email: "buyer@example.com" },
        },
        { id: "user_1", email: "buyer@example.com" }
      )
    ).rejects.toMatchObject({
      code: "INSUFFICIENT_STOCK",
      statusCode: 422,
    })

    expect(tx.product.updateMany).not.toHaveBeenCalled()
    expect(tx.order.create).not.toHaveBeenCalled()
  })

  it("rejects order creation when concurrent stock decrement wins the race", async () => {
    const tx = {
      product: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "prod_1",
            name: "Race Product",
            price: new Prisma.Decimal(12.5),
            stock: 2,
          },
        ]),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      user: {
        upsert: jest.fn(),
      },
      order: {
        create: jest.fn(),
      },
    }

    prisma.$transaction.mockImplementation(async (callback) => callback(tx))

    await expect(
      createOrder(
        {
          items: [{ productId: "prod_1", quantity: 2 }],
          shippingAddress: "123 Main St",
          contactInfo: { email: "buyer@example.com" },
        },
        { id: "user_1", email: "buyer@example.com" }
      )
    ).rejects.toMatchObject({
      code: "INSUFFICIENT_STOCK",
      statusCode: 422,
    })

    // 库存读取后仍以条件 updateMany 作为最终扣减防线，并发竞争失败时不能创建订单。
    expect(tx.product.updateMany).toHaveBeenCalledWith({
      where: {
        id: "prod_1",
        stock: { gte: 2 },
      },
      data: {
        stock: { decrement: 2 },
      },
    })
    expect(tx.order.create).not.toHaveBeenCalled()
  })
})
