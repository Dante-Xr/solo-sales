import { existsSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { join } from "node:path"

describe("v1.6 secret audit gate", () => {
  const root = process.cwd()
  const scriptPath = join(root, "scripts", "secret-audit.mjs")

  it("provides an executable local secret leakage gate", () => {
    expect(existsSync(scriptPath)).toBe(true)
  })

  it("passes when no tracked env files or hard-coded production secrets are found", () => {
    const output = execFileSync(process.execPath, [scriptPath], {
      cwd: root,
      encoding: "utf8",
    })

    expect(output).toContain("Secret audit passed")
    expect(output).toContain("trackedEnvFiles=0")
    expect(output).toContain("historyEnvFiles=0")
  })
})
