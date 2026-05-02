/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：新增优惠券与积分仓储封装，集中 Prisma 查询、创建、更新和交易流水操作。
 * 修改模型：gpt-5.5
 */
import "server-only"

import type { Prisma, PrismaClient } from "@prisma/client"

export type PromotionDbClient = PrismaClient | Prisma.TransactionClient

export function findCoupons(
  db: PromotionDbClient,
  args: { where: Prisma.CouponWhereInput; skip: number; take: number }
) {
  return db.coupon.findMany({
    where: args.where,
    orderBy: { createdAt: "desc" },
    skip: args.skip,
    take: args.take,
  })
}

export function countCoupons(db: PromotionDbClient, where: Prisma.CouponWhereInput) {
  return db.coupon.count({ where })
}

export function findCouponByCode(db: PromotionDbClient, code: string) {
  return db.coupon.findUnique({ where: { code } })
}

export function findCouponById(db: PromotionDbClient, id: string) {
  return db.coupon.findUnique({
    where: { id },
    include: {
      usages: {
        take: 10,
        orderBy: { usedAt: "desc" },
      },
    },
  })
}

export function createCoupon(db: PromotionDbClient, data: Prisma.CouponCreateInput) {
  return db.coupon.create({ data })
}

export function updateCoupon(
  db: PromotionDbClient,
  id: string,
  data: Prisma.CouponUpdateInput
) {
  return db.coupon.update({ where: { id }, data })
}

export function deleteCoupon(db: PromotionDbClient, id: string) {
  return db.coupon.delete({ where: { id } })
}

export function countCouponUsage(
  db: PromotionDbClient,
  couponId: string,
  userId: string
) {
  return db.couponUsage.count({
    where: { couponId, userId },
  })
}

export function findCustomerPointsByUserId(db: PromotionDbClient, userId: string) {
  return db.customerPoints.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export function findCustomerPointsAccount(db: PromotionDbClient, userId: string) {
  return db.customerPoints.findUnique({ where: { userId } })
}

export function createCustomerPointsAccount(db: PromotionDbClient, userId: string) {
  return db.customerPoints.create({
    data: {
      userId,
      balance: 0,
      totalEarned: 0,
      totalRedeemed: 0,
      tier: "BRONZE",
    },
  })
}

export function findActiveLoyaltyProgram(db: PromotionDbClient) {
  return db.loyaltyProgram.findFirst({ where: { isActive: true } })
}

export function updateCustomerPoints(
  db: PromotionDbClient,
  userId: string,
  data: Prisma.CustomerPointsUpdateInput
) {
  return db.customerPoints.update({ where: { userId }, data })
}

export function createPointTransaction(
  db: PromotionDbClient,
  data: Prisma.PointTransactionCreateInput
) {
  return db.pointTransaction.create({ data })
}

export function findPointTransactions(
  db: PromotionDbClient,
  args: { where: Prisma.PointTransactionWhereInput; skip: number; take: number }
) {
  return db.pointTransaction.findMany({
    where: args.where,
    orderBy: { createdAt: "desc" },
    skip: args.skip,
    take: args.take,
  })
}

export function countPointTransactions(
  db: PromotionDbClient,
  where: Prisma.PointTransactionWhereInput
) {
  return db.pointTransaction.count({ where })
}
