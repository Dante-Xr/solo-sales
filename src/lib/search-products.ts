export interface SearchFilters {
  categories: string[]
  priceRange: [number, number]
  minRating: number
  inStockOnly: boolean
}

export interface SearchProductFilterTarget {
  name: string
  price: number
  sales: number
  category: string
  rating: number
  inStock: boolean
}

export type SearchProductSortType = "default" | "priceAsc" | "priceDesc" | "sales"

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  categories: [],
  priceRange: [0, 9999],
  minRating: 0,
  inStockOnly: false,
}

export function getInitialSearchFilters(
  searchParams: Pick<URLSearchParams, "get"> & Partial<Pick<URLSearchParams, "getAll">>
): SearchFilters {
  const categories = searchParams.getAll?.("category") ?? []
  const fallbackCategory = searchParams.get("category")
  const minPrice = Number(searchParams.get("minPrice") || DEFAULT_SEARCH_FILTERS.priceRange[0])
  const maxPrice = Number(searchParams.get("maxPrice") || DEFAULT_SEARCH_FILTERS.priceRange[1])
  const minRating = Number(searchParams.get("minRating") || DEFAULT_SEARCH_FILTERS.minRating)

  return {
    ...DEFAULT_SEARCH_FILTERS,
    categories: categories.length > 0 ? categories : fallbackCategory ? [fallbackCategory] : [],
    priceRange: [
      Number.isFinite(minPrice) ? minPrice : DEFAULT_SEARCH_FILTERS.priceRange[0],
      Number.isFinite(maxPrice) ? maxPrice : DEFAULT_SEARCH_FILTERS.priceRange[1],
    ],
    minRating: Number.isFinite(minRating) ? minRating : DEFAULT_SEARCH_FILTERS.minRating,
    inStockOnly: searchParams.get("inStock") === "true",
  }
}

export function buildSearchFilterHref(query: string, filters: SearchFilters) {
  const params = new URLSearchParams()

  if (query) {
    params.set("q", query)
  }

  filters.categories.forEach((category) => params.append("category", category))

  if (filters.priceRange[0] !== DEFAULT_SEARCH_FILTERS.priceRange[0]) {
    params.set("minPrice", String(filters.priceRange[0]))
  }

  if (filters.priceRange[1] !== DEFAULT_SEARCH_FILTERS.priceRange[1]) {
    params.set("maxPrice", String(filters.priceRange[1]))
  }

  if (filters.minRating > 0) {
    params.set("minRating", String(filters.minRating))
  }

  if (filters.inStockOnly) {
    params.set("inStock", "true")
  }

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ""
}

export function getVisibleSearchProducts<T extends SearchProductFilterTarget>(
  products: T[],
  query: string,
  filters: SearchFilters,
  sortType: SearchProductSortType = "default"
) {
  const normalizedQuery = query.trim().toLowerCase()

  return products
    .filter((product) => {
      if (
        normalizedQuery &&
        !product.name.toLowerCase().includes(normalizedQuery) &&
        !normalizedQuery.includes("#trending") &&
        !normalizedQuery.includes("#flashsale") &&
        !normalizedQuery.includes("#viral") &&
        !normalizedQuery.includes("#网红") &&
        !normalizedQuery.includes("#限时")
      ) {
        return false
      }

      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false
      }

      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false
      }

      if (filters.minRating > 0 && product.rating < filters.minRating) {
        return false
      }

      if (filters.inStockOnly && !product.inStock) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      switch (sortType) {
        case "priceAsc":
          return a.price - b.price
        case "priceDesc":
          return b.price - a.price
        case "sales":
          return b.sales - a.sales
        default:
          return 0
      }
    })
}
