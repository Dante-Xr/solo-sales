/**
 * Task 3: 首页 Server Component - 单元测试
 */

import { render, screen } from "@testing-library/react"
import Storefront from "./page"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
    },
  },
}))

jest.mock("@/lib/cache", () => ({
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
  CACHE_KEYS: {
    FEATURED_PRODUCTS: "featured_products",
  },
  CACHE_TTL: {
    FEATURED_PRODUCTS: 3600,
  },
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

import { prisma } from "@/lib/prisma"
import { cacheGet } from "@/lib/cache"

describe("Storefront (HomePage)", () => {
  const mockProducts = [
    {
      id: "1",
      name: "Product 1",
      description: "Desc 1",
      price: { toNumber: () => 29.99 },
      stock: 100,
      images: ["/img1.jpg"],
      isPublished: true,
      _count: { orderItems: 50 },
    },
    {
      id: "2",
      name: "Product 2",
      description: "Desc 2",
      price: { toNumber: () => 39.99 },
      stock: 50,
      images: ["/img2.jpg"],
      isPublished: true,
      _count: { orderItems: 30 },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("应该从数据库获取商品并渲染", async () => {
    ;(cacheGet as jest.Mock).mockResolvedValue(null)
    ;(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)

    const Page = await Storefront()
    render(Page)

    expect(screen.getByTestId("carousel")).toHaveTextContent("2 products")
    expect(screen.getByTestId("product-grid")).toHaveTextContent("2 products")
  })

  it("应该使用缓存数据", async () => {
    const cachedProducts = [
      { id: "1", name: "Cached", price: 10, originalPrice: 20, image: "/c.jpg", sales: 5, stock: 10 },
    ]
    ;(cacheGet as jest.Mock).mockResolvedValue(cachedProducts)

    const Page = await Storefront()
    render(Page)

    expect(prisma.product.findMany).not.toHaveBeenCalled()
    expect(screen.getByTestId("carousel")).toHaveTextContent("1 products")
  })

  it("应该渲染页面结构组件", async () => {
    ;(cacheGet as jest.Mock).mockResolvedValue(null)
    ;(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)

    const Page = await Storefront()
    render(Page)

    expect(screen.getByTestId("header")).toBeInTheDocument()
    expect(screen.getByTestId("features")).toBeInTheDocument()
    expect(screen.getByTestId("footer")).toBeInTheDocument()
  })
})
