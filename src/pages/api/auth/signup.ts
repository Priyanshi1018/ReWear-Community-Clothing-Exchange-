import { dbConnectMiddleware } from "@/middleware/dbConnectMidlleware"
import { AuthService } from "@/services/auth.service"
import type { NextApiRequest, NextApiResponse } from "next"
import nc from "next-connect"


const handler = nc<NextApiRequest, NextApiResponse>({
  onError: (err, req, res) => {
    console.error(err.stack)
    res.status(500).json({ success: false, error: "Something went wrong!" })
  },
  onNoMatch: (req, res) => {
    res.status(404).json({ success: false, error: "Method not found" })
  },
})

handler.post(async (req, res) => {
  await dbConnectMiddleware(req, res, () => {})

  const { email, password, name } = req.body

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: "Email, password, and name are required",
    })
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: "Password must be at least 6 characters long",
    })
  }

  const result = await AuthService.signup(email, password, name)

  if (!result.success) {
    return res.status(400).json(result)
  }

  res.status(201).json(result)
})

export default handler
