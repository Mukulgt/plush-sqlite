import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { type NextRequest } from 'next/server'

export async function GET() {
  try {
    const bundles = await prisma.bundle.findMany({
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
      where: {
        isActive: true,
      },
    })

    return NextResponse.json(bundles)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { name, description, discount, productIds } = await request.json()

    const bundle = await prisma.bundle.create({
      data: {
        name,
        description,
        discount,
        isActive: true,
        products: {
          create: productIds.map((productId: string) => ({
            productId,
          })),
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
    })

    return NextResponse.json(bundle)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
