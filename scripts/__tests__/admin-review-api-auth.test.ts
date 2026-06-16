import fs from "node:fs"
import path from "node:path"

const repoRoot = path.resolve(__dirname, "../..")

describe("admin review API permission boundaries", () => {
  it("uses review permissions instead of a bare admin session check", () => {
    const source = fs.readFileSync(
      path.join(repoRoot, "src/app/api/admin/reviews/route.ts"),
      "utf8"
    )

    expect(source).toContain('from "@/server/services/admin-service"')
    expect(source).toContain('requireAdminPermission(request, "reviews.view")')
    expect(source).toContain('requireAdminPermission(request, "reviews.update")')
    expect(source).not.toContain('from "@/lib/adminAuth"')
    expect(source).not.toContain("verifyAdminToken(request)")
  })
})
