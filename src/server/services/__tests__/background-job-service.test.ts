/**
 * 修改时间：2026-06-05 10:11:44 +08:00
 * 修改内容：新增后台任务服务测试，覆盖重任务边界定义、入队、可恢复查询和失败退避策略。
 * 修改模型：gpt-5.5
 */
import {
  buildRetryAvailableAt,
  enqueueBackgroundJob,
  failBackgroundJob,
  getBackgroundJobDefinitions,
  listRunnableBackgroundJobs,
} from "../background-job-service"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    backgroundJob: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}))

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    backgroundJob: {
      create: jest.Mock
      findMany: jest.Mock
      update: jest.Mock
    }
  }
}

describe("background-job-service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("defines the Phase 5 synchronous and asynchronous boundaries", () => {
    const definitions = getBackgroundJobDefinitions()

    expect(definitions.WHOLESALER_IMPORT.asynchronousBoundary).toContain("批发商连接")
    expect(definitions.ANALYTICS_REFRESH.resourceIsolation).toContain("前台")
    expect(definitions.STRIPE_WEBHOOK_POST_PROCESS.synchronousBoundary).toContain("快速返回")
    expect(definitions.NOTIFICATION_DISPATCH.asynchronousBoundary).toContain("通知")
  })

  it("enqueues a background job with bounded retries", async () => {
    prisma.backgroundJob.create.mockResolvedValue({
      id: "job_1",
      type: "WHOLESALER_IMPORT",
      status: "QUEUED",
    })

    const job = await enqueueBackgroundJob({
      type: "WHOLESALER_IMPORT",
      payload: { wholesaler: "1866" },
    })

    expect(prisma.backgroundJob.create).toHaveBeenCalledWith({
      data: {
        type: "WHOLESALER_IMPORT",
        payload: { wholesaler: "1866" },
        maxAttempts: 3,
        availableAt: undefined,
      },
    })
    expect(job.id).toBe("job_1")
  })

  it("filters runnable jobs to recoverable attempts only", async () => {
    const now = new Date("2026-06-05T02:00:00.000Z")
    prisma.backgroundJob.findMany.mockResolvedValue([
      { id: "recoverable", attempts: 1, maxAttempts: 3 },
      { id: "exhausted", attempts: 3, maxAttempts: 3 },
    ])

    const jobs = await listRunnableBackgroundJobs({ now, limit: 10 })

    expect(prisma.backgroundJob.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          availableAt: { lte: now },
          OR: [
            { status: { in: ["QUEUED", "FAILED"] } },
            { status: "RUNNING", lockExpiresAt: { lte: now } },
          ],
        },
        take: 10,
      })
    )
    expect(jobs).toEqual([{ id: "recoverable", attempts: 1, maxAttempts: 3 }])
  })

  it("records retryable failures with exponential backoff", async () => {
    const now = new Date("2026-06-05T02:00:00.000Z")
    prisma.backgroundJob.update.mockResolvedValue({ id: "job_2", status: "FAILED" })

    await failBackgroundJob({ id: "job_2", attempts: 1, maxAttempts: 3 }, new Error("timeout"), now)

    expect(prisma.backgroundJob.update).toHaveBeenCalledWith({
      where: { id: "job_2" },
      data: expect.objectContaining({
        status: "FAILED",
        attempts: 2,
        lastError: "timeout",
        availableAt: new Date("2026-06-05T02:01:00.000Z"),
        lockedAt: null,
      }),
    })
  })

  it("moves exhausted failures to dead letter", async () => {
    const now = new Date("2026-06-05T02:00:00.000Z")
    prisma.backgroundJob.update.mockResolvedValue({ id: "job_3", status: "DEAD_LETTER" })

    await failBackgroundJob({ id: "job_3", attempts: 2, maxAttempts: 3 }, "final failure", now)

    expect(prisma.backgroundJob.update).toHaveBeenCalledWith({
      where: { id: "job_3" },
      data: expect.objectContaining({
        status: "DEAD_LETTER",
        attempts: 3,
        lastError: "final failure",
        availableAt: now,
      }),
    })
  })

  it("builds deterministic retry times for worker tests and runbooks", () => {
    const now = new Date("2026-06-05T02:00:00.000Z")

    expect(buildRetryAvailableAt(1, now)).toEqual(new Date("2026-06-05T02:00:30.000Z"))
    expect(buildRetryAvailableAt(3, now)).toEqual(new Date("2026-06-05T02:02:00.000Z"))
  })
})
