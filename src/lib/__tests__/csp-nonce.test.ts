/**
 * Task 10: CSP Nonce-based 优化 - 单元测试
 */

import { generateNonce, getCspHeaders } from "../csp-nonce"

describe("CSP Nonce 工具", () => {
  describe("generateNonce", () => {
    it("应该生成 32 字符长度的 nonce", () => {
      const nonce = generateNonce()
      expect(nonce).toHaveLength(32)
    })

    it("应该生成不同的 nonce", () => {
      const nonce1 = generateNonce()
      const nonce2 = generateNonce()
      expect(nonce1).not.toBe(nonce2)
    })

    it("应该只包含十六进制字符", () => {
      const nonce = generateNonce()
      expect(nonce).toMatch(/^[a-f0-9]{32}$/)
    })
  })

  describe("getCspHeaders", () => {
    it("应该包含正确的 CSP 指令", () => {
      const nonce = "abc123"
      const csp = getCspHeaders(nonce)

      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain(`script-src 'self' 'nonce-${nonce}' https://js.stripe.com`)
      expect(csp).toContain("img-src 'self' data: https://images.unsplash.com https://picsum.photos")
      expect(csp).toContain("connect-src 'self' https://api.stripe.com")
      expect(csp).toContain("frame-src 'self' https://js.stripe.com https://hooks.stripe.com")
    })

    it("script-src 不应该包含 unsafe-inline", () => {
      const csp = getCspHeaders("test123")
      const scriptSrcMatch = csp.match(/script-src[^;]+/)
      expect(scriptSrcMatch).toBeDefined()
      expect(scriptSrcMatch![0]).not.toContain("'unsafe-inline'")
    })

    it("应该正确注入 nonce", () => {
      const nonce = "testnonce123"
      const csp = getCspHeaders(nonce)
      expect(csp).toContain(`'nonce-${nonce}'`)
    })
  })
})
