import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'
import { ShoppingCart, User } from 'lucide-react'
import { useCart } from '@/store/cart'

export default async function Header() {
  const session = await auth()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Plushoff Store
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/products" className="hover:text-gray-600">
            Products
          </Link>
          <Link href="/categories" className="hover:text-gray-600">
            Categories
          </Link>
          
          {session ? (
            <>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" className="hover:text-gray-600">
                  Admin
                </Link>
              )}
              <Link href="/orders" className="hover:text-gray-600">
                Orders
              </Link>
              <form action={async () => { 'use server'; await signOut() }}>
                <button type="submit" className="hover:text-gray-600">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link href="/auth/login" className="hover:text-gray-600">
              Login
            </Link>
          )}

          <Link href="/cart" className="relative">
            <ShoppingCart className="w-6 h-6" />
            <CartBadge />
          </Link>
        </nav>
      </div>
    </header>
  )
}

function CartBadge() {
  'use client'
  const items = useCart((state) => state.items)
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  if (itemCount === 0) return null

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {itemCount}
    </span>
  )
}
