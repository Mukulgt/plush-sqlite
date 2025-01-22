'use client'

import { formatDistanceToNow } from 'date-fns'
import { Star } from 'lucide-react'
import ReviewForm from './review-form'
import { useState } from 'react'

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: Date
  user: {
    name: string
  }
}

interface ReviewListProps {
  productId: string
  reviews: Review[]
  userHasReviewed: boolean
}

export default function ReviewList({
  productId,
  reviews: initialReviews,
  userHasReviewed,
}: ReviewListProps) {
  const [reviews, setReviews] = useState(initialReviews)

  const onReviewAdded = (newReview: Review) => {
    setReviews([newReview, ...reviews])
  }

  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= averageRating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-semibold">
          {averageRating.toFixed(1)}
        </span>
        <span className="text-gray-600">
          ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
        </span>
      </div>

      {!userHasReviewed && (
        <ReviewForm productId={productId} onReviewAdded={onReviewAdded} />
      )}

      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-200 pb-6 last:border-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{review.user.name}</span>
              </div>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(review.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="text-gray-600">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
