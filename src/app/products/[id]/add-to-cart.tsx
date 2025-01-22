'use client'

import { useState } from 'react'
import { useCart } from '@/lib/store/cart'
import { Minus, Plus, ShoppingCart } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  inventory: number
  mainImage: string
}

export default function AddToCart({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)
  const addToCart = useCart((state) => state.addItem)

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(product.inventory, prev + 1))
  }

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity,
    })
  }

  if (product.inventory === 0) {
    return (
      <button
        disabled
        className="px-6 py-3 text-sm font-medium text-gray-500 bg-gray-100 rounded-md cursor-not-allowed"
      >
        Out of Stock
      </button>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center border border-gray-300 rounded-md">
        <button
          onClick={decreaseQuantity}
          disabled={quantity === 1}
          className="p-2 hover:bg-gray-100 disabled:opacity-50"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="px-4 py-2 text-center min-w-[3rem]">
          {quantity}
        </span>
        <button
          onClick={increaseQuantity}
          disabled={quantity === product.inventory}
          className="p-2 hover:bg-gray-100 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        <ShoppingCart className="w-4 h-4" />
        Add to Cart
      </button>
    </div>
  )
}
