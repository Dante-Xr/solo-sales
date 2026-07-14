import { fireEvent, render, screen } from "@testing-library/react"
import * as mockReact from "react"
import type { HTMLAttributes } from "react"
import { EnhancedProductShowcase } from "./EnhancedProductShowcase"

jest.mock("framer-motion", () => {
  const motionOnlyProps = new Set(["initial", "animate", "transition", "whileInView", "viewport", "layout"])
  const createMotionComponent = (tag: string) => {
    const MotionComponent = mockReact.forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>((props, ref) => {
      const safeProps = Object.fromEntries(
        Object.entries(props).filter(([key]) => !motionOnlyProps.has(key))
      )
      return mockReact.createElement(tag, { ...safeProps, ref }, props.children)
    })
    MotionComponent.displayName = `MockMotion(${tag})`
    return MotionComponent
  }

  return {
    motion: new Proxy({}, { get: (_target, tag: string) => createMotionComponent(tag) }),
  }
})

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: { name?: string }) => values?.name ? `${key}:${values.name}` : key,
}))

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

const addToCart = jest.fn()
jest.mock("@/stores/useCartStore", () => ({
  useCartStore: (selector: (state: { addToCart: typeof addToCart }) => unknown) => selector({ addToCart }),
}))

jest.mock("sonner", () => ({
  toast: { success: jest.fn() },
}))

const products = [
  { id: "1", name: "Tech product", price: 10, originalPrice: 20, image: "/tech.jpg", sales: 4, categoryId: "tech", categoryName: "Technology" },
  { id: "2", name: "Home product", price: 20, originalPrice: 20, image: "/home.jpg", sales: 8, categoryId: "home", categoryName: "Home" },
]

describe("EnhancedProductShowcase", () => {
  beforeEach(() => addToCart.mockClear())

  it("filters by the selected real category and clears the filter when selected again", () => {
    render(
      <EnhancedProductShowcase
        products={products}
        categories={[
          { id: "tech", name: "Technology" },
          { id: "home", name: "Home" },
        ]}
      />
    )

    expect(screen.getByText("Tech product")).toBeInTheDocument()
    expect(screen.getByText("Home product")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "categoryTechnology" }))
    expect(screen.getByText("Tech product")).toBeInTheDocument()
    expect(screen.queryByText("Home product")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "categoryTechnology" }))
    expect(screen.getByText("Home product")).toBeInTheDocument()
  })

  it("adds a selected product to the existing cart state", () => {
    render(<EnhancedProductShowcase products={products} categories={[{ id: "tech", name: "Technology" }]} />)

    fireEvent.click(screen.getAllByRole("button", { name: "addToCart" })[0])
    expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({ id: "1", name: "Tech product" }))
  })
})
