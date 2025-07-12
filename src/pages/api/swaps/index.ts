import type { NextApiResponse } from "next"
import nc from "next-connect"
import { authMiddleware, type AuthenticatedRequest } from "../../../middleware/auth"
import { SwapService } from "@/services/swap.service"
import { dbConnectMiddleware } from "@/middleware/dbConnectMidlleware"

const handler = nc<AuthenticatedRequest, NextApiResponse>({
  onError: (err, req, res) => {
    console.error(err.stack)
    res.status(500).json({ success: false, error: "Something went wrong!" })
  },
  onNoMatch: (req, res) => {
    res.status(404).json({ success: false, error: "Method not found" })
  },
})

handler.use(authMiddleware)

// GET /api/swaps - Get user's swaps
handler.get(async (req, res) => {
  await dbConnectMiddleware(req, res, () => {})

  const result = await SwapService.getUserSwaps(req.user!.userId)

  if (!result.success) {
    return res.status(400).json(result)
  }

  res.status(200).json(result)
})

// POST /api/swaps - Create new swap request
handler.post(async (req, res) => {
  await dbConnectMiddleware(req, res, () => {})

  const { itemId, offeredItemId, pointsOffered, type, message } = req.body

  if (!itemId || !type) {
    return res.status(400).json({
      success: false,
      error: "Item ID and swap type are required",
    })
  }

  if (type === "direct" && !offeredItemId) {
    return res.status(400).json({
      success: false,
      error: "Offered item ID is required for direct swaps",
    })
  }

  if (type === "points" && !pointsOffered) {
    return res.status(400).json({
      success: false,
      error: "Points offered is required for points swaps",
    })
  }

  const swapData = {
    requesterId: req.user!.userId,
    itemId,
    offeredItemId,
    pointsOffered,
    type,
    message,
  }

  const result = await SwapService.createSwap(swapData)

  if (!result.success) {
    return res.status(400).json(result)
  }

  res.status(201).json(result)
})

export default handler
