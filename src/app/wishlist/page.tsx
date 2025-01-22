import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { requireAuth } from '@/lib/auth'
import WishlistItems from './wishlist-items'

export default async function WishlistPage() {
  const cookieStore = cookies()
  const user = await requireAuth(cookieStore)

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            Your wishlist is empty
          </p>
          <a
            href="/products"
            className="text-blue-600 hover:text-blue-700"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <WishlistItems items={wishlistItems} />
      )}
    </div>
  )
}
