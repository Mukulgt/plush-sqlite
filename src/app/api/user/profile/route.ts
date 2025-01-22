import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { type NextRequest } from 'next/server'
import { hashPassword } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    if (error instanceof NextResponse) return error
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const json = await request.json()
    const { name, currentPassword, newPassword } = json

    const updateData: any = {}
    
    if (name) {
      updateData.name = name
    }

    if (currentPassword && newPassword) {
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true }
      })

      if (!currentUser?.password) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 400 }
        )
      }

      const isValid = await bcrypt.compare(currentPassword, currentUser.password)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      updateData.password = await hashPassword(newPassword)
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof NextResponse) return error
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
