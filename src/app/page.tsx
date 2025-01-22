import { Suspense } from 'react'
import ProductGrid from '@/components/product-grid'
import { ProductSkeleton } from '@/components/skeletons'

export default function Home() {
  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Plushoff Store</h1>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductGrid />
      </Suspense>
    </div>
  )
}
