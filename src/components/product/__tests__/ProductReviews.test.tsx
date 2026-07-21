/**
 * Task 4: 商品评价系统 - 单元测试
 */

import { render, screen, waitFor } from "@testing-library/react"
import { ProductReviews } from "../ProductReviews"

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      "title": "用户评价",
      "writeReview": "撰写评价",
      "loginRequired": "请先登录后再评价",
      "goLogin": "去登录",
      "rating": "评分",
      "selectRating": "请选择评分",
      "submitReview": "提交评价",
      "submitting": "提交中...",
      "submitSuccess": "评价提交成功！",
      "submitFailed": "提交失败，请稍后重试",
      "cancel": "取消",
      "stars": "星",
    }
    return map[key] || key
  },
}))

jest.mock("@/hooks/useCsrfToken", () => ({
  useCsrfToken: () => ({
    csrfHeaders: { "x-csrf-token": "test-token" },
  }),
}))

describe("ProductReviews", () => {
  const mockReviewsResponse = {
    success: true,
    data: {
      stats: {
        averageRating: 4.5,
        totalReviews: 10,
        ratingDistribution: { 5: 5, 4: 3, 3: 2 },
      },
    },
  }

  beforeEach(() => {
    jest.resetAllMocks()
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url === "/api/auth/get-session") {
        return Promise.resolve({
          json: () => Promise.resolve({ user: null }),
        })
      }
      return Promise.resolve({
        json: () => Promise.resolve(mockReviewsResponse),
      })
    })
  })

  it("应该渲染评价标题", async () => {
    render(<ProductReviews productId="product-1" />)

    await waitFor(() => {
      expect(screen.getByText("用户评价")).toBeInTheDocument()
    })
  })

  it("应该渲染撰写评价按钮", async () => {
    render(<ProductReviews productId="product-1" />)

    await waitFor(() => {
      expect(screen.getByText("撰写评价")).toBeInTheDocument()
    })
  })
})
