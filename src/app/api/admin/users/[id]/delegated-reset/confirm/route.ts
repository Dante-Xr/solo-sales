import { NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/adminAuth"
import { confirmDelegatedAdminReset } from "@/server/services/admin-delegated-reset-service"
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdminToken(request)
  const body = await request.json() as { operationId?: unknown; otp?: unknown }
  if (!admin || admin.role.name !== "super_admin" || typeof body.operationId !== "string" || typeof body.otp !== "string") return NextResponse.json({ message: "invalid" }, { status: 400 })
  const { id } = await params
  const success = await confirmDelegatedAdminReset({ operatorId: admin.id, targetAdminId: id, operationId: body.operationId, otp: body.otp, ipAddress: request.headers.get("x-forwarded-for") })
  return success ? NextResponse.json({ success: true }) : NextResponse.json({ message: "invalid" }, { status: 400 })
}
