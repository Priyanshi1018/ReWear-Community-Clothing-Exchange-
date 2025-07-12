"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import Head from "next/head"
import { useAuth } from "@/contexts/Authcontext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { ArrowLeft, User, Calendar, Tag, AlertTriangle } from "lucide-react"
import { Validator } from "@/lib/validation"

export default function ItemDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const [item, setItem] = useState<any>(null)
  const [myItems, setMyItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [swapLoading, setSwapLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Swap form state
  const [swapType, setSwapType] = useState<"direct" | "points">("points")
  const [selectedItemId, setSelectedItemId] = useState("")
  const [pointsOffered, setPointsOffered] = useState("")
  const [message, setMessage] = useState("")
  const [swapError, setSwapError] = useState("")

  useEffect(() => {
    if (id) {
      fetchItem()
      if (user) {
        fetchMyItems()
      }
    }
  }, [id, user])

  const fetchItem = async () => {
    try {
      setError(null)
      const response = await api.getItem(id as string)
      setItem(response.data)
    } catch (error: any) {
      console.error("Failed to fetch item:", error)
      setError(error.message || "Failed to load item")
    } finally {
      setLoading(false)
    }
  }

  const fetchMyItems = async () => {
    try {
      const response = await api.getMyItems()
      setMyItems(response.data.filter((myItem: any) => myItem.status === "available"))
    } catch (error: any) {
      console.error("Failed to fetch my items:", error)
    }
  }

  const validateSwapForm = (): boolean => {
    try {
      const swapData = {
        itemId: item._id,
        type: swapType,
        message,
        ...(swapType === "direct" ? { offeredItemId: selectedItemId } : { pointsOffered: Number(pointsOffered) }),
      }

      Validator.validateSwapData(swapData)
      return true
    } catch (error: any) {
      setSwapError(error.message)
      return false
    }
  }

  const handleSwapRequest = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!validateSwapForm()) return

    setSwapLoading(true)
    setSwapError("")

    try {
      const swapData: any = {
        itemId: item._id,
        type: swapType,
        message: message || undefined,
      }

      if (swapType === "direct") {
        swapData.offeredItemId = selectedItemId
      } else {
        swapData.pointsOffered = Number(pointsOffered)
      }

      await api.createSwap(swapData)
      router.push("/dashboard")
    } catch (error: any) {
      setSwapError(error.message || "Failed to create swap request")
    } finally {
      setSwapLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <>
        <Head>
          <title>Item Not Found - ReWear</title>
        </Head>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error || "Item not found"}</span>
              <Button variant="outline" size="sm" onClick={() => router.push("/items")}>
                Browse Items
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </>
    )
  }

  const isOwner = user && item.uploaderId._id === user.userId
  const canSwap = user && !isOwner && item.status === "available"

  return (
    <>
      <Head>
        <title>{item.title} - ReWear</title>
        <meta name="description" content={item.description} />
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
              <BreadcrumbLink href="/items">Browse Items</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{item.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={item.images[currentImageIndex] || "/placeholder.svg?height=600&width=600"}
                alt={item.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {item.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {item.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? "border-green-500" : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${item.title} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <Badge variant="secondary">{item.condition}</Badge>
                <Badge variant="outline">{item.category}</Badge>
                <span className="text-2xl font-bold text-green-600">{item.pointValue} points</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-600 mb-4">
                <User className="h-4 w-4" />
                <span>Listed by {item.uploaderId.name}</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-600 mb-6">
                <Calendar className="h-4 w-4" />
                <span>Listed on {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Size</h4>
                <p className="text-gray-600">{item.size}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Type</h4>
                <p className="text-gray-600">{item.type}</p>
              </div>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Swap Actions */}
            {canSwap && (
              <Card>
                <CardHeader>
                  <CardTitle>Interested in this item?</CardTitle>
                  <CardDescription>Make a swap request or redeem with points</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">Make Swap Request</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Swap Request</DialogTitle>
                        <DialogDescription>Choose how you'd like to swap for this item</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {swapError && (
                          <Alert variant="destructive">
                            <AlertDescription>{swapError}</AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label>Swap Type</Label>
                          <Select value={swapType} onValueChange={(value: "direct" | "points") => setSwapType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="points">Redeem with Points</SelectItem>
                              <SelectItem value="direct">Direct Item Swap</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {swapType === "points" ? (
                          <div className="space-y-2">
                            <Label htmlFor="points">Points to Offer</Label>
                            <Input
                              id="points"
                              type="number"
                              value={pointsOffered}
                              onChange={(e) => setPointsOffered(e.target.value)}
                              placeholder={`Suggested: ${item.pointValue}`}
                              min="1"
                              max={user?.points}
                            />
                            <p className="text-sm text-gray-600">You have {user?.points} points available</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Select Item to Offer</Label>
                            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose an item from your collection" />
                              </SelectTrigger>
                              <SelectContent>
                                {myItems.map((myItem: any) => (
                                  <SelectItem key={myItem._id} value={myItem._id}>
                                    {myItem.title} ({myItem.pointValue} pts)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {myItems.length === 0 && (
                              <p className="text-sm text-gray-600">You need to list items before making direct swaps</p>
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="message">Message (Optional)</Label>
                          <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add a personal message..."
                            rows={3}
                          />
                        </div>

                        <Button onClick={handleSwapRequest} disabled={swapLoading} className="w-full">
                          {swapLoading ? "Sending Request..." : "Send Swap Request"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            {isOwner && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600">This is your item</p>
                </CardContent>
              </Card>
            )}

            {!user && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600 mb-4">Sign in to make swap requests</p>
                  <Button onClick={() => router.push("/login")}>Sign In</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
