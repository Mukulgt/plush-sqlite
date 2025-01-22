'use client'

import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    mainImage: string
  }
}

interface Order {
  id: string
  createdAt: Date
  total: number
  status: string
  items: OrderItem[]
}

export default function OrderHistory({ orders }: { orders: Order[] }) {
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">You haven't placed any orders yet.</p>
        <Link
          href="/products"
          className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <div
            className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer"
            onClick={() => toggleOrder(order.id)}
          >
            <div>
              <p className="font-medium">
                Order #{order.id.slice(-8)}
              </p>
              <p className="text-sm text-gray-600">
                {formatDistanceToNow(new Date(order.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <p className="font-semibold">₹{order.total}</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              {expandedOrders.includes(order.id) ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>

          {expandedOrders.includes(order.id) && (
            <div className="p-4 space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4"
                >
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={item.product.mainImage}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-grow">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ₹{item.price * item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      ₹{item.price} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
