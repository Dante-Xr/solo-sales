/**
 * 修改时间：2026-05-02 22:14:07 +08:00
 * 修改内容：新增商品列表页 Server Component 降级渲染测试，覆盖服务层异步失败被页面兜底捕获。
 * 修改模型：gpt-5.5
 */

import { render, screen } from "@testing-library/react"
import ProductsPage from "./page"

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string, values?: { count?: number }) => {
    if (key === "productCount") return `${values?.count ?? 0} products`
    return key
  }),
}))

jest.mock("@/server/services/product-service", () => ({
  getStorefrontProducts: jest.fn(),
}))

jest.mock("@/components/storefront/ProductGridClient", () => ({
  ProductGridClient: ({ products }: { products: unknown[] }) => (
    <div data-testid="product-grid">Grid with {products.length} products</div>
  ),
}))

jest.mock("@/components/storefront/StorefrontHeaderClient", () => ({
  StorefrontHeaderClient: () => <header data-testid="header">Header</header>,
}))

jest.mock("@/components/storefront/StorefrontFooter", () => ({
  StorefrontFooter: () => <footer data-testid="footer">Footer</footer>,
}))

jest.mock("@/components/storefront/ViewportWrapper", () => ({
  ViewportWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import { getStorefrontProducts } from "@/server/services/product-service"

const getStorefrontProductsMock = getStorefrontProducts as jest.MockedFunction<
  typeof getStorefrontProducts
>

describe("ProductsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("应该在商品服务异步失败时渲染兜底商品", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined)
    getStorefrontProductsMock.mockRejectedValue(new Error("database timeout"))

    try {
      const Page = await ProductsPage({ searchParams: Promise.resolve({ filter: "best" }) })
      render(Page)

      // 商品服务超时或断连时，页面必须吞掉异步错误并展示兜底商品，而不是让 Server Component 500。
      expect(screen.getByTestId("product-grid")).toHaveTextContent("6 products")
      expect(screen.getByText("6 products")).toBeInTheDocument()
    } finally {
      errorSpy.mockRestore()
    }
  })
})
