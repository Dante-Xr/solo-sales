import { NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/adminAuth"
import { confirmAdminActivation } from "@/server/services/admin-activation-service"
export async function POST(request: NextRequest) { const admin = await verifyAdminToken(request); const body = await request.json() as { operationId?: unknown; otp?: unknown }; if (!admin || admin.role.name !== "super_admin" || typeof body.operationId !== "string" || typeof body.otp !== "string") return NextResponse.json({ message: "invalid" }, { status: 400 }); return await confirmAdminActivation({ operatorId: admin.id, operationId: body.operationId, otp: body.otp }) ? NextResponse.json({ success: true }) : NextResponse.json({ message: "invalid" }, { status: 400 }) }
