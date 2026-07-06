import {
  DEFAULT_SEARCH_FILTERS,
  buildSearchFilterHref,
  getInitialSearchFilters,
  getVisibleSearchProducts,
  type SearchProductFilterTarget,
} from "../search-products"

const products: SearchProductFilterTarget[] = [
  {
    name: "Home humidifier",
    price: 29.99,
    sales: 100,
    category: "home",
    rating: 4.5,
    inStock: true,
  },
  {
    name: "Wireless headphones",
    price: 39.99,
    sales: 80,
    category: "electronics",
    rating: 4.7,
    inStock: true,
  },
  {
    name: "Mini projector",
    price: 89.99,
    sales: 20,
    category: "electronics",
    rating: 3.8,
    inStock: false,
  },
]

describe("search product filtering", () => {
  it("filters all products when no search query is present", () => {
    const visible = getVisibleSearchProducts(products, "", {
      ...DEFAULT_SEARCH_FILTERS,
      categories: ["home"],
    })

    expect(visible).toHaveLength(1)
    expect(visible[0].category).toBe("home")
  })

  it("initializes category filters from the search URL", () => {
    const filters = getInitialSearchFilters(new URLSearchParams("category=electronics"))

    expect(filters.categories).toEqual(["electronics"])
  })

  it("builds a shareable filter URL with price and stock filters", () => {
    const href = buildSearchFilterHref("headphones", {
      ...DEFAULT_SEARCH_FILTERS,
      categories: ["electronics"],
      priceRange: [20, 100],
      minRating: 4,
      inStockOnly: true,
    })

    expect(href).toBe(
      "?q=headphones&category=electronics&minPrice=20&maxPrice=100&minRating=4&inStock=true"
    )
  })

  it("builds a clean reset URL when no query or filters are active", () => {
    expect(buildSearchFilterHref("", DEFAULT_SEARCH_FILTERS)).toBe("")
  })
})
