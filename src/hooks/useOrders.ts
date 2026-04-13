import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api-client"

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    images: string[]
  }
}

interface Order {
  id: string
  totalAmount: number
  status: string
  createdAt: string
  items: OrderItem[]
  shippingAddress?: string
  trackingNumber?: string
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => apiFetch<Order[]>("/api/orders"),
    staleTime: 2 * 60 * 1000,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => apiFetch<Order>(`/api/orders/${id}`),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export type { Order, OrderItem }
