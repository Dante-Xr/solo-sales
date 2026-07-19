import { NextRequest, NextResponse } from "next/server"
import { processAuthEmailJobs } from "@/server/services/auth-email-job-service"

export async function POST(request: NextRequest) {
  const expected = process.env.AUTH_EMAIL_WORKER_TOKEN
  const authorization = request.headers.get("authorization")
  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  await processAuthEmailJobs()
  return NextResponse.json({ processed: true })
}
