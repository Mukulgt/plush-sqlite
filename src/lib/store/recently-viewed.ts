import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Product {
  id: string
  name: string
  price: number
  mainImage: string
  category: {
    name: string
  }
}

interface RecentlyViewedStore {
  items: Product[]
  addItem: (product: Product) => void
  clearItems: () => void
}

export const useRecentlyViewed = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          // Remove if already exists
          const filtered = state.items.filter(
            (item) => item.id !== product.id
          )
          // Add to start of array and limit to 12 items
          return {
            items: [product, ...filtered].slice(0, 12),
          }
        }),
      clearItems: () => set({ items: [] }),
    }),
    {
      name: 'recently-viewed',
    }
  )
)
