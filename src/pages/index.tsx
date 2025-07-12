"use client"

import Link from "next/link"
import Head from "next/head"
import { Button } from "@/components/ui/button"
import { FeaturedItems } from "@/components/FeaturedItems"
import { Recycle, Users, Shirt } from "lucide-react"

export default function HomePage() {
  return (
    <>
      <Head>
        <title>ReWear - Community Clothing Exchange</title>
        <meta
          name="description"
          content="Sustainable fashion through community clothing exchange. Swap unused garments and reduce textile waste."
        />
      </Head>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-50 to-blue-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Sustainable Fashion
                <span className="text-green-600 block">Starts Here</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Join ReWear's community clothing exchange. Swap unused garments, earn points, and help reduce textile
                waste while refreshing your wardrobe sustainably.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/items">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Swapping
                  </Button>
                </Link>
                <Link href="/items">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                    Browse Items
                  </Button>
                </Link>
                <Link href="/add-item">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    List an Item
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How ReWear Works</h2>
              <p className="text-lg text-gray-600">Simple, sustainable, and rewarding clothing exchange</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shirt className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">List Your Items</h3>
                <p className="text-gray-600">
                  Upload photos and details of clothing you no longer wear. Our community will help give them a new
                  life.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect & Swap</h3>
                <p className="text-gray-600">
                  Browse items from other users. Make direct swaps or use points to get items you love.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Recycle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Reduce Waste</h3>
                <p className="text-gray-600">
                  Every swap prevents textile waste and promotes sustainable fashion. Together, we make a difference.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Items Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FeaturedItems />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-green-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Sustainable Fashion Journey?</h2>
            <p className="text-xl text-green-100 mb-8">Join thousands of users already making a difference</p>
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Join ReWear Today
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
