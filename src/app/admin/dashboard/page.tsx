import { prisma } from '@/lib/prisma'
import { BarChart, DollarSign, Package, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Suspense } from 'react'
import StatsCard from './stats-card'
import RecentOrders from './recent-orders'
import SalesChart from './sales-chart'

export default async function AdminDashboard() {
  const [
    totalRevenue,
    totalOrders,
    totalProducts,
    lowStockProducts,
    recentOrders,
    monthlySales,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: 'COMPLETED' },
    }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.product.findMany({
      where: { inventory: { lte: 5 } },
      take: 5,
      orderBy: { inventory: 'asc' },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    }),
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM(total) as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `,
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value={`₹${totalRevenue._sum.total || 0}`}
          icon={DollarSign}
          description="Lifetime revenue"
        />
        <StatsCard
          title="Total Orders"
          value={totalOrders.toString()}
          icon={ShoppingCart}
          description="All time orders"
        />
        <StatsCard
          title="Total Products"
          value={totalProducts.toString()}
          icon={Package}
          description="Products in catalog"
        />
        <StatsCard
          title="Low Stock"
          value={lowStockProducts.length.toString()}
          icon={BarChart}
          description="Products low in stock"
          href="/admin/products"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              View all
            </Link>
          </div>
          <Suspense fallback={<div>Loading orders...</div>}>
            <RecentOrders orders={recentOrders} />
          </Suspense>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-6">Sales Overview</h2>
          <Suspense fallback={<div>Loading chart...</div>}>
            <SalesChart data={monthlySales} />
          </Suspense>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-6">Low Stock Alerts</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600 font-semibold">
                        {product.inventory} left
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Update Stock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
