'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingCart, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '@/lib/store/cart'

interface Product {
  id: string
  name: string
  description: string
  price: number
  mainImage: string
  inventory: number
  rating: number
  reviewCount: number
  category: {
    id: string
    name: string
  }
  reviews: Array<{
    rating: number
  }>
}

export default function ProductComparison({
  products,
}: {
  products: Product[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const addToCart = useCart((state) => state.addItem)

  const removeProduct = (productId: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    const products = current.get('products')?.split(',') || []
    const updated = products.filter((id) => id !== productId)

    if (updated.length === 0) {
      router.push('/products')
    } else {
      current.set('products', updated.join(','))
      router.push(`/compare?${current.toString()}`)
    }
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      mainImage: product.mainImage,
      inventory: product.inventory,
      quantity: 1,
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Feature
            </th>
            {products.map((product) => (
              <th
                key={product.id}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[300px]"
              >
                <div className="flex justify-between items-start">
                  <span>{product.name}</span>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Image
            </td>
            {products.map((product) => (
              <td key={product.id} className="px-6 py-4">
                <Link
                  href={`/products/${product.id}`}
                  className="block relative aspect-square w-48"
                >
                  <Image
                    src={product.mainImage}
                    alt={product.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </Link>
              </td>
            ))}
          </tr>

          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Price
            </td>
            {products.map((product) => (
              <td
                key={product.id}
                className="px-6 py-4 text-lg font-bold text-gray-900"
              >
                ₹{product.price}
              </td>
            ))}
          </tr>

          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Category
            </td>
            {products.map((product) => (
              <td key={product.id} className="px-6 py-4 text-sm text-gray-600">
                {product.category.name}
              </td>
            ))}
          </tr>

          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Rating
            </td>
            {products.map((product) => (
              <td key={product.id} className="px-6 py-4">
                <div className="flex items-center gap-2">
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
              </td>
            ))}
          </tr>

          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Stock
            </td>
            {products.map((product) => (
              <td key={product.id} className="px-6 py-4">
                <span
                  className={`text-sm ${
                    product.inventory > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {product.inventory > 0
                    ? `${product.inventory} in stock`
                    : 'Out of stock'}
                </span>
              </td>
            ))}
          </tr>

          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Description
            </td>
            {products.map((product) => (
              <td key={product.id} className="px-6 py-4">
                <p className="text-sm text-gray-600">{product.description}</p>
              </td>
            ))}
          </tr>

          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Actions
            </td>
            {products.map((product) => (
              <td key={product.id} className="px-6 py-4">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.inventory === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
