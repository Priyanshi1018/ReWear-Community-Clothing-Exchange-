import type { NextApiResponse } from "next"
import nc from "next-connect"
import { authMiddleware, type AuthenticatedRequest } from "../../../middleware/auth"
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

handler.get(async (req, res) => {
  await dbConnectMiddleware(req, res, () => {})

  res.status(200).json({
    success: true,
    data: req.user,
  })
})

export default handler
