import { NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken(request)
  if (!admin || admin.role.name !== "super_admin") return NextResponse.json({ error: "not found" }, { status: 404 })

  const scope = request.nextUrl.searchParams.get("scope")
  const result = request.nextUrl.searchParams.get("result")
  const take = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit") || 50), 1), 100)
  const records = await prisma.accountRecoveryAudit.findMany({
    where: {
      ...(scope ? { scope: scope as never } : {}),
      ...(result ? { result: result as never } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, scope: true, result: true, failureCode: true, accountFingerprint: true, ipFingerprint: true, jobId: true, createdAt: true },
  })
  return NextResponse.json({ records: records.map((record) => ({
    ...record,
    accountFingerprint: record.accountFingerprint.slice(0, 12),
    ipFingerprint: record.ipFingerprint?.slice(0, 12) ?? null,
  })) })
}
