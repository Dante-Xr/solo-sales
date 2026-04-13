import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api-client"

interface Product {
  id: string
  name: string
  price: number
  originalPrice: number
  image: string
  sales: number
  category?: string
  description?: string
  rating?: number
  reviews?: number
  stock?: number
  images?: string[]
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => apiFetch<Product[]>("/api/products"),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => apiFetch<Product>(`/api/products/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => apiFetch<Product[]>("/api/products?featured=true"),
    staleTime: 5 * 60 * 1000,
  })
}

export type { Product }
