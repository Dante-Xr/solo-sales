/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：补充 apiFetch 对统一响应 success/data/error 的解包和错误消息测试。
 * 修改模型：gpt-5.5
 */
import { ApiError, apiFetch } from "../api-client"

beforeEach(() => {
  jest.resetAllMocks()
})

describe("ApiError", () => {
  it("should create an ApiError with status and message", () => {
    const error = new ApiError(404, "Not Found")
    expect(error.status).toBe(404)
    expect(error.message).toBe("Not Found")
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ApiError)
  })

  it("should create an ApiError with data", () => {
    const data = { details: "Invalid input" }
    const error = new ApiError(400, "Bad Request", data)
    expect(error.data).toEqual(data)
  })
})

describe("apiFetch", () => {
  it("should fetch and return JSON data on success", async () => {
    const mockData = { id: "1", name: "Test Product" }
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    const result = await apiFetch("/api/products/1")
    expect(result).toEqual(mockData)
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/products/1",
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    )
  })

  it("should throw ApiError on non-ok response with error message", async () => {
    const errorData = { error: "Product not found" }
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve(errorData),
    })

    try {
      await apiFetch("/api/products/999")
      fail("Expected ApiError to be thrown")
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).status).toBe(404)
      expect((error as ApiError).message).toBe("Product not found")
    }
  })

  it("should unwrap standard API success responses", async () => {
    const mockData = { id: "1", name: "Test Product" }
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockData }),
    })

    const result = await apiFetch("/api/products/1")
    expect(result).toEqual(mockData)
  })

  it("should read standard API error message", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: () =>
        Promise.resolve({
          success: false,
          error: { code: "INSUFFICIENT_STOCK", message: "库存不足" },
        }),
    })

    await expect(apiFetch("/api/orders")).rejects.toMatchObject({
      status: 422,
      message: "库存不足",
    })
  })

  it("should throw ApiError with status code when response has no error field", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    })

    try {
      await apiFetch("/api/test")
      fail("Expected ApiError to be thrown")
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).message).toBe("API Error: 500")
    }
  })

  it("should throw ApiError when json parsing fails", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error("Invalid JSON")),
    })

    try {
      await apiFetch("/api/test")
      fail("Expected ApiError to be thrown")
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).message).toBe("API Error: 502")
    }
  })

  it("should pass through custom options", async () => {
    const mockData = { success: true }
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    await apiFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({ items: [] }),
    })

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/orders",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ items: [] }),
      })
    )
  })
})
