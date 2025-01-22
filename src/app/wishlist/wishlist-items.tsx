'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/store/cart'

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    description: string
    price: number
    mainImage: string
    inventory: number
    category: {
      name: string
    }
  }
}

export default function WishlistItems({
  items: initialItems,
}: {
  items: WishlistItem[]
}) {
  const [items, setItems] = useState(initialItems)
  const addToCart = useCart((state) => state.addItem)

  const removeFromWishlist = async (itemId: string) => {
    try {
      const res = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to remove from wishlist')
      }

      setItems((prev) =>
        prev.filter((item) => item.id !== itemId)
      )
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
    }
  }

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      mainImage: item.product.mainImage,
      inventory: item.product.inventory,
      quantity: 1,
    })
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow-md p-6 flex gap-6"
        >
          <Link
            href={`/products/${item.product.id}`}
            className="relative aspect-square w-32 flex-shrink-0"
          >
            <Image
              src={item.product.mainImage}
              alt={item.product.name}
              fill
              className="object-cover rounded-md"
            />
          </Link>

          <div className="flex-grow">
            <div className="flex justify-between">
              <div>
                <Link
                  href={`/products/${item.product.id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-gray-600">
                  {item.product.category.name}
                </p>
              </div>
              <p className="text-lg font-bold">
                ₹{item.product.price}
              </p>
            </div>

            <p className="text-gray-600 mt-2 line-clamp-2">
              {item.product.description}
            </p>

            <div className="flex items-center justify-between mt-4">
              <p
                className={`text-sm ${
                  item.product.inventory > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {item.product.inventory > 0
                  ? `${item.product.inventory} in stock`
                  : 'Out of stock'}
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={item.product.inventory === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
