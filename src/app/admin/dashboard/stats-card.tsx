'use client'

import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  description: string
  href?: string
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  href,
}: StatsCardProps) {
  const Card = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600">{description}</p>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-75 transition-opacity">
        <Card />
      </Link>
    )
  }

  return <Card />
}
