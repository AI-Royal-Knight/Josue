import React from "react"
import { Card, CardContent } from "../ui/card"

type StatCard = {
  title: string
  value: React.ReactNode
}

type StatCardsProps = {
  stats?: StatCard[]
}

export default function StatCards({ stats = [] }: StatCardsProps) {
  return (
    <section className="flex gap-16 rounded-lg bg-card">
      {Array.isArray(stats) &&
        stats.map((item) => (
          <Card key={item.title} className="w-full">
            <CardContent>
              <h2>{item.title}</h2>
              <div className="text-2xl font-semibold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
    </section>
  )
}
