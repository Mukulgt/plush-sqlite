import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const json = await request.json()
    const { items, shippingAddress } = json

    if (!items?.length) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      )
    }

    // Calculate total and verify product availability
    let total = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id }
      })

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.id} not found` },
          { status: 400 }
        )
      }

      if (product.inventory < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient inventory for ${product.name}` },
          { status: 400 }
        )
      }

      total += product.price * item.quantity
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      })

      // Update inventory
      await prisma.product.update({
        where: { id: product.id },
        data: { inventory: product.inventory - item.quantity }
      })
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        status: 'PENDING',
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof NextResponse) return error
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
