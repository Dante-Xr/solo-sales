import { NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/adminAuth"
import { requestAdminEmailChange } from "@/server/services/admin-email-change-service"
export async function POST(request: NextRequest) { const admin = await verifyAdminToken(request); const body = await request.json() as { newEmail?: unknown }; if (!admin || typeof body.newEmail !== "string") return NextResponse.json({ message: "invalid" }, { status: 400 }); const operationId = await requestAdminEmailChange({ adminId: admin.id, email: admin.email, newEmail: body.newEmail, ipAddress: request.headers.get("x-forwarded-for") }); return operationId ? NextResponse.json({ operationId }, { status: 202 }) : NextResponse.json({ message: "invalid" }, { status: 400 }) }
