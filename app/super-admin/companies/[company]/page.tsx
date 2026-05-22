"use client"

import React, { use } from "react"
import Link from "next/link"
import { AgTable } from "@/components/common/AgTable"
import type { ColDef } from "ag-grid-community"
import { Button } from "@/components/ui/button"
import BreadcrumbWithBack from "@/components/ui/breadcrumb-with-back"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStatusVariant } from "@/lib/utils"
import StatCards from "@/components/shared/stat-cards"

const data = [
  {
    title: "Total Projects",
    value: "3",
  },
  {
    title: "Total Users",
    value: "75",
  },
  {
    title: "Total Workers",
    value: "56",
  },
]

type ProjectRow = {
  id: string
  name: string
  value: string
  startDate: string
  status: string
  users: number
  workers: number
  managers?: number
  contracts?: string
}

const SAMPLE_PROJECTS: ProjectRow[] = [
  {
    id: "dt-1",
    name: "Downtown Tower Phase 1",
    value: "$12.5M",
    startDate: "2024-01-15",
    status: "Active",
    users: 85,
    workers: 120,
  },
  {
    id: "ws-1",
    name: "Westside Shopping Complex",
    value: "$8.3M",
    startDate: "2024-03-22",
    status: "Active",
    users: 62,
    workers: 85,
  },
  {
    id: "hb-1",
    name: "Heritage Building Restoration",
    value: "$6.2M",
    startDate: "2023-11-10",
    status: "Completed",
    users: 45,
    workers: 65,
  },
]

export default function CompanyPage({
  params,
}: {
  params: Promise<{ company: string }>
}) {
  const { company } = use(params)

  const columnDefs: ColDef<ProjectRow>[] = [
    { field: "name", headerName: "Project Name", minWidth: 260 },
    { field: "value", headerName: "Project Value", minWidth: 120 },
    { field: "startDate", headerName: "Start Date", minWidth: 120 },
    { field: "status", headerName: "Status", minWidth: 110, cellRenderer: (params: { value: string }) => {
        const status = params.value as string
        const variant = getStatusVariant(status)
        return <Badge variant={variant}>{status}</Badge>
      },
    },
    { field: "users", headerName: "Total Users", minWidth: 110 },
    { field: "workers", headerName: "Workers", minWidth: 110 },
    { headerName: "Managers", field: "managers", minWidth: 110, cellRenderer: () => "2" },
    { headerName: "Contracts", field: "contracts", minWidth: 110, cellRenderer: () => "Sara Johnson" },
    {
      headerName: "Actions",
      cellRenderer: (props: { data: ProjectRow }) => {
        return (
          <Button variant="outline" size="sm">
            <Link href={`/super-admin/companies/${company}/${props.data.id}`}>
              View Project
            </Link>
          </Button>
        )
      },
      minWidth: 140,
    },
  ]

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{company.replace(/-/g, " ")}</h1>
          <p className="text-sm text-slate-400">Company Admin Dashboard</p>
        </div>
        <div className="text-sm ">
          <div>
            <h6>Admin owner</h6>
            <h2>John Matthews</h2>
          </div>
          <div>john.matthews@example.com {<br />} +1 555-1234 </div>
        </div>
      </header>

      <StatCards stats={data} />

      <section className="flex flex-1 flex-col rounded-lg bg-card">
        <AgTable
          rowData={SAMPLE_PROJECTS}
          columnDefs={columnDefs}
          height="100%"
          pagination
          pageSize={10}
        />
      </section>
    </div>
  )
}
