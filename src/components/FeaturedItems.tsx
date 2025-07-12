"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import { ItemCard } from "./ItemCard"
import { Button } from "@/components/ui/button"
import { LoadingGrid } from "./LoadingSpinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"

interface FeaturedItemsProps {
  limit?: number
  autoSlide?: boolean
  slideInterval?: number
}

export function FeaturedItems({ limit = 8, autoSlide = false, slideInterval = 5000 }: FeaturedItemsProps) {
  const [items, setItems] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchFeaturedItems = useCallback(async () => {
    try {
      setError(null)
      const response = await api.getItems({ limit })
      setItems(response.data.items)
    } catch (error: any) {
      console.error("Failed to fetch featured items:", error)
      setError(error.message || "Failed to load featured items")
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchFeaturedItems()
  }, [fetchFeaturedItems])

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide || items.length <= 4) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, items.length - 3))
    }, slideInterval)

    return () => clearInterval(interval)
  }, [autoSlide, slideInterval, items.length])

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, items.length - 3))
  }, [items.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, items.length - 3)) % Math.max(1, items.length - 3))
  }, [items.length])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    setLoading(true)
    fetchFeaturedItems()
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Items</h2>
        </div>
        <LoadingGrid count={4} />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Items</h2>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Items</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">No items available yet.</p>
        </div>
      </div>
    )
  }

  const showNavigation = items.length > 4

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Items</h2>
        {showNavigation && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={items.length <= 4}
              aria-label="Previous items"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={items.length <= 4}
              aria-label="Next items"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: showNavigation ? `translateX(-${currentIndex * 25}%)` : "translateX(0)",
          }}
        >
          {items.map((item: any) => (
            <div
              key={item._id}
              className={`${showNavigation ? "w-1/4" : "w-full md:w-1/2 lg:w-1/4"} flex-shrink-0 px-2`}
            >
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator for mobile */}
      {showNavigation && (
        <div className="flex justify-center mt-4 space-x-2 md:hidden">
          {Array.from({ length: Math.max(1, items.length - 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentIndex === index ? "bg-green-600" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
