'use client'

import { useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

interface StockAlertProps {
  productId: string
  isSubscribed: boolean
}

export default function StockAlert({
  productId,
  isSubscribed: initialSubscribed,
}: StockAlertProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async () => {
    try {
      setIsLoading(true)
      setError('')

      const res = await fetch('/api/notifications/stock-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to subscribe')
      }

      setIsSubscribed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    try {
      setIsLoading(true)
      setError('')

      const res = await fetch(
        `/api/notifications/stock-alert?productId=${productId}`,
        {
          method: 'DELETE',
        }
      )

      if (!res.ok) {
        throw new Error('Failed to unsubscribe')
      }

      setIsSubscribed(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md ${
          isSubscribed
            ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            : 'text-white bg-blue-600 hover:bg-blue-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isSubscribed ? (
          <>
            <BellOff className="w-4 h-4" />
            Unsubscribe from Alerts
          </>
        ) : (
          <>
            <Bell className="w-4 h-4" />
            Notify When Available
          </>
        )}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
