import Swap from "@/models/swapItem"
import Item from "@/models/item"
import User from "@/models/user"
import type { ApiResponse } from "../types"

export class SwapService {
  static async createSwap(swapData: any): Promise<ApiResponse<any>> {
    try {
      const { requesterId, itemId, offeredItemId, pointsOffered, type, message } = swapData

      // Get the item being requested
      const item = await Item.findById(itemId)
      if (!item || item.status !== "available" || !item.isApproved) {
        return {
          success: false,
          error: "Item is not available for swap",
        }
      }

      // Check if requester is not the owner
      if (item.uploaderId.toString() === requesterId) {
        return {
          success: false,
          error: "Cannot swap your own item",
        }
      }

      // Validate swap type
      if (type === "direct" && offeredItemId) {
        const offeredItem = await Item.findById(offeredItemId)
        if (!offeredItem || offeredItem.uploaderId.toString() !== requesterId || offeredItem.status !== "available") {
          return {
            success: false,
            error: "Invalid offered item",
          }
        }
      } else if (type === "points" && pointsOffered) {
        const requester = await User.findById(requesterId)
        if (!requester || requester.points < pointsOffered) {
          return {
            success: false,
            error: "Insufficient points",
          }
        }
      }

      const swap = new Swap({
        requesterId,
        ownerId: item.uploaderId,
        itemId,
        offeredItemId: type === "direct" ? offeredItemId : undefined,
        pointsOffered: type === "points" ? pointsOffered : undefined,
        type,
        message,
        status: "pending",
      })

      await swap.save()

      // Update item status to pending
      await Item.findByIdAndUpdate(itemId, { status: "pending" })

      return {
        success: true,
        data: swap,
        message: "Swap request created successfully",
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to create swap request",
      }
    }
  }

  static async respondToSwap(
    swapId: string,
    ownerId: string,
    response: "accepted" | "rejected",
  ): Promise<ApiResponse<any>> {
    try {
      const swap = await Swap.findById(swapId)
      if (!swap || swap.ownerId.toString() !== ownerId) {
        return {
          success: false,
          error: "Swap not found or unauthorized",
        }
      }

      if (swap.status !== "pending") {
        return {
          success: false,
          error: "Swap is no longer pending",
        }
      }

      swap.status = response
      await swap.save()

      if (response === "accepted") {
        await this.processAcceptedSwap(swap)
      } else {
        // Reset item status to available
        await Item.findByIdAndUpdate(swap.itemId, { status: "available" })
      }

      return {
        success: true,
        data: swap,
        message: `Swap ${response} successfully`,
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to respond to swap",
      }
    }
  }

  static async getUserSwaps(userId: string): Promise<ApiResponse<{ sent: any[]; received: any[] }>> {
    try {
      const sentSwaps = await Swap.find({ requesterId: userId })
        .populate("itemId", "title images")
        .populate("ownerId", "name")
        .sort({ createdAt: -1 })

      const receivedSwaps = await Swap.find({ ownerId: userId })
        .populate("itemId", "title images")
        .populate("requesterId", "name")
        .populate("offeredItemId", "title images")
        .sort({ createdAt: -1 })

      return {
        success: true,
        data: { sent: sentSwaps, received: receivedSwaps },
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to fetch swaps",
      }
    }
  }

  private static async processAcceptedSwap(swap: any): Promise<void> {
    if (swap.type === "direct" && swap.offeredItemId) {
      // Mark both items as swapped
      await Item.findByIdAndUpdate(swap.itemId, { status: "swapped" })
      await Item.findByIdAndUpdate(swap.offeredItemId, { status: "swapped" })
    } else if (swap.type === "points" && swap.pointsOffered) {
      // Transfer points
      await User.findByIdAndUpdate(swap.requesterId, { $inc: { points: -swap.pointsOffered } })
      await User.findByIdAndUpdate(swap.ownerId, { $inc: { points: swap.pointsOffered } })

      // Mark item as swapped
      await Item.findByIdAndUpdate(swap.itemId, { status: "swapped" })
    }

    // Update swap status to completed
    swap.status = "completed"
    await swap.save()
  }
}
