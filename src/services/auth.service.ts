import jwt from "jsonwebtoken"
import User from "@/models/user"
import type { ApiResponse } from "../types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

export class AuthService {
  static generateToken(userId: string) {
    return jwt.sign({ userId }, JWT_SECRET , { expiresIn: JWT_EXPIRES_IN } as any)
  }

  static verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch (error) {
      return null
    }
  }

  static async signup(
    email: string,
    password: string,
    name: string,
  ): Promise<ApiResponse<{ user: any; token: string }>> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return {
          success: false,
          error: "User already exists with this email",
        }
      }

      // Create new user
      const user = new User({ email, password, name })
      await user.save()

      // Generate token
      const token = this.generateToken(user._id.toString())

      // Remove password from response
      const userResponse = user.toObject()
      delete userResponse.password

      return {
        success: true,
        data: { user: userResponse as any, token },
        message: "User created successfully",
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to create user",
      }
    }
  }

  static async login(email: string, password: string): Promise<ApiResponse<{ user: any; token: string }>> {
    try {
      // Find user by email
      const user = await User.findOne({ email })
      if (!user) {
        return {
          success: false,
          error: "Invalid email or password",
        }
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return {
          success: false,
          error: "Invalid email or password",
        }
      }

      // Generate token
      const token = this.generateToken(user._id.toString())

      // Remove password from response
      const userResponse = user.toObject()
      delete userResponse.password

      return {
        success: true,
        data: { user: userResponse as any, token },
        message: "Login successful",
      }
    } catch (error) {
      return {
        success: false,
        error: "Login failed",
      }
    }
  }

  static async getUserById(userId: string): Promise<any | null> {
    try {
      return await User.findById(userId).select("-password")
    } catch (error) {
      return null
    }
  }
}
