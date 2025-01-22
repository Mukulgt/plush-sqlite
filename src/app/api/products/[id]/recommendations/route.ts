import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { type NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get recommendations based on:
    // 1. Same category
    // 2. Similar price range
    // 3. Similar rating
    const recommendations = await prisma.product.findMany({
      where: {
        id: { not: params.id },
        categoryId: product.categoryId,
        price: {
          gte: product.price * 0.7, // Within 30% price range
          lte: product.price * 1.3,
        },
        ...(product.rating
          ? {
              rating: {
                gte: product.rating - 1,
                lte: product.rating + 1,
              },
            }
          : {}),
      },
      include: {
        category: true,
      },
      orderBy: [
        {
          rating: 'desc',
        },
        {
          reviewCount: 'desc',
        },
      ],
      take: 4,
    })

    // If we don't have enough recommendations, get more from the same category
    if (recommendations.length < 4) {
      const moreRecommendations = await prisma.product.findMany({
        where: {
          id: {
            not: params.id,
            notIn: recommendations.map((p) => p.id),
          },
          categoryId: product.categoryId,
        },
        include: {
          category: true,
        },
        orderBy: [
          {
            rating: 'desc',
          },
          {
            reviewCount: 'desc',
          },
        ],
        take: 4 - recommendations.length,
      })

      recommendations.push(...moreRecommendations)
    }

    // If we still don't have enough, get popular products from other categories
    if (recommendations.length < 4) {
      const popularProducts = await prisma.product.findMany({
        where: {
          id: {
            not: params.id,
            notIn: recommendations.map((p) => p.id),
          },
        },
        include: {
          category: true,
        },
        orderBy: [
          {
            rating: 'desc',
          },
          {
            reviewCount: 'desc',
          },
        ],
        take: 4 - recommendations.length,
      })

      recommendations.push(...popularProducts)
    }

    return NextResponse.json(recommendations)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
