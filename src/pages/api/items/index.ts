import type { NextApiResponse } from "next"
import nc from "next-connect"
import { authMiddleware, type AuthenticatedRequest } from "../../../middleware/auth"
import { ItemService } from "@/services/item.service"
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

// GET /api/items - Get all items with filters
handler.get(async (req, res) => {
  await dbConnectMiddleware(req, res, () => {})

  const { page = 1, limit = 10, category, condition, size, search } = req.query
  const filters = { category, condition, size, search }

  const result = await ItemService.getItems(filters, Number(page), Number(limit))

  if (!result.success) {
    return res.status(400).json(result)
  }

  res.status(200).json(result)
})

// POST /api/items - Create new item
handler.use(authMiddleware)

handler.post(async (req, res) => {
  await dbConnectMiddleware(req, res, () => {})

  const { title, description, category, type, size, condition, tags, images } = req.body

  if (!title || !description || !category || !type || !size || !condition || !images?.length) {
    return res.status(400).json({
      success: false,
      error: "All required fields must be provided",
    })
  }

  const itemData = {
    title,
    description,
    category,
    type,
    size,
    condition,
    tags: tags || [],
    images,
  }

  const result = await ItemService.createItem(itemData, req.user!.userId)

  if (!result.success) {
    return res.status(400).json(result)
  }

  res.status(201).json(result)
})

export default handler
