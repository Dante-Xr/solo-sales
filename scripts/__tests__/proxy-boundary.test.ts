import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

describe("Next.js proxy boundary", () => {
  const root = process.cwd()

  it("uses a single Next.js 16 proxy file instead of legacy middleware", () => {
    expect(existsSync(join(root, "src", "proxy.ts"))).toBe(true)
    expect(existsSync(join(root, "middleware.ts"))).toBe(false)
  })

  it("src/proxy.ts contains export function proxy or export const config", () => {
    const proxyContent = readFileSync(join(root, "src", "proxy.ts"), "utf8")
    const hasNamedExport = /export (function proxy|const config)/.test(proxyContent)
    expect(hasNamedExport).toBe(true)
  })
})
