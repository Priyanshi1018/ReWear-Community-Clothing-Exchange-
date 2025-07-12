import Item from "@/models/item"
import User from "@/models/user"
import type { ApiResponse } from "../types"

export class ItemService {
  static async createItem(itemData: any, uploaderId: string): Promise<ApiResponse<any>> {
    try {
      // Calculate point value based on condition and category
      const pointValue = this.calculatePointValue(itemData.condition, itemData.category)

      const item = new Item({
        ...itemData,
        uploaderId,
        pointValue,
        status: "available",
        isApproved: false, // Requires admin approval
      })

      await item.save()

      return {
        success: true,
        data: item,
        message: "Item created successfully and pending approval",
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to create item",
      }
    }
  }

  static async getItems(
    filters: any = {},
    page = 1,
    limit = 10,
  ): Promise<ApiResponse<{ items: any[]; total: number; pages: number }>> {
    try {
      const query: any = { isApproved: true, status: "available" }

      // Apply filters
      if (filters.category) query.category = filters.category
      if (filters.condition) query.condition = filters.condition
      if (filters.size) query.size = filters.size
      if (filters.search) {
        query.$text = { $search: filters.search }
      }

      const skip = (page - 1) * limit
      const items = await Item.find(query)
        .populate("uploaderId", "name profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

      const total = await Item.countDocuments(query)
      const pages = Math.ceil(total / limit)

      return {
        success: true,
        data: { items, total, pages },
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to fetch items",
      }
    }
  }

  static async getItemById(itemId: string): Promise<ApiResponse<any>> {
    try {
      const item = await Item.findById(itemId).populate("uploaderId", "name profileImage points")

      if (!item) {
        return {
          success: false,
          error: "Item not found",
        }
      }

      return {
        success: true,
        data: item,
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to fetch item",
      }
    }
  }

  static async getUserItems(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const items = await Item.find({ uploaderId: userId }).sort({ createdAt: -1 })

      return {
        success: true,
        data: items,
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to fetch user items",
      }
    }
  }

  static async approveItem(itemId: string, adminId: string): Promise<ApiResponse<any>> {
    try {
      // Verify admin role
      const admin = await User.findById(adminId)
      if (!admin || admin.role !== "admin") {
        return {
          success: false,
          error: "Unauthorized",
        }
      }

      const item = await Item.findByIdAndUpdate(itemId, { isApproved: true }, { new: true })

      if (!item) {
        return {
          success: false,
          error: "Item not found",
        }
      }

      return {
        success: true,
        data: item,
        message: "Item approved successfully",
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to approve item",
      }
    }
  }

  static async rejectItem(itemId: string, adminId: string): Promise<ApiResponse> {
    try {
      // Verify admin role
      const admin = await User.findById(adminId)
      if (!admin || admin.role !== "admin") {
        return {
          success: false,
          error: "Unauthorized",
        }
      }

      await Item.findByIdAndUpdate(itemId, { status: "removed" })

      return {
        success: true,
        message: "Item rejected successfully",
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to reject item",
      }
    }
  }

  private static calculatePointValue(condition: string, category: string): number {
    const basePoints: { [key: string]: number } = {
      clothing: 20,
      shoes: 25,
      accessories: 15,
      bags: 30,
      jewelry: 35,
      other: 10,
    }

    const conditionMultiplier: { [key: string]: number } = {
      new: 1.5,
      "like-new": 1.2,
      good: 1.0,
      fair: 0.8,
    }

    const base = basePoints[category] || 10
    const multiplier = conditionMultiplier[condition] || 1.0

    return Math.round(base * multiplier)
  }
}
