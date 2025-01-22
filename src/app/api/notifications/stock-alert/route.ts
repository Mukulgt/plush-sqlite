import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { productId } = await request.json()

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if already subscribed
    const existing = await prisma.stockAlert.findFirst({
      where: {
        userId: user.id,
        productId,
        isActive: true,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already subscribed to stock alerts' },
        { status: 400 }
      )
    }

    const alert = await prisma.stockAlert.create({
      data: {
        userId: user.id,
        productId,
        isActive: true,
      },
    })

    return NextResponse.json(alert)
  } catch (error) {
    if (error instanceof NextResponse) return error
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    await prisma.stockAlert.updateMany({
      where: {
        userId: user.id,
        productId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
