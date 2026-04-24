/**
 * Task 7: Footer 空链接修复 - Privacy 页面单元测试
 */

import { render, screen } from "@testing-library/react"
import PrivacyPage from "../page"

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn(() =>
    Promise.resolve((key: string) => {
      const map: Record<string, string> = {
        "title": "隐私政策",
        "lastUpdated": "最后更新：2026年4月",
        "collectTitle": "我们收集的信息",
        "collectContent": "我们收集您在使用我们服务时提供的信息",
        "useTitle": "信息使用方式",
        "useContent": "我们使用您的信息来处理订单",
        "cookiesTitle": "Cookie 政策",
        "cookiesContent": "我们使用 Cookie 来改善您的浏览体验",
        "rightsTitle": "您的权利",
        "rightsContent": "根据 GDPR 和 CCPA 法规",
        "contactTitle": "联系我们",
        "contactContent": "如果您对我们的隐私政策有任何疑问",
      }
      return map[key] || key
    })
  ),
}))

describe("PrivacyPage", () => {
  it("应该渲染隐私政策标题", async () => {
    const Page = await PrivacyPage()
    render(Page)

    expect(screen.getByText("隐私政策")).toBeInTheDocument()
  })

  it("应该渲染最后更新时间", async () => {
    const Page = await PrivacyPage()
    render(Page)

    expect(screen.getByText("最后更新：2026年4月")).toBeInTheDocument()
  })

  it("应该包含 GDPR/CCPA 合规内容", async () => {
    const Page = await PrivacyPage()
    render(Page)

    expect(screen.getByText("您的权利")).toBeInTheDocument()
    expect(screen.getByText(/GDPR 和 CCPA/)).toBeInTheDocument()
  })

  it("应该包含所有隐私政策章节", async () => {
    const Page = await PrivacyPage()
    render(Page)

    expect(screen.getByText("我们收集的信息")).toBeInTheDocument()
    expect(screen.getByText("信息使用方式")).toBeInTheDocument()
    expect(screen.getByText("Cookie 政策")).toBeInTheDocument()
    expect(screen.getByText("联系我们")).toBeInTheDocument()
  })
})
