/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：新增优惠券与积分服务测试，覆盖折扣计算、使用限制、积分获得和兑换保护。
 * 修改模型：gpt-5.5
 */
import { CouponType, PointType } from "@prisma/client"
import {
  earnPoints,
  redeemPoints,
  validateCoupon,
} from "../promotion-service"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    coupon: {
      findUnique: jest.fn(),
    },
    couponUsage: {
      count: jest.fn(),
    },
    customerPoints: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    loyaltyProgram: {
      findFirst: jest.fn(),
    },
    pointTransaction: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    coupon: { findUnique: jest.Mock }
    couponUsage: { count: jest.Mock }
    customerPoints: {
      create: jest.Mock
      findUnique: jest.Mock
      update: jest.Mock
    }
    loyaltyProgram: { findFirst: jest.Mock }
    pointTransaction: { create: jest.Mock }
    $transaction: jest.Mock
  }
}

describe("promotion-service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    prisma.$transaction.mockImplementation(async (operations: Array<Promise<unknown>>) =>
      Promise.all(operations)
    )
  })

  it("caps percentage coupon discounts by maxDiscount", async () => {
    prisma.coupon.findUnique.mockResolvedValue({
      id: "coupon_1",
      code: "SAVE20",
      name: "Save 20%",
      type: CouponType.PERCENTAGE,
      value: 20,
      maxDiscount: 15,
      minAmount: null,
      maxUses: null,
      usedCount: 0,
      perUserLimit: 1,
      isActive: true,
      startsAt: null,
      expiresAt: null,
    })
    prisma.couponUsage.count.mockResolvedValue(0)

    const result = await validateCoupon({
      code: "save20",
      cartTotal: 100,
      userId: "user_1",
    })

    expect(result).toEqual(
      expect.objectContaining({
        valid: true,
        discount: 15,
        finalTotal: 85,
      })
    )
  })

  it("rejects coupons that exceed the per-user usage limit", async () => {
    prisma.coupon.findUnique.mockResolvedValue({
      id: "coupon_1",
      code: "ONCE",
      name: "Once",
      type: CouponType.FIXED,
      value: 10,
      maxDiscount: null,
      minAmount: null,
      maxUses: null,
      usedCount: 0,
      perUserLimit: 1,
      isActive: true,
      startsAt: null,
      expiresAt: null,
    })
    prisma.couponUsage.count.mockResolvedValue(1)

    await expect(
      validateCoupon({
        code: "ONCE",
        cartTotal: 50,
        userId: "user_1",
      })
    ).resolves.toEqual({
      valid: false,
      error: "您已使用过此优惠券",
    })
  })

  it("earns purchase points and upgrades member tier", async () => {
    prisma.customerPoints.findUnique.mockResolvedValue({
      id: "points_1",
      userId: "user_1",
      balance: 100,
      totalEarned: 990,
      totalRedeemed: 0,
      tier: "BRONZE",
    })
    prisma.loyaltyProgram.findFirst.mockResolvedValue({
      pointsRate: 1,
      pointsToYuan: 0.01,
    })
    prisma.customerPoints.update
      .mockResolvedValueOnce({
        id: "points_1",
        balance: 120,
        totalEarned: 1010,
        totalRedeemed: 0,
        tier: "BRONZE",
      })
      .mockResolvedValueOnce({
        id: "points_1",
        balance: 120,
        totalEarned: 1010,
        totalRedeemed: 0,
        tier: "SILVER",
      })
    prisma.pointTransaction.create.mockResolvedValue({
      id: "tx_1",
      amount: 20,
      type: PointType.EARN,
    })

    const result = await earnPoints({
      userId: "user_1",
      orderAmount: 20,
      type: "PURCHASE",
    })

    expect(result).toEqual(
      expect.objectContaining({
        balance: 120,
        earnedPoints: 20,
        tier: "SILVER",
      })
    )
    expect(prisma.customerPoints.update).toHaveBeenLastCalledWith({
      where: { userId: "user_1" },
      data: { tier: "SILVER" },
    })
  })

  it("rejects point redemption when the balance is insufficient", async () => {
    prisma.customerPoints.findUnique.mockResolvedValue({
      id: "points_1",
      userId: "user_1",
      balance: 50,
      totalEarned: 50,
      totalRedeemed: 0,
      tier: "BRONZE",
    })
    prisma.loyaltyProgram.findFirst.mockResolvedValue({
      pointsToYuan: 0.01,
      minRedemption: 10,
    })

    await expect(
      redeemPoints({
        userId: "user_1",
        points: 100,
      })
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      statusCode: 400,
    })

    expect(prisma.pointTransaction.create).not.toHaveBeenCalled()
  })
})
