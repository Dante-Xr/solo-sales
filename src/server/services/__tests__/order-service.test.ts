/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：新增订单服务测试，验证客户端金额被剥离、订单总额按数据库价格计算和库存异常处理。
 * 修改模型：gpt-5.5
 */
import { Prisma } from "@prisma/client"
import { createOrder, parseCreateOrderInput } from "../order-service"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}))

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    $transaction: jest.Mock
  }
}

describe("order-service", () => {
  beforeEach(() => {
    jest.resetAllMocks()
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
      null
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
        null
      )
    ).rejects.toMatchObject({
      code: "INSUFFICIENT_STOCK",
      statusCode: 422,
    })

    expect(tx.product.updateMany).not.toHaveBeenCalled()
    expect(tx.order.create).not.toHaveBeenCalled()
  })
})
