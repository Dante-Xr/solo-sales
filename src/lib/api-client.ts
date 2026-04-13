const API_BASE = ""

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new ApiError(
      res.status,
      errorData && typeof errorData === "object" && "error" in errorData
        ? String((errorData as { error: string }).error)
        : `API Error: ${res.status}`,
      errorData
    )
  }

  return res.json()
}
