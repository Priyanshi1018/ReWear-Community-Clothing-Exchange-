"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ItemCardProps {
  item: {
    _id: string
    title: string
    images: string[]
    condition: string
    pointValue: number
    category: string
    uploaderId: {
      name: string
    }
  }
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/items/${item._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square relative">
          <Image
            src={item.images[0] || "/placeholder.svg?height=300&width=300"}
            alt={item.title}
            fill
            className="object-cover"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">{item.condition}</Badge>
            <span className="text-green-600 font-semibold">{item.pointValue} pts</span>
          </div>
          <p className="text-sm text-gray-600">by {item.uploaderId.name}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
