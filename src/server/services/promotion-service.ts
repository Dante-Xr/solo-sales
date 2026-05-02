/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：新增优惠券与积分领域服务，封装优惠券校验、折扣计算、积分余额和积分交易逻辑。
 * 修改模型：gpt-5.5
 */
import "server-only"

import { CouponType, PointType } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { badRequest, conflict, notFound } from "@/server/contracts/errors"
import {
  countCouponUsage,
  countCoupons,
  countPointTransactions,
  createCoupon,
  createCustomerPointsAccount,
  createPointTransaction,
  deleteCoupon,
  findActiveLoyaltyProgram,
  findCouponByCode,
  findCouponById,
  findCoupons,
  findCustomerPointsAccount,
  findCustomerPointsByUserId,
  findPointTransactions,
  updateCoupon,
  updateCustomerPoints,
} from "@/server/repositories/promotion-repository"

export const listCouponsQuerySchema = z.object({
  isActive: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

export const couponInputSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  type: z.nativeEnum(CouponType).optional(),
  value: z.coerce.number().positive().optional(),
  minAmount: z.coerce.number().positive().nullable().optional(),
  maxDiscount: z.coerce.number().positive().nullable().optional(),
  maxUses: z.coerce.number().int().positive().nullable().optional(),
  perUserLimit: z.coerce.number().int().positive().optional(),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

export const createCouponInputSchema = couponInputSchema.extend({
  code: z.string().min(1, "优惠券码不能为空"),
  name: z.string().min(1, "优惠券名称不能为空"),
  type: z.nativeEnum(CouponType),
  value: z.coerce.number().positive("优惠值必须大于 0"),
})

export const validateCouponInputSchema = z.object({
  code: z.string().min(1, "优惠券码不能为空"),
  cartTotal: z.coerce.number().nonnegative("购物车金额不能为负数"),
  userId: z.string().min(1, "缺少 userId 参数"),
})

export const pointsQuerySchema = z.object({
  userId: z.string().min(1, "缺少 userId 参数"),
})

export const earnPointsInputSchema = z.object({
  userId: z.string().min(1, "缺少 userId 参数"),
  orderId: z.string().optional(),
  orderAmount: z.coerce.number().optional(),
  type: z.enum(["PURCHASE", "BONUS", "ADMIN"]),
  description: z.string().optional(),
})

export const redeemPointsInputSchema = z.object({
  userId: z.string().min(1, "缺少 userId 参数"),
  points: z.coerce.number().int().positive("积分数量必须大于 0"),
  orderId: z.string().optional(),
  description: z.string().optional(),
})

export const pointTransactionsQuerySchema = z.object({
  userId: z.string().min(1, "缺少 userId 参数"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  type: z.nativeEnum(PointType).optional(),
})

type CreateCouponInput = z.infer<typeof createCouponInputSchema>
type UpdateCouponInput = z.infer<typeof couponInputSchema>
type ValidateCouponInput = z.infer<typeof validateCouponInputSchema>
type EarnPointsInput = z.infer<typeof earnPointsInputSchema>
type RedeemPointsInput = z.infer<typeof redeemPointsInputSchema>

function parseWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw badRequest("参数错误", parsed.error.issues)
  }
  return parsed.data
}

export function parseListCouponsQuery(params: URLSearchParams) {
  return parseWithSchema(listCouponsQuerySchema, Object.fromEntries(params.entries()))
}

export function parseCreateCouponInput(body: unknown) {
  return parseWithSchema(createCouponInputSchema, body)
}

export function parseUpdateCouponInput(body: unknown) {
  return parseWithSchema(couponInputSchema, body)
}

export function parseValidateCouponInput(body: unknown) {
  return parseWithSchema(validateCouponInputSchema, body)
}

export function parsePointsQuery(params: URLSearchParams) {
  return parseWithSchema(pointsQuerySchema, Object.fromEntries(params.entries()))
}

export function parseEarnPointsInput(body: unknown) {
  return parseWithSchema(earnPointsInputSchema, body)
}

export function parseRedeemPointsInput(body: unknown) {
  return parseWithSchema(redeemPointsInputSchema, body)
}

export function parsePointTransactionsQuery(params: URLSearchParams) {
  return parseWithSchema(pointTransactionsQuerySchema, Object.fromEntries(params.entries()))
}

export async function listCoupons(query: z.infer<typeof listCouponsQuerySchema>) {
  const where = {
    ...(query.isActive === "true" ? { isActive: true } : {}),
    ...(query.isActive === "false" ? { isActive: false } : {}),
  }
  const [coupons, total] = await Promise.all([
    findCoupons(prisma, {
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    countCoupons(prisma, where),
  ])

  return {
    coupons,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  }
}

function normalizeCouponData(input: CreateCouponInput | UpdateCouponInput) {
  return {
    ...(input.code !== undefined && { code: input.code.toUpperCase() }),
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.type !== undefined && { type: input.type }),
    ...(input.value !== undefined && { value: input.value }),
    ...(input.minAmount !== undefined && { minAmount: input.minAmount }),
    ...(input.maxDiscount !== undefined && { maxDiscount: input.maxDiscount }),
    ...(input.maxUses !== undefined && { maxUses: input.maxUses }),
    ...(input.perUserLimit !== undefined && { perUserLimit: input.perUserLimit }),
    ...(input.startsAt !== undefined && { startsAt: input.startsAt ? new Date(input.startsAt) : null }),
    ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt ? new Date(input.expiresAt) : null }),
    ...(input.isActive !== undefined && { isActive: input.isActive }),
  }
}

