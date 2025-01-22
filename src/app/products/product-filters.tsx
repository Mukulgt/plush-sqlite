'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface Category {
  id: string
  name: string
}

interface PriceRange {
  min: number
  max: number
}

interface ProductFiltersProps {
  categories: Category[]
  priceRange: PriceRange
  selectedCategory?: string
  selectedPriceRange?: {
    min?: number
    max?: number
  }
  selectedSort?: string
}

export default function ProductFilters({
  categories,
  priceRange,
  selectedCategory,
  selectedPriceRange,
  selectedSort,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) {
        current.delete(key)
      } else {
        current.set(key, value)
      }
    })

    router.push(`/products?${current.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Categories</h3>
        <div className="space-y-2">
          <button
            onClick={() => updateFilters({ category: undefined })}
            className={`block w-full text-left px-2 py-1 rounded ${
              !selectedCategory
                ? 'bg-blue-100 text-blue-800'
                : 'hover:bg-gray-100'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => updateFilters({ category: category.id })}
              className={`block w-full text-left px-2 py-1 rounded ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-800'
                  : 'hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Price Range</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm text-gray-600">Min</label>
              <input
                type="number"
                min={priceRange.min}
                max={priceRange.max}
                value={selectedPriceRange?.min || ''}
                onChange={(e) =>
                  updateFilters({
                    minPrice: e.target.value || undefined,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Max</label>
              <input
                type="number"
                min={priceRange.min}
                max={priceRange.max}
                value={selectedPriceRange?.max || ''}
                onChange={(e) =>
                  updateFilters({
                    maxPrice: e.target.value || undefined,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Sort By</h3>
        <select
          value={selectedSort || ''}
          onChange={(e) => updateFilters({ sort: e.target.value || undefined })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Featured</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>
    </div>
  )
}
