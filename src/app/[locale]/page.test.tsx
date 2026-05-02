/**
 * 修改时间：2026-05-02 21:59:08 +08:00
 * 修改内容：首页 Server Component 测试改为验证带重试商品服务层的数据与降级兜底渲染。
 * 修改模型：gpt-5.5
 */

import { render, screen } from "@testing-library/react"
import Storefront from "./page"

jest.mock("@/server/services/product-service", () => ({
  getFeaturedProducts: jest.fn(),
}))

jest.mock("@/components/storefront/HomeCarouselClient", () => ({
  HomeCarouselClient: ({ products }: { products: unknown[] }) => (
    <div data-testid="carousel">Carousel with {products.length} products</div>
  ),
}))

jest.mock("@/components/storefront/ProductGridClient", () => ({
  ProductGridClient: ({ products }: { products: unknown[] }) => (
    <div data-testid="product-grid">Grid with {products.length} products</div>
  ),
}))

jest.mock("@/components/storefront/StorefrontHeaderClient", () => ({
  StorefrontHeaderClient: () => <header data-testid="header">Header</header>,
}))

jest.mock("@/components/storefront/FeatureSection", () => ({
  FeatureSection: () => <section data-testid="features">Features</section>,
}))

jest.mock("@/components/storefront/StorefrontFooter", () => ({
  StorefrontFooter: () => <footer data-testid="footer">Footer</footer>,
}))

jest.mock("@/components/storefront/ViewportWrapper", () => ({
  ViewportWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock("@/components/storefront/WelcomeModalWrapper", () => ({
  WelcomeModalWrapper: () => <div data-testid="welcome">Welcome</div>,
}))

import { getFeaturedProducts } from "@/server/services/product-service"

const getFeaturedProductsMock = getFeaturedProducts as jest.MockedFunction<typeof getFeaturedProducts>

describe("Storefront (HomePage)", () => {
  const mockProducts = [
    {
      id: "1",
      name: "Product 1",
      description: "Desc 1",
      price: 29.99,
      originalPrice: 49.99,
      image: "/img1.jpg",
      sales: 50,
      stock: 100,
    },
    {
      id: "2",
      name: "Product 2",
      description: "Desc 2",
      price: 39.99,
      originalPrice: 59.99,
      image: "/img2.jpg",
      sales: 30,
      stock: 50,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("应该从商品服务获取商品并渲染", async () => {
    getFeaturedProductsMock.mockResolvedValue({
      products: mockProducts,
      fromCache: false,
    })

    const Page = await Storefront()
    render(Page)

    expect(screen.getByTestId("carousel")).toHaveTextContent("2 products")
    expect(screen.getByTestId("product-grid")).toHaveTextContent("2 products")
  })

  it("应该使用商品服务返回的缓存数据", async () => {
    const cachedProducts = [
      {
        id: "1",
        name: "Cached",
        description: "Cached product",
        price: 10,
        originalPrice: 20,
        image: "/c.jpg",
        sales: 5,
        stock: 10,
      },
    ]
    getFeaturedProductsMock.mockResolvedValue({
      products: cachedProducts,
      fromCache: true,
    })

    const Page = await Storefront()
    render(Page)

    expect(getFeaturedProductsMock).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId("carousel")).toHaveTextContent("1 products")
  })

  it("应该在商品服务失败时渲染兜底商品", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined)
    getFeaturedProductsMock.mockRejectedValue(new Error("database unavailable"))

    try {
      const Page = await Storefront()
      render(Page)

      // 服务层重试耗尽后页面仍应展示兜底商品，避免首页白屏。
      expect(screen.getByTestId("carousel")).toHaveTextContent("6 products")
      expect(screen.getByTestId("product-grid")).toHaveTextContent("6 products")
    } finally {
      errorSpy.mockRestore()
    }
  })

  it("应该渲染页面结构组件", async () => {
    getFeaturedProductsMock.mockResolvedValue({
      products: mockProducts,
      fromCache: false,
    })

    const Page = await Storefront()
    render(Page)

    expect(screen.getByTestId("header")).toBeInTheDocument()
    expect(screen.getByTestId("features")).toBeInTheDocument()
    expect(screen.getByTestId("footer")).toBeInTheDocument()
  })
})
