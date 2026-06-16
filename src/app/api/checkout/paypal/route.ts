/**
 * 修改时间：2026-05-02 21:09:54 +08:00
 * 修改内容：将 PayPal mock 收敛为禁用兼容端点，避免生产或开发误用。
 * 修改模型：gpt-5.5
 *
 * 2026-03-24: PayPal 结账后端 API 路由
 * 功能：PayPal 不进入 v2.0 上线范围，所有环境返回禁用响应
 */
import { errorResponse } from "@/server/contracts/api"
import { ErrorCodes } from "@/server/contracts/errors"

export async function POST() {
  return errorResponse(
    {
      code: ErrorCodes.NOT_IMPLEMENTED,
      message: "PayPal 支付不在当前上线范围内",
    },
    501
  )
}
