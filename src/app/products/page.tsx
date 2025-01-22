import { prisma } from '@/lib/prisma'
import ProductGrid from './product-grid'
import ProductFilters from './product-filters'
import { Suspense } from 'react'
import ProductSearch from './product-search'

interface SearchParams {
  category?: string
  search?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { category, search, minPrice, maxPrice, sort } = searchParams

  const where = {
    ...(category ? { categoryId: category } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
            ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
          },
        }
      : {}),
  }

  const orderBy = sort
    ? sort === 'price_asc'
      ? { price: 'asc' }
      : sort === 'price_desc'
      ? { price: 'desc' }
      : sort === 'newest'
      ? { createdAt: 'desc' }
      : undefined
    : undefined

  const [products, categories, priceRange] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        gallery: true,
      },
    }),
    prisma.category.findMany(),
    prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true },
    }),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <Suspense>
          <ProductSearch />
        </Suspense>

        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-1">
            <ProductFilters
              categories={categories}
              priceRange={{
                min: priceRange._min.price || 0,
                max: priceRange._max.price || 1000,
              }}
              selectedCategory={category}
              selectedPriceRange={{
                min: minPrice ? parseFloat(minPrice) : undefined,
                max: maxPrice ? parseFloat(maxPrice) : undefined,
              }}
              selectedSort={sort}
            />
          </div>

          <div className="col-span-3">
            <ProductGrid products={products} />
          </div>
        </div>
      </div>
    </div>
  )
}
