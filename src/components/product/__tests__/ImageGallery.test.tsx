/**
 * Task 8: 商品详情页 - ImageGallery 单元测试
 */

import { render, screen, fireEvent } from "@testing-library/react"
import { ImageGallery } from "../ImageGallery"

const mockImages = [
  "/image1.jpg",
  "/image2.jpg",
  "/image3.jpg",
]

describe("ImageGallery", () => {
  it("应该渲染主图", () => {
    render(<ImageGallery images={mockImages} alt="测试商品" />)

    const mainImage = screen.getByAltText("测试商品 - 1")
    expect(mainImage).toBeInTheDocument()
  })

  it("应该渲染缩略图列表", () => {
    render(<ImageGallery images={mockImages} alt="测试商品" />)

    const thumbnails = screen.getAllByRole("button")
    expect(thumbnails.length).toBe(mockImages.length)
  })

  it("点击缩略图应该切换主图", () => {
    render(<ImageGallery images={mockImages} alt="测试商品" />)

    const thumbnails = screen.getAllByRole("button")
    fireEvent.click(thumbnails[1])

    const mainImage = screen.getByAltText("测试商品 - 2")
    expect(mainImage).toBeInTheDocument()
  })

  it("单张图片时应该渲染一个缩略图", () => {
    render(<ImageGallery images={["/single.jpg"]} alt="单图商品" />)

    const thumbnails = screen.queryAllByRole("button")
    expect(thumbnails.length).toBe(1)
  })

  it("空图片数组应该正常处理", () => {
    render(<ImageGallery images={[]} alt="无图商品" />)

    expect(screen.getByText("No Image")).toBeInTheDocument()
  })
})
