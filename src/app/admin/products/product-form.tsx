'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X } from 'lucide-react'

type ProductFormProps = {
  initialData?: {
    id: string
    name: string
    description: string
    price: number
    mainImage: string
    inventory: number
    categoryId: string
    gallery: { id: string; url: string }[]
  }
  categories: {
    id: string
    name: string
  }[]
}

export default function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [mainImage, setMainImage] = useState(initialData?.mainImage || '')
  const [gallery, setGallery] = useState<string[]>(
    initialData?.gallery.map(img => img.url) || []
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      mainImage,
      inventory: parseInt(formData.get('inventory') as string),
      categoryId: formData.get('categoryId'),
      gallery,
    }

    try {
      const url = initialData
        ? `/api/products/${initialData.id}`
        : '/api/products'
      const method = initialData ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error('Failed to save product')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to save product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real app, you would upload to a cloud storage service
    // For this example, we'll use a fake URL
    const fakeUrl = URL.createObjectURL(file)
    
    if (isMain) {
      setMainImage(fakeUrl)
    } else {
      setGallery([...gallery, fakeUrl])
    }
  }

  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          name="name"
          defaultValue={initialData?.name}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={initialData?.description}
          required
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            name="price"
            defaultValue={initialData?.price}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Inventory
          </label>
          <input
            type="number"
            name="inventory"
            defaultValue={initialData?.inventory}
            required
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          name="categoryId"
          defaultValue={initialData?.categoryId}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Main Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, true)}
          className="mt-1 block w-full"
        />
        {mainImage && (
          <div className="mt-2">
            <Image
              src={mainImage}
              alt="Main product image"
              width={200}
              height={200}
              className="rounded-md"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Gallery Images
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, false)}
          className="mt-1 block w-full"
        />
        <div className="mt-2 grid grid-cols-4 gap-4">
          {gallery.map((url, index) => (
            <div key={index} className="relative">
              <Image
                src={url}
                alt={`Gallery image ${index + 1}`}
                width={100}
                height={100}
                className="rounded-md"
              />
              <button
                type="button"
                onClick={() => removeGalleryImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}
