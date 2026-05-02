/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将旧错误模块改为服务端统一错误契约的兼容导出入口。
 * 修改模型：gpt-5.5
 */
export {
  AppError,
  ErrorCodes,
  StatusCodeMap,
  badRequest,
  conflict,
  forbidden,
  internalError,
  notFound,
  serviceUnavailable,
  unauthorized,
  unprocessable,
  validationError,
} from "@/server/contracts/errors"

export type { ErrorCode } from "@/server/contracts/errors"
