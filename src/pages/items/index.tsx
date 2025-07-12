"use client"

import type React from "react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { api } from "@/lib/api"
import { ItemCard } from "@/components/ItemCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LoadingGrid } from "@/components/LoadingSpinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, Filter, X, AlertTriangle } from "lucide-react"
import { APP_CONFIG } from "@/lib/constants"

export default function ItemsPage() {
  const router = useRouter()
  const { query } = router

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  })

  // Filter states
  const [search, setSearch] = useState((query.search as string) || "")
  const [category, setCategory] = useState((query.category as string) || "all")
  const [condition, setCondition] = useState((query.condition as string) || "all")
  const [sortBy, setSortBy] = useState((query.sortBy as string) || "createdAt")
  const [sortOrder, setSortOrder] = useState((query.sortOrder as string) || "desc")
  const [currentPage, setCurrentPage] = useState(Number(query.page) || 1)

  // Debounced search
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.getItems({
        page: currentPage,
        limit: APP_CONFIG.PAGINATION.DEFAULT_LIMIT,
        search: search || undefined,
        category: category === "all" ? undefined : category,
        condition: condition === "all" ? undefined : condition,
        // sortBy : sortBy,
        // sortOrder: sortOrder as "asc" | "desc",
      })

      setItems(response.data.items)
      setPagination(
        response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false,
        },
      )
    } catch (error: any) {
      console.error("Failed to fetch items:", error)
      setError(error.message || "Failed to load items")
    } finally {
      setLoading(false)
    }
  }, [search, category, condition, sortBy, sortOrder, currentPage])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Update URL params
  useEffect(() => {
    const params: any = {}
    if (search) params.search = search
    if (category !== "all") params.category = category
    if (condition !== "all") params.condition = condition
    if (sortBy !== "createdAt") params.sortBy = sortBy
    if (sortOrder !== "desc") params.sortOrder = sortOrder
    if (currentPage !== 1) params.page = currentPage.toString()

    router.replace(
      {
        pathname: router.pathname,
        query: params,
      },
      undefined,
      { shallow: true },
    )
  }, [search, category, condition, sortBy, sortOrder, currentPage, router])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchInput("")
    setSearch("")
    setCategory("all")
    setCondition("all")
    setSortBy("createdAt")
    setSortOrder("desc")
    setCurrentPage(1)
  }

  const hasActiveFilters = useMemo(() => {
    return search || category !== "all" || condition !== "all" || sortBy !== "createdAt" || sortOrder !== "desc"
  }, [search, category, condition, sortBy, sortOrder])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const renderPaginationItems = () => {
    const items = []
    const { currentPage, totalPages } = pagination

    // Always show first page
    if (totalPages > 0) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink size="icon" onClick={() => handlePageChange(1)} isActive={currentPage === 1}>
            1
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink size="icon" onClick={() => handlePageChange(i)} isActive={currentPage === i}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis2">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink size="icon" onClick={() => handlePageChange(totalPages)} isActive={currentPage === totalPages}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return items
  }

  return (
    <>
      <Head>
        <title>Browse Items - ReWear</title>
        <meta name="description" content="Browse and discover sustainable fashion items from the ReWear community" />
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
              <BreadcrumbPage>Browse Items</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Browse Items</h1>
            {pagination.totalItems > 0 && (
              <p className="text-gray-600">
                {pagination.totalItems} item{pagination.totalItems !== 1 ? "s" : ""} found
              </p>
            )}
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search items..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {APP_CONFIG.CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {APP_CONFIG.CONDITIONS.map((cond) => (
                    <SelectItem key={cond} value={cond}>
                      {cond.charAt(0).toUpperCase() + cond.slice(1).replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [newSortBy, newSortOrder] = value.split("-")
                  setSortBy(newSortBy)
                  setSortOrder(newSortOrder)
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="pointValue-desc">Highest Points</SelectItem>
                  <SelectItem value="pointValue-asc">Lowest Points</SelectItem>
                  <SelectItem value="views-desc">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Active filters display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {search && (
                  <Badge variant="secondary">
                    Search: {search}
                    <button onClick={() => setSearchInput("")} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {category !== "all" && (
                  <Badge variant="secondary">
                    Category: {category}
                    <button onClick={() => setCategory("all")} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {condition !== "all" && (
                  <Badge variant="secondary">
                    Condition: {condition}
                    <button onClick={() => setCondition("all")} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchItems}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Items Grid */}
        {loading ? (
          <LoadingGrid count={12} />
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found matching your criteria.</p>
            <p className="text-gray-400 mb-4">Try adjusting your search or filters.</p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {items.map((item: any) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>

            {/* Enhanced Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                    size="icon"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      className={pagination.hasPrev ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                    />
                  </PaginationItem>

                  {renderPaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      size="icon"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      className={pagination.hasNext ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </>
  )
}
