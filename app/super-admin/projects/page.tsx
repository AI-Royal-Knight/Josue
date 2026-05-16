"use client"

import React, { useState } from "react"
import { AgTable } from "@/components/common/AgTable"
import type { ColDef } from "ag-grid-community"
import BreadcrumbWithBack from "@/components/ui/breadcrumb-with-back"
import { Input } from "@/components/ui/input"

type ProjectRow = {
  id: string
  name: string
  company: string
  value: string
  users: number
  workers: number
  status: string
}

const SAMPLE_PROJECTS: ProjectRow[] = [
  {
    id: "dt-1",
    name: "Downtown Tower Phase 1",
    company: "BuildCo Ltd",
    value: "$12.5M",
    users: 85,
    workers: 120,
    status: "Active",
  },
  {
    id: "rv-1",
    name: "Riverside Mall Construction",
    company: "UrbanDev Inc",
    value: "$18.3M",
    users: 112,
    workers: 180,
    status: "Active",
  },
  {
    id: "ms-1",
    name: "Metro Station Expansion",
    company: "SkyConstruct",
    value: "$25.7M",
    users: 145,
    workers: 250,
    status: "Active",
  },
  {
    id: "hb-1",
    name: "Heritage Building Restoration",
    company: "PrimeDevelopers",
    value: "$6.2M",
    users: 45,
    workers: 65,
    status: "Completed",
  },
]

export default function ProjectsPage() {
  const [rows] = useState<ProjectRow[]>(SAMPLE_PROJECTS)

  const columnDefs: ColDef<ProjectRow>[] = [
    { field: "name", headerName: "Project Name", minWidth: 260 },
    { field: "company", headerName: "Company", minWidth: 180 },
    { field: "value", headerName: "Value", minWidth: 120 },
    { field: "users", headerName: "Users", minWidth: 100 },
    { field: "workers", headerName: "Workers", minWidth: 100 },
    { field: "status", headerName: "Status", minWidth: 120 },
  ]

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-6">

      <header>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-sm text-slate-400">View and manage all projects</p>
      </header>

      <div className="rounded-lg bg-card">
        <div className="mb-4">
          <Input placeholder="Search projects or companies..." />
        </div>

        <div className="flex flex-1 flex-col">
          <AgTable
            rowData={rows}
            columnDefs={columnDefs}
            height="70vh"
            pagination
            pageSize={10}
          />
        </div>
      </div>
    </div>
  )
}
