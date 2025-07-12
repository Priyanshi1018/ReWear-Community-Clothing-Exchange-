const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    }

    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong")
    }

    return data
  }

  // Auth endpoints
  async signup(userData: { email: string; password: string; name: string }) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { email: string; password: string }) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async getMe() {
    return this.request("/auth/me")
  }

  // Items endpoints
  async getItems(params?: {
    page?: number
    limit?: number
    category?: string
    condition?: string
    size?: string
    search?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString())
      })
    }
    return this.request(`/items?${searchParams.toString()}`)
  }

  async getItem(id: string) {
    return this.request(`/items/${id}`)
  }

async createItem(itemData: FormData | any) {
  const isFormData = itemData instanceof FormData
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null // or from AuthContext

  const response = await fetch("/api/items", {
    method: "POST",
    body: itemData,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  return response
}


  async getMyItems() {
    return this.request("/items/my-item")
  }

  // Swaps endpoints
  async getSwaps() {
    return this.request("/swaps")
  }

  async createSwap(swapData: any) {
    return this.request("/swaps", {
      method: "POST",
      body: JSON.stringify(swapData),
    })
  }

  async respondToSwap(swapId: string, response: "accepted" | "rejected") {
    return this.request(`/swaps/${swapId}/respond`, {
      method: "POST",
      body: JSON.stringify({ response }),
    })
  }

  // Admin endpoints
  async approveItem(itemId: string) {
    return this.request(`/admin/items/${itemId}/approve`, {
      method: "POST",
    })
  }

  async rejectItem(itemId: string) {
    return this.request(`/admin/items/${itemId}/reject`, {
      method: "POST",
    })
  }
}

export const api = new ApiClient()
