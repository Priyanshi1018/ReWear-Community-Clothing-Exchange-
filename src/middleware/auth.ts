import type { NextApiRequest, NextApiResponse } from "next"
import { AuthService } from "@/services/auth.service"

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    userId: string
    email: string
    name: string
    role: string
    points: number
  }
}

export function authMiddleware(req: AuthenticatedRequest, res: NextApiResponse, next: () => void) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access token required",
      })
    }

    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      })
    }

    // Get user data and attach to request
    AuthService.getUserById(decoded.userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({
            success: false,
            error: "User not found",
          })
        }

        req.user = {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          points: user.points,
        }

        next()
      })
      .catch(() => {
        return res.status(500).json({
          success: false,
          error: "Authentication failed",
        })
      })
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Authentication failed",
    })
  }
}

export function adminMiddleware(req: AuthenticatedRequest, res: NextApiResponse, next: () => void) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Admin access required",
    })
  }
  next()
}
