'use client'

import { Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ProductActions({ productId }: { productId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete product')
      }

      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete product')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <Link
        href={`/admin/products/${productId}/edit`}
        className="text-blue-600 hover:text-blue-700"
      >
        <Edit className="w-4 h-4" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
