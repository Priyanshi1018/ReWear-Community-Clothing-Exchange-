// pages/api/items/index.ts
import type { NextApiRequest, NextApiResponse } from "next"
import nc from "next-connect"
import multer from "multer"
import { authMiddleware, type AuthenticatedRequest } from "../../../middleware/auth"
import { dbConnectMiddleware } from "@/middleware/dbConnectMidlleware"
import { ItemService } from "@/services/item.service"

export const config = {
  api: {
    bodyParser: false, // Disable built-in body parser
  },
}

// Multer setup to store images in memory (or configure storage)
const storage = multer.memoryStorage()
const upload = multer({ storage })

// Extend type for next-connect handler to include user
const handler = nc<AuthenticatedRequest, NextApiResponse>({
  onError: (err, req, res) => {
    console.error(err)
    res.status(500).json({ success: false, error: "Internal Server Error" })
  },
  onNoMatch: (req, res) => {
    res.status(404).json({ success: false, error: "Not Found" })
  },
})

// GET - Fetch all items
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

// POST - Upload item with multiple images
handler.use(authMiddleware)
handler.use(upload.array("images")) // handle multiple files under fieldname `images`

handler.post(async (req: AuthenticatedRequest & { files: any[] }, res: NextApiResponse) => {
  await dbConnectMiddleware(req, res, () => {})

  const files = req.files as Express.Multer.File[]
  const body = req.body

  // Ensure required fields
  const { title, description, category, type, size, condition } = body
  if (!title || !description || !category || !type || !size || !condition || !files?.length) {
    return res.status(400).json({ success: false, error: "All fields and at least one image are required." })
  }

  // Simulated upload: convert buffer to base64 placeholder (In real app: upload to S3, Cloudinary, etc.)
  const imageUrls = files.map(file => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`)

  const itemData = {
    title,
    description,
    category,
    type,
    size,
    condition,
    tags: body.tags ? JSON.parse(body.tags) : [],
    images: imageUrls,
  }

  const result = await ItemService.createItem(itemData, req.user!.userId)

  if (!result.success) {
    return res.status(400).json(result)
  }

  res.status(201).json(result)
})

export default handler
