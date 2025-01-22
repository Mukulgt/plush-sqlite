'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/store/cart'
import { ShoppingCart } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  mainImage: string
  inventory: number
  category: {
    id: string
    name: string
  }
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const addToCart = useCart((state) => state.addItem)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <Link href={`/products/${product.id}`}>
            <div className="relative h-64">
              <Image
                src={product.mainImage}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          </Link>

          <div className="p-4">
            <Link href={`/products/${product.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold text-gray-900">
                ₹{product.price}
              </span>
              <span className="text-sm text-gray-500">
                {product.category.name}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {product.description}
            </p>

            <div className="flex justify-between items-center">
              <span
                className={`text-sm ${
                  product.inventory > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {product.inventory > 0
                  ? `${product.inventory} in stock`
                  : 'Out of stock'}
              </span>

              <button
                onClick={() => addToCart(product)}
                disabled={product.inventory === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
