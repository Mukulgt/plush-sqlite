'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface VariantOption {
  name: string
  value: string
}

interface Variant {
  id: string
  sku: string
  price: number
  inventory: number
  options: VariantOption[]
}

interface ProductVariantsProps {
  productId: string
  onVariantSelect: (variant: Variant | null) => void
}

export default function ProductVariants({
  productId,
  onVariantSelect,
}: ProductVariantsProps) {
  const [variants, setVariants] = useState<Variant[]>([])
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/products/${productId}/variants`)
        if (!res.ok) throw new Error('Failed to fetch variants')
        const data = await res.json()
        setVariants(data)
      } catch (err) {
        setError('Failed to load product variants')
        console.error('Error fetching variants:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVariants()
  }, [productId])

  // Get unique option names
  const optionNames = Array.from(
    new Set(
      variants.flatMap((variant) =>
        variant.options.map((option) => option.name)
      )
    )
  )

  // Get available values for each option name
  const getOptionValues = (optionName: string) => {
    return Array.from(
      new Set(
        variants
          .flatMap((variant) => variant.options)
          .filter((option) => option.name === optionName)
          .map((option) => option.value)
      )
    )
  }

  // Find matching variant based on selected options
  useEffect(() => {
    if (Object.keys(selectedOptions).length === optionNames.length) {
      const matchingVariant = variants.find((variant) =>
        variant.options.every(
          (option) => selectedOptions[option.name] === option.value
        )
      )
      onVariantSelect(matchingVariant || null)
    } else {
      onVariantSelect(null)
    }
  }, [selectedOptions, variants, optionNames.length, onVariantSelect])

  const handleOptionSelect = (name: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    )
  }

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  if (variants.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {optionNames.map((optionName) => (
        <div key={optionName}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {optionName}
          </label>
          <div className="flex flex-wrap gap-2">
            {getOptionValues(optionName).map((value) => (
              <button
                key={value}
                onClick={() => handleOptionSelect(optionName, value)}
                className={`px-4 py-2 text-sm font-medium rounded-md border ${
                  selectedOptions[optionName] === value
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(selectedOptions).length === optionNames.length && (
        <div className="text-sm text-gray-600">
          Selected: {Object.entries(selectedOptions)
            .map(([name, value]) => `${name}: ${value}`)
            .join(', ')}
        </div>
      )}
    </div>
  )
}
