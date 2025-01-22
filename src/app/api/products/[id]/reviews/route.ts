import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { type NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: params.id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const json = await request.json()
    const { rating, comment } = json

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: params.id,
        userId: user.id,
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        productId: params.id,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    // Update product rating
    const productReviews = await prisma.review.findMany({
      where: { productId: params.id },
      select: { rating: true },
    })

    const averageRating =
      productReviews.reduce((acc, curr) => acc + curr.rating, 0) /
      productReviews.length

    await prisma.product.update({
      where: { id: params.id },
      data: {
        rating: averageRating,
        reviewCount: productReviews.length,
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    if (error instanceof NextResponse) return error
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
