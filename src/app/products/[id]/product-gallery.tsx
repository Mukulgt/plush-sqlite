'use client'

import Image from 'next/image'
import { useState } from 'react'

interface GalleryImage {
  id: string
  url: string
}

export default function ProductGallery({
  images,
}: {
  images: GalleryImage[]
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-4xl aspect-square">
            <Image
              src={selectedImage}
              alt="Gallery image"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(image.url)}
            className="relative aspect-square rounded-lg overflow-hidden hover:opacity-75 transition-opacity"
          >
            <Image
              src={image.url}
              alt="Gallery thumbnail"
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
