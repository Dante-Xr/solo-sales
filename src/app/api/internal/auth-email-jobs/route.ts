import { NextRequest, NextResponse } from "next/server"
import { dispatchAuthEmailJobs } from "@/server/services/auth-email-job-service"
import { runAuthEmailWorker } from "@/server/services/auth-email-worker-service"

export async function POST(request: NextRequest) {
  const expected = process.env.AUTH_EMAIL_WORKER_TOKEN
  const authorization = request.headers.get("authorization")
  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  const result = await runAuthEmailWorker({ trigger: "HTTP", dispatch: dispatchAuthEmailJobs })
  return NextResponse.json(result)
}
