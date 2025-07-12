export interface User {
  _id?: string
  email: string
  password: string
  name: string
  points: number
  role: "user" | "admin"
  profileImage?: string
  createdAt: Date
  updatedAt: Date
}

export interface Item {
  _id?: string
  title: string
  description: string
  category: string
  type: string
  size: string
  condition: "new" | "like-new" | "good" | "fair"
  tags: string[]
  images: string[]
  uploaderId: string
  pointValue: number
  status: "available" | "pending" | "swapped" | "removed"
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Swap {
  _id?: string
  requesterId: string
  ownerId: string
  itemId: string
  offeredItemId?: string // For direct swaps
  pointsOffered?: number // For point-based redemption
  type: "direct" | "points"
  status: "pending" | "accepted" | "rejected" | "completed"
  message?: string
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
