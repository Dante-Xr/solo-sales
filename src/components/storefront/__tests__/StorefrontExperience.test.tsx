import { fireEvent, render, screen } from "@testing-library/react"
import type { ComponentProps, ElementType } from "react"
import * as React from "react"
import { StorefrontExperience } from "../StorefrontExperience"
import type { ProductItem } from "../HomeCarouselClient"

jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage(props: ComponentProps<"img">) {
    return <img alt={props.alt ?? ""} {...props} />
  },
}))

jest.mock("framer-motion", () => {
  const createMotion = (element: ElementType) => {
    const MockMotion = ({ children, ...props }: { children?: React.ReactNode }) => {
    const { animate, initial, transition, variants, whileHover, whileTap, ...domProps } = props as Record<string, unknown>
    void animate
    void initial
    void transition
    void variants
    void whileHover
    void whileTap
    return React.createElement(element, domProps, children)
  }
    MockMotion.displayName = "MockMotion"
    return MockMotion
  }

  return {
    motion: new Proxy({}, { get: (_target, key) => createMotion(key as ElementType) }),
  }
})

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => ({
    emptyCategory: "该分类暂时没有商品",
  }[key] ?? key),
}))

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock("@/stores/useCartStore", () => ({
  useCartStore: (selector: (state: { addToCart: jest.Mock }) => unknown) => selector({ addToCart: jest.fn() }),
}))

jest.mock("sonner", () => ({ toast: { success: jest.fn() } }))

const products: ProductItem[] = [
  { id: "headphones", name: "无线耳机", price: 29.99, originalPrice: 49.99, image: "/headphones.jpg", sales: 12, stock: 3, categoryId: "tech", categoryName: "数码" },
  { id: "lamp", name: "智能台灯", price: 39.99, originalPrice: 59.99, image: "/lamp.jpg", sales: 8, stock: 5, categoryId: "home", categoryName: "家居" },
]

describe("StorefrontExperience", () => {
  it("filters products and clears the filter by clicking the active category", () => {
    render(<StorefrontExperience products={products} categories={[{ id: "tech", name: "数码" }, { id: "home", name: "家居" }]} />)

    expect(screen.getByText("无线耳机")).toBeInTheDocument()
    expect(screen.getByText("智能台灯")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /数码/ }))
    expect(screen.getByText("无线耳机")).toBeInTheDocument()
    expect(screen.queryByText("智能台灯")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /数码/ }))
    expect(screen.getByText("智能台灯")).toBeInTheDocument()
  })

  it("shows the empty state when a selected category has no matching product", () => {
    render(<StorefrontExperience products={products} categories={[{ id: "empty", name: "空分类" }]} />)

    fireEvent.click(screen.getByRole("button", { name: /空分类/ }))
    expect(screen.getByText("该分类暂时没有商品")).toBeInTheDocument()
  })
})
