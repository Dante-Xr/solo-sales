/**
 * 2026-03-24: API 请求验证模块
 * 功能：使用 Zod 定义所有 API 请求的验证 Schema
 * 目的：防止注入攻击和无效数据进入系统
 * 使用场景：
 *   - /api/auth/register 请求体验证
 *   - /api/checkout/stripe 请求体验证
 *   - /api/checkout/paypal 请求体验证
 */
import { z } from "zod"

/**
 * 2026-03-24: 用户注册请求验证 Schema
 * 规则：
 *   - email: 有效的邮箱格式
 *   - password: 最少8位，包含字母和数字
 *   - name: 可选，2-50个字符
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "邮箱不能为空")
    .email("邮箱格式不正确"),
  password: z
    .string()
    .min(8, "密码长度必须至少8位")
    .regex(/[a-zA-Z]/, "密码必须包含字母")
    .regex(/[0-9]/, "密码必须包含数字"),
  name: z
    .string()
    .min(2, "名称长度至少2个字符")
    .max(50, "名称长度最多50个字符")
    .optional(),
})

/**
 * 2026-03-24: Stripe 支付请求验证 Schema
 * 规则：
 *   - productId: 非空字符串
 *   - productName: 非空字符串
 *   - price: 正数
 *   - quantity: 正整数，默认1
 */
export const stripeCheckoutSchema = z.object({
  productId: z
    .string()
    .min(1, "商品ID不能为空"),
  productName: z
    .string()
    .min(1, "商品名称不能为空")
    .max(200, "商品名称过长"),
  price: z
    .number()
    .positive("价格必须大于0")
    .max(999999, "价格超出允许范围"),
  quantity: z
    .number()
    .int("数量必须是整数")
    .positive("数量必须大于0")
    .max(99, "数量超出允许范围")
    .default(1),
})

/**
 * 2026-03-24: PayPal 支付请求验证 Schema
 * 规则：
 *   - price: 正数
 *   - quantity: 正整数，默认1
 */
export const paypalCheckoutSchema = z.object({
  price: z
    .number()
    .positive("价格必须大于0")
    .max(999999, "价格超出允许范围"),
  quantity: z
    .number()
    .int("数量必须是整数")
    .positive("数量必须大于0")
    .max(99, "数量超出允许范围")
    .default(1),
})

/**
 * 2026-03-24: 搜索请求验证 Schema
 * 规则：
 *   - query: 非空字符串，最多100字符
 */
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, "搜索关键词不能为空")
    .max(100, "搜索关键词最多100个字符"),
})

/**
 * 2026-03-24: 通用错误类型
 */
export type ValidationError = {
  field: string
  message: string
}

/**
 * 2026-03-24: 解析并验证请求体
 * @param schema - Zod Schema
 * @param data - 待验证的数据
 * @returns 验证结果：成功返回解析后的数据，失败返回错误信息
 */
export function parseWithValidation<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // 2026-03-24: 将 Zod 错误转换为通用错误格式
  // result.error 是 ZodError 类型，其 issues 属性包含所有验证错误
  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }))

  return { success: false, errors }
}
