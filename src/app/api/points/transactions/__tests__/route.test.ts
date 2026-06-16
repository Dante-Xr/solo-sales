import { GET } from "../route"

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      headers: { set: jest.fn() },
      json: async () => body,
    }),
  },
  NextRequest: class {},
}))

jest.mock("@/server/auth/session", () => ({
  getServerSessionUser: jest.fn(),
}))

jest.mock("@/server/services/promotion-service", () => ({
  listPointTransactions: jest.fn(),
  parsePointTransactionsQuery: jest.fn(),
}))

const { getServerSessionUser } = jest.requireMock("@/server/auth/session") as {
  getServerSessionUser: jest.Mock
}
const { listPointTransactions, parsePointTransactionsQuery } = jest.requireMock(
  "@/server/services/promotion-service"
) as {
  listPointTransactions: jest.Mock
  parsePointTransactionsQuery: jest.Mock
}

describe("/api/points/transactions route", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("rejects anonymous transaction reads before parsing the query", async () => {
    getServerSessionUser.mockResolvedValue(null)
    const request = {
      nextUrl: { searchParams: new URLSearchParams("userId=user_1") },
    }

    const response = await GET(request as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(parsePointTransactionsQuery).not.toHaveBeenCalled()
    expect(listPointTransactions).not.toHaveBeenCalled()
  })

  it("rejects transaction IDOR before loading transactions", async () => {
    getServerSessionUser.mockResolvedValue({ id: "user_1" })
    parsePointTransactionsQuery.mockReturnValue({ userId: "user_2", page: 1, pageSize: 20 })
    const request = {
      nextUrl: { searchParams: new URLSearchParams("userId=user_2") },
    }

    const response = await GET(request as never)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.success).toBe(false)
    expect(listPointTransactions).not.toHaveBeenCalled()
  })
})
