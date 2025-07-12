"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import { useAuth } from "@/contexts/Authcontext"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CheckCircle, XCircle, Eye, Package, Users, AlertTriangle } from "lucide-react"
import Image from "next/image"

export default function AdminPage() {
  const { user } = useAuth()
  const [pendingItems, setPendingItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role === "admin") {
      fetchPendingItems()
    }
  }, [user])

  const fetchPendingItems = async () => {
    try {
      setError(null)
      // This would need to be implemented in the backend
      const response = await api.getItems({ page: 1, limit: 50 })
      // Filter for pending items (not approved)
      const pending = response.data.items.filter((item: any) => !item.isApproved)
      setPendingItems(pending)
    } catch (error: any) {
      console.error("Failed to fetch pending items:", error)
      setError(error.message || "Failed to load pending items")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (itemId: string) => {
    setActionLoading(itemId)
    try {
      await api.approveItem(itemId)
      await fetchPendingItems()
    } catch (error: any) {
      console.error("Failed to approve item:", error)
      setError(error.message || "Failed to approve item")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (itemId: string) => {
    setActionLoading(itemId)
    try {
      await api.rejectItem(itemId)
      await fetchPendingItems()
    } catch (error: any) {
      console.error("Failed to reject item:", error)
      setError(error.message || "Failed to reject item")
    } finally {
      setActionLoading(null)
    }
  }

  if (!user || user.role !== "admin") {
    return (
      <>
        <Head>
          <title>Access Denied - ReWear</title>
        </Head>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>You don't have permission to access this page.</AlertDescription>
          </Alert>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Panel - ReWear</title>
        <meta name="description" content="Manage and moderate ReWear platform" />
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
              <BreadcrumbPage>Admin Panel</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Manage and moderate ReWear platform</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchPendingItems}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingItems.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Swaps</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Ongoing swaps</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending-items" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending-items">Pending Items</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="pending-items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Items Awaiting Approval</CardTitle>
                <CardDescription>Review and moderate new item listings</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : pendingItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending items</h3>
                    <p className="text-gray-600">All items have been reviewed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingItems.map((item: any) => (
                      <div key={item._id} className="border rounded-lg p-4">
                        <div className="flex space-x-4">
                          <div className="flex-shrink-0">
                            <Image
                              src={item.images[0] || "/placeholder.svg?height=80&width=80"}
                              alt={item.title}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 truncate">{item.title}</h3>
                                <p className="text-sm text-gray-600">by {item.uploaderId.name}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="secondary">{item.condition}</Badge>
                                  <Badge variant="outline">{item.category}</Badge>
                                  <span className="text-sm text-green-600 font-medium">{item.pointValue} pts</span>
                                </div>
                              </div>

                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(item._id)}
                                  disabled={actionLoading === item._id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(item._id)}
                                  disabled={actionLoading === item._id}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>

                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{item.description}</p>

                            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                              <span>Size: {item.size}</span>
                              <span>Listed: {new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                  <p className="text-gray-600">User management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>Platform statistics and reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Reports</h3>
                  <p className="text-gray-600">Analytics and reporting features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