export async function createCouponFromInput(input: CreateCouponInput) {
  const code = input.code.toUpperCase()
  const existing = await findCouponByCode(prisma, code)
  if (existing) {
    throw conflict("优惠券码已存在")
  }

  // 创建时 code/name/type/value 是必填字段，normalize 后显式补齐必填类型。
  return createCoupon(prisma, {
    ...normalizeCouponData({ ...input, code }),
    code,
    name: input.name,
    type: input.type,
    value: input.value,
  })
}

export async function getCouponDetail(id: string) {
  const coupon = await findCouponById(prisma, id)
  if (!coupon) {
    throw notFound("优惠券")
  }
  return coupon
}

export async function updateCouponFromInput(id: string, input: UpdateCouponInput) {
  const existing = await findCouponById(prisma, id)
  if (!existing) {
    throw notFound("优惠券")
  }
  return updateCoupon(prisma, id, normalizeCouponData(input))
}

export async function deleteCouponById(id: string) {
  const existing = await findCouponById(prisma, id)
  if (!existing) {
    throw notFound("优惠券")
  }
  await deleteCoupon(prisma, id)
  return { message: "优惠券已删除" }
}

function invalidCoupon(error: string) {
  return { valid: false, error }
}

export async function validateCoupon(input: ValidateCouponInput) {
  const coupon = await findCouponByCode(prisma, input.code.toUpperCase())

  if (!coupon) return invalidCoupon("优惠券不存在")
  if (!coupon.isActive) return invalidCoupon("优惠券已禁用")

  const now = new Date()
  if (coupon.startsAt && now < coupon.startsAt) return invalidCoupon("优惠券还未开始生效")
  if (coupon.expiresAt && now > coupon.expiresAt) return invalidCoupon("优惠券已过期")
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return invalidCoupon("优惠券已用完")
  if (coupon.minAmount && input.cartTotal < Number(coupon.minAmount)) {
    return invalidCoupon(`订单金额需满 ¥${Number(coupon.minAmount)} 才能使用此优惠券`)
  }

  const userUsageCount = await countCouponUsage(prisma, coupon.id, input.userId)
  if (coupon.perUserLimit && userUsageCount >= coupon.perUserLimit) {
    return invalidCoupon("您已使用过此优惠券")
  }

  let discount = 0
  if (coupon.type === "PERCENTAGE") {
    discount = (input.cartTotal * Number(coupon.value)) / 100
    if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount))
  } else {
    discount = Number(coupon.value)
  }
  discount = Math.min(discount, input.cartTotal)

  return {
    valid: true,
    discount,
    finalTotal: input.cartTotal - discount,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      type: coupon.type,
      value: Number(coupon.value),
    },
  }
}

export async function getPointsInfo(userId: string) {
  const [customerPoints, program] = await Promise.all([
    findCustomerPointsByUserId(prisma, userId),
    findActiveLoyaltyProgram(prisma),
  ])

  if (!customerPoints) {
    return {
      balance: 0,
      totalEarned: 0,
      totalRedeemed: 0,
      tier: "BRONZE",
      program,
    }
  }

  return { ...customerPoints, program }
}

export async function createPointsAccount(userId: string) {
  const existing = await findCustomerPointsAccount(prisma, userId)
  if (existing) {
    throw badRequest("积分账户已存在")
  }
  return createCustomerPointsAccount(prisma, userId)
}

