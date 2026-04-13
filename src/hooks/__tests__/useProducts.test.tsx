import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"
import { useProducts, useProduct } from "../useProducts"

const mockProduct = {
  id: "prod_1",
  name: "Test Product",
  price: 29.99,
  originalPrice: 49.99,
  image: "https://example.com/image.jpg",
  sales: 100,
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

describe("useProducts", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("should fetch products successfully", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockProduct]),
    })

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockProduct])
  })

  it("should handle fetch error", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Server error" }),
    })

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe("useProduct", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("should not fetch when id is empty", () => {
    const { result } = renderHook(() => useProduct(""), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe("idle")
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("should fetch a single product by id", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProduct),
    })

    const { result } = renderHook(() => useProduct("prod_1"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockProduct)
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/products/prod_1",
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    )
  })
})
