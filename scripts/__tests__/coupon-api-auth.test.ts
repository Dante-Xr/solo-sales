import fs from "node:fs"
import path from "node:path"

const repoRoot = path.resolve(__dirname, "../..")

describe("coupon API permission boundaries", () => {
  it.each(["src/app/api/coupons/route.ts", "src/app/api/coupons/[id]/route.ts"])(
    "%s uses coupon update permission for write operations",
    (file) => {
      const source = fs.readFileSync(path.join(repoRoot, file), "utf8")

      expect(source).toContain('from "@/server/services/admin-service"')
      expect(source).toContain('requireAdminPermission(request, "coupons.update")')
      expect(source).not.toContain('from "@/lib/adminAuth"')
      expect(source).not.toContain("verifyAdminToken(request)")
    }
  )
})
