"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useAuth } from "@/contexts/Authcontext"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ItemCard } from "@/components/ItemCard"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { User, Package, ArrowRightLeft, Star, AlertTriangle } from "lucide-react"

export default function DashboardPage() {
  const { user, refreshUser } = useAuth()
  const [myItems, setMyItems] = useState([])
  const [swaps, setSwaps] = useState({ sent: [], received: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const [itemsResponse, swapsResponse] = await Promise.all([api.getMyItems(), api.getSwaps()])

      setMyItems(itemsResponse.data)
      setSwaps(swapsResponse.data)
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error)
      setError(error.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleSwapResponse = async (swapId: string, response: "accepted" | "rejected") => {
    try {
      await api.respondToSwap(swapId, response)
      await fetchDashboardData()
      await refreshUser()
    } catch (error: any) {
      console.error("Failed to respond to swap:", error)
      setError(error.message || "Failed to respond to swap")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard - ReWear</title>
        <meta name="description" content="Manage your items and track your swaps" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Manage your items and track your swaps</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Balance</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{user.points}</div>
              <p className="text-xs text-muted-foreground">Available for redemption</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myItems.length}</div>
              <p className="text-xs text-muted-foreground">Items listed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent Requests</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{swaps.sent.length}</div>
              <p className="text-xs text-muted-foreground">Swap requests sent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Received Requests</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{swaps.received.length}</div>
              <p className="text-xs text-muted-foreground">Requests to review</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="items" className="space-y-4">
          <TabsList>
            <TabsTrigger value="items">My Items</TabsTrigger>
            <TabsTrigger value="sent-swaps">Sent Requests</TabsTrigger>
            <TabsTrigger value="received-swaps">Received Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Listed Items</h2>
              <Link href="/add-item">
                <Button>Add New Item</Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : myItems.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
                  <p className="text-gray-600 mb-4">Start by listing your first item</p>
                  <Link href="/add-item">
                    <Button>List Your First Item</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {myItems.map((item: any) => (
                  <div key={item._id} className="relative">
                    <ItemCard item={item} />
                    <div className="absolute top-2 right-2">
                      <Badge variant={item.status === "available" ? "default" : "secondary"}>{item.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent-swaps" className="space-y-4">
            <h2 className="text-xl font-semibold">Swap Requests You've Sent</h2>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="flex space-x-4">
                      <div className="bg-gray-200 w-16 h-16 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : swaps.sent.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <ArrowRightLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No swap requests sent</h3>
                  <p className="text-gray-600">Browse items to start swapping</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {swaps.sent.map((swap: any) => (
                  <Card key={swap._id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={swap.itemId.images[0] || "/placeholder.svg?height=60&width=60"}
                            alt={swap.itemId.title}
                            className="w-15 h-15 object-cover rounded"
                          />
                          <div>
                            <h3 className="font-medium">{swap.itemId.title}</h3>
                            <p className="text-sm text-gray-600">to {swap.ownerId.name}</p>
                            <p className="text-xs text-gray-500">{new Date(swap.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            swap.status === "pending"
                              ? "default"
                              : swap.status === "accepted"
                                ? "default"
                                : swap.status === "completed"
                                  ? "default"
                                  : "destructive"
                          }
                        >
                          {swap.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="received-swaps" className="space-y-4">
            <h2 className="text-xl font-semibold">Swap Requests You've Received</h2>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="flex space-x-4">
                      <div className="bg-gray-200 w-16 h-16 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : swaps.received.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No swap requests received</h3>
                  <p className="text-gray-600">List more items to receive swap requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {swaps.received.map((swap: any) => (
                  <Card key={swap._id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={swap.itemId.images[0] || "/placeholder.svg?height=60&width=60"}
                            alt={swap.itemId.title}
                            className="w-15 h-15 object-cover rounded"
                          />
                          <div>
                            <h3 className="font-medium">{swap.itemId.title}</h3>
                            <p className="text-sm text-gray-600">from {swap.requesterId.name}</p>
                            <p className="text-xs text-gray-500">{new Date(swap.createdAt).toLocaleDateString()}</p>
                            {swap.type === "points" && (
                              <p className="text-sm text-green-600">Offering {swap.pointsOffered} points</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {swap.status === "pending" ? (
                            <>
                              <Button size="sm" onClick={() => handleSwapResponse(swap._id, "accepted")}>
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSwapResponse(swap._id, "rejected")}
                              >
                                Decline
                              </Button>
                            </>
                          ) : (
                            <Badge
                              variant={
                                swap.status === "accepted"
                                  ? "default"
                                  : swap.status === "completed"
                                    ? "default"
                                    : "destructive"
                              }
                            >
                              {swap.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
