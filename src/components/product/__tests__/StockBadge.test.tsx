/**
 * Task 9: 紧迫感元素 - StockBadge 单元测试
 */

import { render, screen } from "@testing-library/react"
import { StockBadge } from "../StockBadge"

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: { count?: number }) => {
    const map: Record<string, string> = {
      soldOut: "已售罄",
      onlyLeft: `仅剩 ${params?.count} 件`,
      lowStock: "库存紧张",
    }
    return map[key] || key
  },
}))

describe("StockBadge", () => {
  it("库存 > 50 时不应该渲染", () => {
    const { container } = render(<StockBadge stock={100} />)
    expect(container.firstChild).toBeNull()
  })

  it("库存 = 0 时显示已售罄", () => {
    render(<StockBadge stock={0} />)
    expect(screen.getByText("已售罄")).toBeInTheDocument()
  })

  it("库存 <= 10 时显示仅剩 X 件", () => {
    render(<StockBadge stock={5} />)
    expect(screen.getByText("仅剩 5 件")).toBeInTheDocument()
  })

  it("库存 11-50 时显示库存紧张", () => {
    render(<StockBadge stock={25} />)
    expect(screen.getByText("库存紧张")).toBeInTheDocument()
  })

  it("库存 = 10 时显示仅剩 10 件（边界值）", () => {
    render(<StockBadge stock={10} />)
    expect(screen.getByText("仅剩 10 件")).toBeInTheDocument()
  })

  it("库存 = 50 时显示库存紧张（边界值）", () => {
    render(<StockBadge stock={50} />)
    expect(screen.getByText("库存紧张")).toBeInTheDocument()
  })
})
