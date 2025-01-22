import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long!!'
)

export type UserSession = {
  id: string
  email: string
  name: string | null
  role: string
}

export async function signJWT(payload: UserSession) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(JWT_SECRET)

  return token
}

export async function verifyJWT(token: string): Promise<UserSession | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as UserSession
  } catch (error) {
    return null
  }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || !user.password) {
    return null
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return null
  }

  const session: UserSession = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }

  const token = await signJWT(session)
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400 // 1 day
  })

  return session
}

export async function logout() {
  cookies().delete('auth-token')
}

export async function getSession(): Promise<UserSession | null> {
  const token = cookies().get('auth-token')
  if (!token) return null

  return verifyJWT(token.value)
}

export async function requireAuth(req: NextRequest) {
  const token = req.cookies.get('auth-token')
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await verifyJWT(token.value)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return user
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}
