'use client'

import { useRecentlyViewed } from '@/lib/store/recently-viewed'
import Image from 'next/image'
import Link from 'next/link'

export default function RecentlyViewed() {
  const items = useRecentlyViewed((state) => state.items)

  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recently Viewed</h2>
        <button
          onClick={() => useRecentlyViewed.getState().clearItems()}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group"
          >
            <div className="relative aspect-square mb-2">
              <Image
                src={product.mainImage}
                alt={product.name}
                fill
                className="object-cover rounded-lg group-hover:opacity-75 transition-opacity"
              />
            </div>
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500">{product.category.name}</p>
            <p className="text-sm font-medium text-gray-900">
              ₹{product.price}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
