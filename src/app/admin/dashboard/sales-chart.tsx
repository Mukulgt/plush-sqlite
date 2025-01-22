'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'

interface SalesData {
  month: string
  revenue: number
  orders: number
}

export default function SalesChart({ data }: { data: SalesData[] }) {
  const formattedData = data.map((item) => ({
    ...item,
    month: format(new Date(item.month), 'MMM yyyy'),
  }))

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            tickMargin={10}
            tickFormatter={(value) => `₹${value}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            formatter={(value, name) => [
              name === 'revenue' ? `₹${value}` : value,
              name === 'revenue' ? 'Revenue' : 'Orders',
            ]}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="revenue"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
            name="orders"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
