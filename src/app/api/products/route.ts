import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { type NextRequest } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const products = await prisma.product.findMany({
      where: {
        ...(category ? { categoryId: category } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } }
          ]
        } : {})
      },
      include: {
        category: true,
        gallery: true,
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const json = await request.json()
    const product = await prisma.product.create({
      data: {
        name: json.name,
        description: json.description,
        price: json.price,
        mainImage: json.mainImage,
        categoryId: json.categoryId,
        inventory: json.inventory,
        gallery: {
          create: json.gallery.map((url: string) => ({ url }))
        }
      },
      include: {
        category: true,
        gallery: true,
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof NextResponse) return error
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
