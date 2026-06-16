/**
 * Task 7: Footer 空链接修复 - FAQ 页面单元测试
 */

import { render, screen } from "@testing-library/react"
import FAQPage from "../page"

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn(() =>
    Promise.resolve((key: string) => {
      const map: Record<string, string> = {
        "title": "常见问题",
        "q1": "如何追踪我的订单？",
        "a1": "下单后，您可以在「我的订单」页面查看订单状态",
        "q2": "支持哪些支付方式？",
        "a2": "我们支持信用卡等支付方式，付款由 Stripe 加密处理",
        "q3": "退换货政策是什么？",
        "a3": "我们提供 7 天无理由退货服务",
        "q4": "配送需要多长时间？",
        "a4": "国内订单通常 3-5 个工作日送达",
        "q5": "如何联系客服？",
        "a5": "您可以通过页面底部的邮箱联系我们",
      }
      return map[key] || key
    })
  ),
}))

describe("FAQPage", () => {
  it("应该渲染 FAQ 标题", async () => {
    const Page = await FAQPage()
    render(Page)

    expect(screen.getByText("常见问题")).toBeInTheDocument()
  })

  it("应该渲染至少 5 个问题和答案", async () => {
    const Page = await FAQPage()
    render(Page)

    expect(screen.getByText("如何追踪我的订单？")).toBeInTheDocument()
    expect(screen.getByText("支持哪些支付方式？")).toBeInTheDocument()
    expect(screen.getByText("退换货政策是什么？")).toBeInTheDocument()
    expect(screen.getByText("配送需要多长时间？")).toBeInTheDocument()
    expect(screen.getByText("如何联系客服？")).toBeInTheDocument()
  })

  it("应该渲染对应的答案", async () => {
    const Page = await FAQPage()
    render(Page)

    expect(screen.getByText(/下单后，您可以在「我的订单」页面查看订单状态/)).toBeInTheDocument()
    expect(screen.getByText(/我们提供 7 天无理由退货服务/)).toBeInTheDocument()
  })
})
