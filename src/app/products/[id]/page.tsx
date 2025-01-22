import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import AddToCart from './add-to-cart'
import ProductGallery from './product-gallery'
import ReviewList from '@/components/reviews/review-list'
import ShareProduct from '@/components/products/share-product'
import RecentlyViewed from '@/components/products/recently-viewed'
import ProductRecommendations from '@/components/products/product-recommendations'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/auth'

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const [product, categories, bundles] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        gallery: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    }),
    prisma.category.findMany(),
    prisma.bundle.findMany({
      where: {
        isActive: true,
        products: {
          some: {
            productId: params.id,
          },
        },
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    }),
  ])

  if (!product) {
    notFound()
  }

  // Check if current user has reviewed this product
  let userHasReviewed = false
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')
  
  if (token) {
    try {
      const user = await verifyJWT(token.value)
      if (user) {
        userHasReviewed = product.reviews.some(
          (review) => review.userId === user.id
        )
      }
    } catch (error) {
      // Token invalid or expired
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <div className="relative aspect-square">
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
          {product.gallery.length > 0 && (
            <ProductGallery images={product.gallery} />
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                {product.category.name}
              </p>
            </div>
            <ShareProduct
              productId={product.id}
              productName={product.name}
            />
          </div>

          <p className="text-gray-600">{product.description}</p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                ₹{product.price}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {product.inventory > 0
                  ? `${product.inventory} in stock`
                  : 'Out of stock'}
              </p>
            </div>
            <AddToCart product={product} />
          </div>
        </div>
      </div>

      {bundles.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Available in Bundles</h2>
          <div className="space-y-4">
            {bundles.map((bundle) => (
              <ProductBundle key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-12">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
        <ReviewList
          productId={product.id}
          reviews={product.reviews}
          userHasReviewed={userHasReviewed}
        />
      </div>

      <div className="border-t border-gray-200 pt-12">
        <ProductRecommendations productId={product.id} />
      </div>

      <div className="border-t border-gray-200 pt-12">
        <RecentlyViewed />
      </div>
    </div>
  )
}
