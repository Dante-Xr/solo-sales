/**
 * Task 11: CSRF Token Hook - 单元测试
 */

import { renderHook } from "@testing-library/react"
import { useCsrfToken } from "../useCsrfToken"

describe("useCsrfToken", () => {
  it("应该返回 token 和 csrfHeaders", () => {
    const { result } = renderHook(() => useCsrfToken())

    expect(result.current.loading).toBe(false)
    expect(result.current.csrfHeaders).toBeDefined()
  })
})
