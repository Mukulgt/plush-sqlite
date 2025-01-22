'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  mainImage: string
  rating: number
  reviewCount: number
  category: {
    name: string
  }
}

export default function ProductRecommendations({
  productId,
}: {
  productId: string
}) {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch(
          `/api/products/${productId}/recommendations`
        )
        if (!res.ok) throw new Error('Failed to fetch recommendations')
        const data = await res.json()
        setRecommendations(data)
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [productId])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md p-4 animate-pulse"
          >
            <div className="aspect-square bg-gray-200 rounded-md mb-4" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {recommendations.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="relative aspect-square">
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {product.category.name}
            </p>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= product.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({product.reviewCount})
              </span>
            </div>

            <p className="text-lg font-bold text-gray-900">
              ₹{product.price}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
