import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { type NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const variants = await prisma.productVariant.findMany({
      where: {
        productId: params.id,
      },
      include: {
        options: true,
      },
    })

    return NextResponse.json(variants)
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
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { sku, price, inventory, options } = await request.json()

    const variant = await prisma.productVariant.create({
      data: {
        productId: params.id,
        sku,
        price,
        inventory,
        options: {
          create: options,
        },
      },
      include: {
        options: true,
      },
    })

    return NextResponse.json(variant)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { variantId, sku, price, inventory, options } =
      await request.json()

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        sku,
        price,
        inventory,
        options: {
          deleteMany: {},
          create: options,
        },
      },
      include: {
        options: true,
      },
    })

    return NextResponse.json(variant)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const variantId = searchParams.get('variantId')

    if (!variantId) {
      return NextResponse.json(
        { error: 'Variant ID is required' },
        { status: 400 }
      )
    }

    await prisma.productVariant.delete({
      where: { id: variantId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
