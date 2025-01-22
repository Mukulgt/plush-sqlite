import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductComparison from './product-comparison'

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { products?: string }
}) {
  const productIds = searchParams.products?.split(',') || []

  if (productIds.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Compare Products</h1>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            Select products to compare from the product pages
          </p>
          <a
            href="/products"
            className="text-blue-600 hover:text-blue-700"
          >
            Browse Products
          </a>
        </div>
      </div>
    )
  }

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    include: {
      category: true,
      reviews: true,
    },
  })

  if (products.length === 0) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Compare Products</h1>
      <ProductComparison products={products} />
    </div>
  )
}
