jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}))

jest.mock("@/server/services/auth-email-job-service", () => ({
  dispatchAuthEmailJobs: jest.fn(),
}))

jest.mock("@/server/services/auth-email-worker-service", () => ({
  runAuthEmailWorker: jest.fn(),
}))

import { POST } from "../route"

const { dispatchAuthEmailJobs } = jest.requireMock("@/server/services/auth-email-job-service") as {
  dispatchAuthEmailJobs: jest.Mock
}
const { runAuthEmailWorker } = jest.requireMock("@/server/services/auth-email-worker-service") as {
  runAuthEmailWorker: jest.Mock
}

function request(authorization?: string) {
  return {
    headers: {
      get: (name: string) => (name === "authorization" ? authorization ?? null : null),
    },
  }
}

describe("POST /api/internal/auth-email-jobs/scheduled", () => {
  const originalToken = process.env.AUTH_EMAIL_WORKER_TOKEN

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.AUTH_EMAIL_WORKER_TOKEN = "worker-token"
  })

  afterAll(() => {
    process.env.AUTH_EMAIL_WORKER_TOKEN = originalToken
  })

  it("hides the endpoint and does not run the worker without a valid bearer token", async () => {
    const response = await POST(request("Bearer incorrect") as never)

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: "not found" })
    expect(runAuthEmailWorker).not.toHaveBeenCalled()
  })

  it("runs the worker as a scheduled trigger for an authorized external timer", async () => {
    runAuthEmailWorker.mockResolvedValue({ status: "SUCCEEDED", processed: 1, delivered: 1, deadLettered: 0 })

    const response = await POST(request("Bearer worker-token") as never)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ status: "SUCCEEDED", processed: 1, delivered: 1, deadLettered: 0 })
    expect(runAuthEmailWorker).toHaveBeenCalledWith({
      trigger: "SCHEDULED",
      dispatch: dispatchAuthEmailJobs,
    })
  })
})
