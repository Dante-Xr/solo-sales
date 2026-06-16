import fs from "node:fs"
import path from "node:path"

const repoRoot = path.resolve(__dirname, "../..")

const protectedRoutes: Array<{ file: string; permission: string }> = [
  { file: "src/app/api/bundles/route.ts", permission: "bundles.update" },
  { file: "src/app/api/bundles/[id]/route.ts", permission: "bundles.update" },
  { file: "src/app/api/bundles/[id]/items/route.ts", permission: "bundles.update" },
  { file: "src/app/api/sequences/route.ts", permission: "sequences.update" },
  { file: "src/app/api/sequences/[id]/route.ts", permission: "sequences.update" },
  { file: "src/app/api/sequences/[id]/enroll/route.ts", permission: "sequences.update" },
  { file: "src/app/api/sequences/trigger/route.ts", permission: "sequences.update" },
  { file: "src/app/api/affiliates/route.ts", permission: "affiliates.update" },
  { file: "src/app/api/affiliates/[id]/route.ts", permission: "affiliates.update" },
  { file: "src/app/api/affiliates/[id]/commissions/route.ts", permission: "affiliates.view" },
  { file: "src/app/api/affiliates/[id]/links/route.ts", permission: "affiliates.update" },
  { file: "src/app/api/affiliates/[id]/payouts/route.ts", permission: "affiliates.update" },
  { file: "src/app/api/affiliates/convert/route.ts", permission: "affiliates.update" },
]

describe("operational and financial API auth boundaries", () => {
  it.each(protectedRoutes)("$file requires $permission", ({ file, permission }) => {
    const source = fs.readFileSync(path.join(repoRoot, file), "utf8")

    expect(source).toContain('from "@/server/services/admin-service"')
    expect(source).toContain(`requireAdminPermission(request, "${permission}")`)
  })
})
