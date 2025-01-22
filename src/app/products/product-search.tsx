'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/useDebounce'

export default function ProductSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    
    if (debouncedSearch) {
      current.set('search', debouncedSearch)
    } else {
      current.delete('search')
    }

    router.push(`/products?${current.toString()}`)
  }, [debouncedSearch, router, searchParams])

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  )
}
