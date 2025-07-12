"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { api } from "@/lib/api"

interface User {
  userId: string
  email: string
  name: string
  role: string
  points: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        const response = await api.getMe()
        setUser(response.data)
      }
    } catch (error) {
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password })
    localStorage.setItem("token", response.data.token)
    setUser(response.data.user)
  }

  const signup = async (email: string, password: string, name: string) => {
    const response = await api.signup({ email, password, name })
    localStorage.setItem("token", response.data.token)
    setUser(response.data.user)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const response = await api.getMe()
      setUser(response.data)
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
