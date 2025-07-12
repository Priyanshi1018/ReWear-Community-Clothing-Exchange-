import type { NextApiResponse } from "next"
import nc from "next-connect"
import { authMiddleware, type AuthenticatedRequest } from "../../../middleware/auth"
import { dbConnectMiddleware } from "@/middleware/dbConnectMidlleware"
import { ItemService } from "@/services/item.service"

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

// GET /api/items/my-items - Get current user's items
handler.get(async (req, res) => {
  await dbConnectMiddleware(req, res, () => {})

  const result = await ItemService.getUserItems(req.user!.userId)

  if (!result.success) {
    return res.status(400).json(result)
  }

  res.status(200).json(result)
})

export default handler
