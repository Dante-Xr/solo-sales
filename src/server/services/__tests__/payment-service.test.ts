/**
 * 修改时间：2026-06-04 16:40:36 +08:00
 * 修改内容：补充 Stripe Webhook 事务双写与唯一约束冲突重放测试，覆盖 Phase 2 支付幂等边界。
 * 修改模型：gpt-5.5
 */
import { Prisma } from "@prisma/client"
import { createStripeCheckoutSession, handleStripeWebhookEvent } from "../payment-service"

const mockSessionsCreate = jest.fn()

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn(),
    order: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    product: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}))

jest.mock("@/server/payments/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: mockSessionsCreate,
      },
    },
  }),
  isStripeTestMode: () => true,
}))

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    $transaction: jest.Mock
    order: {
      create: jest.Mock
      findFirst: jest.Mock
      update: jest.Mock
    }
    payment: {
      create: jest.Mock
      findFirst: jest.Mock
    }
    product: {
      findFirst: jest.Mock
      findUnique: jest.Mock
    }
    user: {
      findUnique: jest.Mock
      upsert: jest.Mock
    }
  }
}

describe("payment-service", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    prisma.$transaction.mockImplementation(async (callback) => callback(prisma))
  })

  it("creates Stripe Checkout Sessions from database product pricing", async () => {
    prisma.product.findFirst.mockResolvedValue({
      id: "prod_1",
      name: "Database Product",
      price: new Prisma.Decimal(19.99),
      stock: 5,
    })
    mockSessionsCreate.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.test/session",
    })

    const result = await createStripeCheckoutSession({
      productId: "prod_1",
      quantity: 2,
      origin: "https://example.com",
    })

    expect(mockSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              product_data: { name: "Database Product" },
              unit_amount: 1999,
            }),
            quantity: 2,
          }),
        ],
        metadata: {
          productId: "prod_1",
          quantity: "2",
        },
      })
    )
    expect(result).toEqual({
      sessionId: "cs_test_123",
      url: "https://checkout.stripe.test/session",
      isTestMode: true,
    })
  })

  it("rejects checkout when database stock is insufficient", async () => {
    prisma.product.findFirst.mockResolvedValue({
      id: "prod_1",
      name: "Low Stock Product",
      price: new Prisma.Decimal(19.99),
      stock: 1,
    })

    await expect(
      createStripeCheckoutSession({
        productId: "prod_1",
        quantity: 2,
        origin: "https://example.com",
      })
    ).rejects.toMatchObject({
      code: "INSUFFICIENT_STOCK",
      statusCode: 422,
    })

    expect(mockSessionsCreate).not.toHaveBeenCalled()
  })

  it("marks existing payments as paid without creating duplicate payment records", async () => {
    prisma.payment.findFirst.mockResolvedValue({
      id: "pay_1",
      orderId: "order_1",
      order: { id: "order_1" },
    })

    await handleStripeWebhookEvent({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          amount_total: 1999,
          currency: "usd",
          payment_intent: "pi_test_123",
          metadata: { productId: "prod_1", quantity: "1" },
          customer_details: { email: "buyer@example.com" },
        },
      },
    } as never)

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: "order_1" },
      data: { status: "PAID", paymentMethod: "stripe" },
    })
    expect(prisma.payment.create).not.toHaveBeenCalled()
  })

  it("creates an order and payment record for completed checkout sessions without a precreated order", async () => {
    prisma.payment.findFirst.mockResolvedValue(null)
    prisma.order.findFirst.mockResolvedValue(null)
    prisma.product.findUnique.mockResolvedValue({
      id: "prod_1",
      price: new Prisma.Decimal(19.99),
    })
    prisma.user.findUnique.mockResolvedValue({ id: "user_1" })
    prisma.order.create.mockResolvedValue({ id: "order_1" })

    await handleStripeWebhookEvent({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          amount_total: 1999,
          currency: "usd",
          payment_intent: "pi_test_123",
          metadata: { productId: "prod_1", quantity: "2" },
          customer_details: { email: "buyer@example.com" },
        },
      },
    } as never)

    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user_1",
          totalAmount: 19.99,
          status: "PAID",
          paymentMethod: "stripe",
          items: {
            create: {
              productId: "prod_1",
              quantity: 2,
              price: expect.objectContaining({ toString: expect.any(Function) }),
            },
          },
        }),
      })
    )
    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: {
        orderId: "order_1",
        amount: 19.99,
        currency: "USD",
        status: "COMPLETED",
        provider: "stripe",
        transactionId: "pi_test_123",
      },
    })
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
  })

  it("replays duplicate webhook delivery when payment unique constraint already exists", async () => {
    prisma.payment.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "pay_1",
        orderId: "order_1",
        order: { id: "order_1" },
      })
    prisma.order.findFirst.mockResolvedValue(null)
    prisma.product.findUnique.mockResolvedValue({
      id: "prod_1",
      price: new Prisma.Decimal(19.99),
    })
    prisma.user.findUnique.mockResolvedValue({ id: "user_1" })
    prisma.order.create.mockResolvedValue({ id: "order_1" })
    prisma.payment.create.mockRejectedValue({ code: "P2002" })

    await handleStripeWebhookEvent({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          amount_total: 1999,
          currency: "usd",
          payment_intent: "pi_test_123",
          metadata: { productId: "prod_1", quantity: "2" },
          customer_details: { email: "buyer@example.com" },
        },
      },
    } as never)

    expect(prisma.payment.findFirst).toHaveBeenLastCalledWith({
      where: { provider: "stripe", transactionId: "pi_test_123" },
      include: { order: true },
    })
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: "order_1" },
      data: { status: "PAID", paymentMethod: "stripe" },
    })
  })
})
