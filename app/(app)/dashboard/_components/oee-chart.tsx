"use client"

import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
} from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const data = [
  { date: "01/02", oee: 72 },
  { date: "02/02", oee: 75 },
  { date: "03/02", oee: 80 },
  { date: "04/02", oee: 78 },
  { date: "05/02", oee: 82 },
]

export function OeeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>OEE ao longo do tempo</CardTitle>
      </CardHeader>

      <CardContent className="h-[300px]">
        <AreaChart width={800} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <Tooltip />

          <Area
            type="monotone"
            dataKey="oee"
            stroke="var(--primary)"
            fill="var(--primary)"
            fillOpacity={0.2}
          />
        </AreaChart>
      </CardContent>
    </Card>
  )
}
