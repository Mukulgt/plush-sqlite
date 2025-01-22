import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json()
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')
    let userId: string | null = null

    if (token) {
      try {
        const user = await verifyJWT(token.value)
        userId = user.id
      } catch (error) {
        // Invalid token, continue as anonymous view
      }
    }

    const view = await prisma.productView.create({
      data: {
        productId,
        userId,
        userAgent: request.headers.get('user-agent') || undefined,
        referrer: request.headers.get('referer') || undefined,
      },
    })

    // Update product view count
    await prisma.product.update({
      where: { id: productId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json(view)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyJWT(request)
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const period = searchParams.get('period') || '7d'

    let startDate = new Date()
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
    }

    const views = await prisma.productView.groupBy({
      by: ['createdAt'],
      where: {
        productId,
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    })

    return NextResponse.json(views)
  } catch (error) {
    if (error instanceof NextResponse) return error
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