function calculateTier(totalEarned: number): "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" {
  if (totalEarned >= 10000) return "PLATINUM"
  if (totalEarned >= 5000) return "GOLD"
  if (totalEarned >= 1000) return "SILVER"
  return "BRONZE"
}

async function ensureCustomerPoints(userId: string) {
  const existing = await findCustomerPointsAccount(prisma, userId)
  return existing ?? createCustomerPointsAccount(prisma, userId)
}

export async function earnPoints(input: EarnPointsInput) {
  const customerPoints = await ensureCustomerPoints(input.userId)
  const program = await findActiveLoyaltyProgram(prisma)
  const pointsRate = program?.pointsRate || 1.0

  let pointsToEarn = 0
  let description = ""

  if (input.type === "PURCHASE" && input.orderAmount) {
    pointsToEarn = Math.floor(input.orderAmount * pointsRate)
    description = input.description || `订单消费获得 ${pointsToEarn} 积分`
  } else if (input.type === "BONUS" || input.type === "ADMIN") {
    pointsToEarn = Math.floor(input.orderAmount || 0)
    description =
      input.description ||
      (input.type === "BONUS"
        ? `奖励获得 ${pointsToEarn} 积分`
        : `管理员调整获得 ${pointsToEarn} 积分`)
  }

  if (pointsToEarn <= 0) {
    throw badRequest("积分数量必须大于 0")
  }

  const [updatedPoints, transaction] = await prisma.$transaction([
    updateCustomerPoints(prisma, input.userId, {
      balance: customerPoints.balance + pointsToEarn,
      totalEarned: customerPoints.totalEarned + pointsToEarn,
    }),
    createPointTransaction(prisma, {
      customerPoints: { connect: { id: customerPoints.id } },
      userId: input.userId,
      amount: pointsToEarn,
      type: input.type === "BONUS" ? "BONUS" : input.type === "ADMIN" ? "ADJUST" : "EARN",
      orderId: input.orderId || null,
      description,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    }),
  ])

  const newTier = calculateTier(updatedPoints.totalEarned)
  if (newTier !== updatedPoints.tier) {
    await updateCustomerPoints(prisma, input.userId, { tier: newTier })
  }

  return {
    // updateCustomerPoints 返回的 balance 已是入账后余额，避免响应里重复叠加本次积分。
    balance: updatedPoints.balance,
    earnedPoints: pointsToEarn,
    tier: newTier,
    transaction,
  }
}

export async function redeemPoints(input: RedeemPointsInput) {
  const customerPoints = await findCustomerPointsAccount(prisma, input.userId)
  if (!customerPoints) {
    throw notFound("积分账户")
  }

  const program = await findActiveLoyaltyProgram(prisma)
  const pointsRate = program?.pointsToYuan || 0.01
  const redeemAmount = input.points * pointsRate

  if (customerPoints.balance < input.points) {
    throw badRequest("积分余额不足")
  }
  if (program && input.points < program.minRedemption) {
    throw badRequest(`最低兑换积分为 ${program.minRedemption}`)
  }

  const [updatedPoints, transaction] = await prisma.$transaction([
    updateCustomerPoints(prisma, input.userId, {
      balance: customerPoints.balance - input.points,
      totalRedeemed: customerPoints.totalRedeemed + input.points,
    }),
    createPointTransaction(prisma, {
      customerPoints: { connect: { id: customerPoints.id } },
      userId: input.userId,
      amount: -input.points,
      type: "REDEEM",
      orderId: input.orderId || null,
      description: input.description || `积分兑换抵扣 ¥${redeemAmount.toFixed(2)}`,
    }),
  ])

  return {
    balance: updatedPoints.balance,
    redeemedPoints: input.points,
    redeemAmount,
    transaction,
  }
}

export async function listPointTransactions(query: z.infer<typeof pointTransactionsQuerySchema>) {
  const customerPoints = await findCustomerPointsAccount(prisma, query.userId)
  if (!customerPoints) {
    return {
      transactions: [],
      pagination: { page: query.page, pageSize: query.pageSize, total: 0, totalPages: 0 },
    }
  }

  const where = {
    userId: query.userId,
    customerPointsId: customerPoints.id,
    ...(query.type ? { type: query.type } : {}),
  }
  const [transactions, total] = await Promise.all([
    findPointTransactions(prisma, {
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    countPointTransactions(prisma, where),
  ])

  return {
    transactions,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  }
}
