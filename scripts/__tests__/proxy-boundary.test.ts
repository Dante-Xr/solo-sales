import { existsSync } from "node:fs"
import { join } from "node:path"

describe("Next.js proxy boundary", () => {
  const root = process.cwd()

  it("uses a single Next.js 16 proxy file instead of legacy middleware", () => {
    expect(existsSync(join(root, "src", "proxy.ts"))).toBe(true)
    expect(existsSync(join(root, "middleware.ts"))).toBe(false)
  })
})
