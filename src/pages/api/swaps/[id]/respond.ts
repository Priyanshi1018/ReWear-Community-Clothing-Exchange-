import type { NextApiResponse } from "next"
import nc from "next-connect"
import { authMiddleware, type AuthenticatedRequest } from "../../../../middleware/auth"
import { dbConnectMiddleware } from "@/middleware/dbConnectMidlleware"
import { SwapService } from "@/services/swap.service"

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

// POST /api/swaps/[id]/respond - Respond to swap request
handler.post(async (req, res) => {
  await dbConnectMiddleware(req, res, () => {})

  const { id } = req.query
  const { response } = req.body

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      error: "Swap ID is required",
    })
  }

  if (!response || !["accepted", "rejected"].includes(response)) {
    return res.status(400).json({
      success: false,
      error: "Valid response (accepted/rejected) is required",
    })
  }

  const result = await SwapService.respondToSwap(id, req.user!.userId, response)

  if (!result.success) {
    return res.status(400).json(result)
  }

  res.status(200).json(result)
})

export default handler
