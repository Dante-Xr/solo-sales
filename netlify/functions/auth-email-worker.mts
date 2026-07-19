import type { Config } from "@netlify/functions"
import { dispatchAuthEmailJobs } from "../../src/server/services/auth-email-job-service"
import { runAuthEmailWorker } from "../../src/server/services/auth-email-worker-service"

export default async () => {
  try {
    await runAuthEmailWorker({ trigger: "SCHEDULED", dispatch: dispatchAuthEmailJobs })
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("Authentication email worker failed", error)
    return new Response(null, { status: 500 })
  }
}

export const config: Config = { schedule: "* * * * *" }
