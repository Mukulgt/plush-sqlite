'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, ChevronRight } from 'lucide-react'
import { useCart } from '@/lib/store/cart'

interface Product {
  id: string
  name: string
  price: number
  mainImage: string
  inventory: number
  category: {
    name: string
  }
}

interface BundleProduct {
  product: Product
}

interface Bundle {
  id: string
  name: string
  description: string
  discount: number
  products: BundleProduct[]
}

export default function ProductBundle({ bundle }: { bundle: Bundle }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const addToCart = useCart((state) => state.addItem)

  const originalPrice = bundle.products.reduce(
    (sum, { product }) => sum + product.price,
    0
  )
  const discountedPrice = originalPrice * (1 - bundle.discount / 100)

  const handleAddToCart = () => {
    bundle.products.forEach(({ product }) => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price * (1 - bundle.discount / 100),
        mainImage: product.mainImage,
        inventory: product.inventory,
        quantity: 1,
      })
    })
  }

  const isOutOfStock = bundle.products.some(
    ({ product }) => product.inventory === 0
  )

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {bundle.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Save {bundle.discount}%
          </p>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-gray-600 mb-4">{bundle.description}</p>

          <div className="space-y-4">
            {bundle.products.map(({ product }) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={product.mainImage}
                    alt={product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-medium text-gray-900">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {product.category.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900 font-medium">
                    ₹{product.price}
                  </p>
                  <p
                    className={`text-sm ${
                      product.inventory > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {product.inventory > 0
                      ? `${product.inventory} in stock`
                      : 'Out of stock'}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 line-through">
                ₹{originalPrice}
              </p>
              <p className="text-lg font-bold text-gray-900">
                ₹{discountedPrice.toFixed(2)}
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              Add Bundle to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
