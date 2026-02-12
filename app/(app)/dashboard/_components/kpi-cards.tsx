"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function KpiCards() {
  const data = {
    oee: 78,
    availability: 85,
    performance: 82,
    quality: 93,
  }

  const cards = [
    { label: "OEE", value: data.oee },
    { label: "Disponibilidade", value: data.availability },
    { label: "Performance", value: data.performance },
    { label: "Qualidade", value: data.quality },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {card.value}%
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
