"use client"

import React, { useState } from "react"
import Link from "next/link"
import { AgTable } from "@/components/common/AgTable"
import type { ColDef, ICellRendererParams } from "ag-grid-community"
import { Button } from "@/components/ui/button"
import BreadcrumbWithBack from "@/components/ui/breadcrumb-with-back"

type CompanyRow = {
  id: string
  name: string
  admin: string
  contact: string
  projects: number
  users: number
  status: string
}

const SAMPLE_COMPANIES: CompanyRow[] = [
  {
    id: "buildco",
    name: "BuildCo Ltd",
    admin: "John Matthews",
    contact: "john@buildco.com",
    projects: 12,
    users: 156,
    status: "Active",
  },
  {
    id: "urbandev",
    name: "UrbanDev Inc",
    admin: "Sarah Johnson",
    contact: "sarah@urbandev.com",
    projects: 8,
    users: 92,
    status: "Active",
  },
  {
    id: "skyconstruct",
    name: "SkyConstruct",
    admin: "Michael Chen",
    contact: "michael@skyconstruct.com",
    projects: 15,
    users: 234,
    status: "Active",
  },
  {
    id: "metrobuild",
    name: "MetroBuild",
    admin: "Emily Rodriguez",
    contact: "emily@metrobuild.com",
    projects: 6,
    users: 78,
    status: "Suspended",
  },
]

export default function CompaniesPage() {
  const [rows] = useState<CompanyRow[]>(SAMPLE_COMPANIES)

  function ActionsCell(params: ICellRendererParams<CompanyRow>) {
    const id = params.data?.id || ""
    return (
      <Button
        className="mt-0.5 flex items-center gap-3"
        variant="outline"
        size="sm"
      >
        <Link href={`/super-admin/companies/${id}`}>View</Link>
      </Button>
    )
  }

  const columnDefs: ColDef<CompanyRow>[] = [
    { field: "name", headerName: "Company", minWidth: 220 },
    { field: "admin", headerName: "Admin", minWidth: 180 },
    { field: "contact", headerName: "Contact", minWidth: 220 },
    { field: "projects", headerName: "Projects", minWidth: 110 },
    { field: "users", headerName: "Users", minWidth: 110 },
    { field: "status", headerName: "Status", minWidth: 120 },
    { headerName: "Actions", cellRenderer: ActionsCell, minWidth: 120 },
  ]

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-6">
      <BreadcrumbWithBack items={[{ label: "Companies (Admins)" }]} />
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Companies (Admins)</h1>
          <p className="text-sm text-slate-400">
            Manage admin companies and invitations
          </p>
        </div>
        <div>
          <Link
            href="/super-admin/companies/new"
            className="rounded-md bg-primary px-4 py-2 text-white"
          >
            Invite Admin
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col rounded-lg bg-card">
        <AgTable
          rowData={rows}
          columnDefs={columnDefs}
          height="100%"
          pagination
          pageSize={10}
        />
      </div>
    </div>
  )
}
