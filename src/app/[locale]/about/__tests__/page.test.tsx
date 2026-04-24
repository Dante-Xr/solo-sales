/**
 * Task 7: Footer 空链接修复 - About 页面单元测试
 */

import { render, screen } from "@testing-library/react"
import AboutPage from "../page"

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn(() =>
    Promise.resolve((key: string) => {
      const map: Record<string, string> = {
        "title": "关于我们",
        "intro": "SoloSales 是一家专注于为全球消费者提供优质商品的独立电商平台。",
        "missionTitle": "我们的使命",
        "missionContent": "通过严格的产品筛选和优质的客户服务",
        "valuesTitle": "我们的价值观",
        "value1": "品质至上",
        "value2": "客户为先",
        "value3": "诚信经营",
      }
      return map[key] || key
    })
  ),
}))

describe("AboutPage", () => {
  it("应该渲染关于我们标题", async () => {
    const Page = await AboutPage()
    render(Page)

    expect(screen.getByText("关于我们")).toBeInTheDocument()
  })

  it("应该渲染品牌介绍", async () => {
    const Page = await AboutPage()
    render(Page)

    expect(screen.getByText(/SoloSales 是一家专注于为全球消费者提供优质商品的独立电商平台/)).toBeInTheDocument()
  })

  it("应该渲染使命和价值观", async () => {
    const Page = await AboutPage()
    render(Page)

    expect(screen.getByText("我们的使命")).toBeInTheDocument()
    expect(screen.getByText("我们的价值观")).toBeInTheDocument()
    expect(screen.getByText("品质至上")).toBeInTheDocument()
  })
})
