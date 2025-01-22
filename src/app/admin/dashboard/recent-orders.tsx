'use client'

import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface Order {
  id: string
  createdAt: Date
  total: number
  status: string
  user: {
    name: string
    email: string
  }
  items: Array<{
    quantity: number
    product: {
      name: string
    }
  }>
}

export default function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <Link
                href={`/admin/orders/${order.id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Order #{order.id.slice(-8)}
              </Link>
              <p className="text-sm text-gray-600">
                {formatDistanceToNow(new Date(order.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">₹{order.total}</p>
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
          </div>

          <div className="mt-2">
            <p className="text-sm text-gray-600">
              {order.user.name} ({order.user.email})
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {order.items
                .map((item) => `${item.quantity}x ${item.product.name}`)
                .join(', ')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
