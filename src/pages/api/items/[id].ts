import { AuthenticatedRequest } from "@/middleware/auth"
import { dbConnectMiddleware } from "@/middleware/dbConnectMidlleware"
import { ItemService } from "@/services/item.service"
import type { NextApiResponse } from "next"
import nc from "next-connect"
// Declare the AuthenticatedRequest type

const handler = nc<AuthenticatedRequest, NextApiResponse>({
  onError: (err, req, res) => {
    console.error(err.stack)
    res.status(500).json({ success: false, error: "Something went wrong!" })
  },
  onNoMatch: (req, res) => {
    res.status(404).json({ success: false, error: "Method not found" })
  },
})

// GET /api/items/[id] - Get item by ID
handler.get(async (req, res) => {
  await dbConnectMiddleware(req, res, () => {})

  const { id } = req.query

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      error: "Item ID is required",
    })
  }

  const result = await ItemService.getItemById(id)

  if (!result.success) {
    return res.status(404).json(result)
  }

  res.status(200).json(result)
})

export default handler
