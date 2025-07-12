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
  await dbConnectMiddleware(req, res , () => {})

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email and password are required",
    })
  }

  const result = await AuthService.login(email, password)

  if (!result.success) {
    return res.status(401).json(result)
  }

  res.status(200).json(result)
})

export default handler
