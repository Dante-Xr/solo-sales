import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api-client"

interface TrendingKeyword {
  keyword: string
  count: number
}

export function useTrendingSearches() {
  return useQuery({
    queryKey: ["search", "trending"],
    queryFn: () => apiFetch<TrendingKeyword[]>("/api/search/trending"),
    staleTime: 10 * 60 * 1000,
  })
}

export type { TrendingKeyword }
