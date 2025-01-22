'use client'

import { useState } from 'react'
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  WhatsApp,
  Copy,
  Check,
} from 'lucide-react'

interface ShareProductProps {
  productId: string
  productName: string
}

export default function ShareProduct({
  productId,
  productName,
}: ShareProductProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const productUrl = `${window.location.origin}/products/${productId}`
  const encodedUrl = encodeURIComponent(productUrl)
  const encodedText = encodeURIComponent(
    `Check out ${productName} on our store!`
  )

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-[#1877f2] hover:bg-[#0d65d9]',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: 'bg-[#1da1f2] hover:bg-[#0c85d0]',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'bg-[#0a66c2] hover:bg-[#084e96]',
    },
    {
      name: 'WhatsApp',
      icon: WhatsApp,
      url: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      color: 'bg-[#25d366] hover:bg-[#1da851]',
    },
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(productUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-20 p-4">
            <div className="flex flex-col space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {shareLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${link.color}`}
                  >
                    <link.icon className="w-4 h-4" />
                    <span className="text-sm">{link.name}</span>
                  </a>
                ))}
              </div>

              <div className="relative mt-4">
                <input
                  type="text"
                  value={productUrl}
                  readOnly
                  className="w-full pr-24 py-2 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-1 top-1 flex items-center gap-1 px-3 py-1 text-sm text-white bg-gray-900 rounded-md hover:bg-gray-700"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
