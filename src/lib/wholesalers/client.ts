/**
 * ============================================
 * 批发网站 API 对接 - 客户端基类 (Task 1.6)
 * ============================================
 * 功能说明：
 *   - 实现批发商 API 客户端的基类
 *   - 提供通用的请求方法、重试机制、错误处理
 * ============================================
 */

import type {
  WholesalerClient,
  WholesalerConfig,
  WholesalerProduct,
  GetProductsParams,
} from "./types"

/**
 * 批发商 API 请求异常
 */
export class WholesalerApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message)
    this.name = "WholesalerApiError"
  }
}

/**
 * 批发商 API 响应异常
 */
export class WholesalerResponseError extends Error {
  constructor(
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = "WholesalerResponseError"
  }
}

/**
 * 批发商客户端基类
 * 提供通用的请求逻辑、重试机制、错误处理
 */
export abstract class BaseWholesalerClient implements WholesalerClient {
  protected config: WholesalerConfig

  constructor(config: WholesalerConfig) {
    this.config = config
  }

  /**
   * 获取批发商名称
   */
  abstract getName(): string

  /**
   * 测试 API 连接
   */
  abstract testConnection(): Promise<boolean>

  /**
   * 获取商品列表
   */
  abstract getProducts(params?: GetProductsParams): Promise<WholesalerProduct[]>

  /**
   * 获取单个商品详情
   */
  abstract getProductById(id: string): Promise<WholesalerProduct | null>

  /**
   * 通用 GET 请求方法
   * 包含重试机制和错误处理
   */
  protected async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(endpoint, this.config.baseUrl)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value)
        }
      })
    }

    return this.request<T>(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    })
  }

  /**
   * 通用 POST 请求方法
   */
  protected async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const url = new URL(endpoint, this.config.baseUrl)

    return this.request<T>(url.toString(), {
      method: "POST",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * 执行请求（带重试机制）
   */
  protected async request<T>(
    url: string,
    options: RequestInit,
    retryCount = 0
  ): Promise<T> {
    const { timeout = 30000, retryTimes = 3 } = this.config

    try {
      // 创建超时控制器
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // 处理 HTTP 错误状态
      if (!response.ok) {
        const errorBody = await this.parseErrorResponse(response)
        throw new WholesalerApiError(
          errorBody.message || `HTTP ${response.status}`,
          response.status,
          errorBody.code
        )
      }

      // 解析响应
      const data = await response.json()

      // 检查业务错误
      if (data.success === false || data.error) {
        throw new WholesalerResponseError(data.message || data.error, data.errors)
      }

      return data as T
    } catch (error) {
      // 判断是否是可重试的错误
      const isRetryable =
        error instanceof WholesalerApiError &&
        error.statusCode !== undefined &&
        error.statusCode >= 500

      // 如果可以重试且未超过重试次数
      if (isRetryable && retryCount < retryTimes) {
        // 指数退避等待时间
        const waitTime = Math.pow(2, retryCount) * 1000
        await this.sleep(waitTime)

        return this.request<T>(url, options, retryCount + 1)
      }

      // 重新抛出错误
      if (error instanceof WholesalerApiError || error instanceof WholesalerResponseError) {
        throw error
      }

      // 处理超时错误
      if (error instanceof Error && error.name === "AbortError") {
        throw new WholesalerApiError("请求超时", 408, "TIMEOUT")
      }

      throw error
    }
  }

  /**
   * 获取请求头
   */
  protected getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.config.apiKey,
      ...(this.config.apiSecret && {
        "X-API-Secret": this.config.apiSecret,
      }),
    }
  }

  /**
   * 解析错误响应
   */
  protected async parseErrorResponse(
    response: Response
  ): Promise<{ message?: string; code?: string }> {
    try {
      const contentType = response.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        return await response.json()
      }
      return { message: await response.text() }
    } catch {
      return { message: `HTTP ${response.status}` }
    }
  }

  /**
   * 等待指定时间
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}