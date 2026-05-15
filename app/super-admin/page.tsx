"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

const data = [
  {
    title: "Total Companies",
    value: "1,234",
  },
  {
    title: "Total Projects",
    value: "56",
  },
  {
    title: "Total Users",
    value: "12",
  },
  {
    title: "Total Workers",
    value: "89",
  },
  {
    title: "Active Projects",
    value: "56",
  },
  {
    title: "Total Revenue (MRR)",
    value: "$12.5M",
  },
]

export default function SuperAdminOverview() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview Dashboard</h1>
          <p className="text-sm text-slate-400">
            System-wide metrics and activity
          </p>
        </div>
        <div className="text-sm text-slate-400">System Online</div>
      </header>

      <section className="grid grid-cols-3 gap-4">
        {data.map((item) => (
          <Card key={item.title} className="w-full">
            <CardContent>
              <h2>{item.title}</h2>
              <div className="text-2xl font-semibold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-lg bg-card p-4">
        <h2 className="font-semibold">Recent System Activity</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>BuildCo Ltd added new project — 5 min ago</li>
          <li>UrbanDev Inc invited 12 new workers — 23 min ago</li>
          <li>SkyConstruct project completed — 1 hour ago</li>
        </ul>
      </section>

      <section className="flex gap-4">
        <Link
          href="/super-admin/companies"
          className="rounded-md bg-primary px-4 py-2 text-white"
        >
          Manage Companies
        </Link>
        <Link
          href="/super-admin/projects"
          className="rounded-md bg-secondary px-4 py-2 text-white"
        >
          Manage Projects
        </Link>
      </section>
    </div>
  )
}
