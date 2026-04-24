/**
 * Task 8: 商品详情页 - VariantSelector 单元测试
 */

import { render, screen, fireEvent } from "@testing-library/react"
import { VariantSelector } from "../VariantSelector"

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      color: "颜色",
      size: "尺寸",
    }
    return map[key] || key
  },
}))

describe("VariantSelector", () => {
  const mockOnSelect = jest.fn()

  beforeEach(() => {
    mockOnSelect.mockClear()
  })

  it("应该渲染颜色选择器", () => {
    render(<VariantSelector selectedVariant={{}} onSelect={mockOnSelect} />)

    expect(screen.getByText(/颜色/)).toBeInTheDocument()
  })

  it("应该渲染尺寸选择器", () => {
    render(<VariantSelector selectedVariant={{}} onSelect={mockOnSelect} />)

    expect(screen.getByText(/尺寸/)).toBeInTheDocument()
  })

  it("选择颜色应该触发 onSelect", () => {
    render(<VariantSelector selectedVariant={{}} onSelect={mockOnSelect} />)

    const colorButtons = screen.getAllByTitle(/Black|White|Navy|Red/)
    fireEvent.click(colorButtons[0])

    expect(mockOnSelect).toHaveBeenCalled()
  })

  it("已选中的颜色应该有选中状态", () => {
    render(
      <VariantSelector
        selectedVariant={{ color: "black", size: "m" }}
        onSelect={mockOnSelect}
      />
    )

    const buttons = screen.getAllByRole("button")
    const selectedButton = buttons.find((btn) =>
      btn.className.includes("ring-2") || btn.className.includes("bg-primary")
    )
    expect(selectedButton).toBeDefined()
  })

  it("缺货选项应该禁用", () => {
    render(<VariantSelector selectedVariant={{}} onSelect={mockOnSelect} />)

    const redButton = screen.getByTitle("Red")
    expect(redButton).toBeDisabled()
  })
})
