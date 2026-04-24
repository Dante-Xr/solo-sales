/**
 * Task 6: Skeleton Loading + Task 1: 商品数据 - 单元测试
 */

import { render, screen } from "@testing-library/react"
import { ProductGridClient, ProductCardSkeleton, ProductGridSkeleton } from "../ProductGridClient"
import type { ProductItem } from "../HomeCarouselClient"

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      featured: "热卖爆款推荐",
      sold: "已售",
    }
    return map[key] || key
  },
}))

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

const mockProducts: ProductItem[] = [
  {
    id: "1",
    name: "无线蓝牙耳机 Pro",
    price: 29.99,
    originalPrice: 49.99,
    image: "/test.jpg",
    sales: 1200,
    stock: 50,
  },
  {
    id: "2",
    name: "智能手表 X1",
    price: 59.99,
    originalPrice: 89.99,
    image: "/test2.jpg",
    sales: 800,
    stock: 5,
  },
]

describe("ProductGridClient", () => {
  it("应该渲染商品列表", () => {
    render(<ProductGridClient products={mockProducts} isLoading={false} />)

    expect(screen.getByText("热卖爆款推荐")).toBeInTheDocument()
    expect(screen.getByText("无线蓝牙耳机 Pro")).toBeInTheDocument()
    expect(screen.getByText("智能手表 X1")).toBeInTheDocument()
  })

  it("应该显示商品价格", () => {
    render(<ProductGridClient products={mockProducts} isLoading={false} />)

    expect(screen.getByText("$29.99")).toBeInTheDocument()
    expect(screen.getByText("$59.99")).toBeInTheDocument()
  })

  it("加载时应该显示 Skeleton", () => {
    render(<ProductGridClient products={[]} isLoading={true} />)

    const skeletons = document.querySelectorAll(".animate-pulse")
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("空商品列表应该显示 Skeleton", () => {
    render(<ProductGridClient products={[]} isLoading={false} />)

    const skeletons = document.querySelectorAll(".animate-pulse")
    expect(skeletons.length).toBeGreaterThan(0)
  })
})

describe("ProductCardSkeleton", () => {
  it("应该渲染骨架屏卡片", () => {
    render(<ProductCardSkeleton />)

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument()
  })
})

describe("ProductGridSkeleton", () => {
  it("默认应该渲染 6 个骨架卡片", () => {
    render(<ProductGridSkeleton />)

    const skeletons = document.querySelectorAll(".animate-pulse")
    expect(skeletons.length).toBeGreaterThanOrEqual(6)
  })

  it("应该支持自定义数量", () => {
    render(<ProductGridSkeleton count={4} />)

    const skeletons = document.querySelectorAll(".animate-pulse")
    expect(skeletons.length).toBeGreaterThanOrEqual(4)
  })
})
