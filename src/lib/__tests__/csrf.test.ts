/**
 * Task 11: CSRF 防护 - 单元测试
 */

import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "../csrf"

describe("CSRF 防护工具", () => {
  describe("常量导出", () => {
    it("应该导出正确的 cookie 名称", () => {
      expect(CSRF_COOKIE_NAME).toBe("solo_csrf_token")
    })

    it("应该导出正确的 header 名称", () => {
      expect(CSRF_HEADER_NAME).toBe("x-csrf-token")
    })
  })
})
