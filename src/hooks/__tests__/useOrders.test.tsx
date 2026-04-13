import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"
import { useOrders, useOrder } from "../useOrders"

const mockOrder = {
  id: "order_1",
  totalAmount: 59.98,
  status: "PAID",
  createdAt: "2025-01-01T00:00:00Z",
  items: [
    {
      id: "item_1",
      quantity: 2,
      price: 29.99,
      product: { id: "prod_1", name: "Test Product", images: [] },
    },
  ],
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe("useOrders", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("should fetch orders successfully", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockOrder]),
    })

    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockOrder])
  })

  it("should handle fetch error", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Unauthorized" }),
    })

    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe("useOrder", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("should not fetch when id is empty", () => {
    const { result } = renderHook(() => useOrder(""), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe("idle")
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("should fetch a single order by id", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockOrder),
    })

    const { result } = renderHook(() => useOrder("order_1"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockOrder)
  })
})
