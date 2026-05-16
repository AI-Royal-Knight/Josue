"use client"

import React, { useState } from "react"
import { AgTable } from "@/components/common/AgTable"
import type { ColDef } from "ag-grid-community"
import BreadcrumbWithBack from "@/components/ui/breadcrumb-with-back"
import { Input } from "@/components/ui/input"

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  company: string
  project: string
  status: string
  lastActive: string
}

const SAMPLE_USERS: UserRow[] = [
  {
    id: "jm",
    name: "John Matthews",
    email: "john@buildco.com",
    role: "Admin",
    company: "BuildCo Ltd",
    project: "All Projects",
    status: "Active",
    lastActive: "2 min ago",
  },
  {
    id: "ak",
    name: "Alex Kumar",
    email: "alex@buildco.com",
    role: "Manager",
    company: "BuildCo Ltd",
    project: "Downtown Tower Phase 1",
    status: "Active",
    lastActive: "5 min ago",
  },
  {
    id: "sl",
    name: "Sarah Lee",
    email: "sarah.lee@buildco.com",
    role: "Contracts Manager",
    company: "BuildCo Ltd",
    project: "Downtown Tower Phase 1",
    status: "Active",
    lastActive: "12 min ago",
  },
  {
    id: "mc",
    name: "Mike Chen",
    email: "mike@buildco.com",
    role: "Finance",
    company: "BuildCo Ltd",
    project: "Downtown Tower Phase 1",
    status: "Active",
    lastActive: "1 hour ago",
  },
  {
    id: "sj",
    name: "Sarah Johnson",
    email: "sarah@urbandev.com",
    role: "Admin",
    company: "UrbanDev Inc",
    project: "All Projects",
    status: "Active",
    lastActive: "3 min ago",
  },
]

export default function UsersPage() {
  const [rows] = useState<UserRow[]>(SAMPLE_USERS)

  const columnDefs: ColDef<UserRow>[] = [
    { field: "name", headerName: "User", minWidth: 220 },
    { field: "email", headerName: "Email", minWidth: 240 },
    { field: "role", headerName: "Role", minWidth: 140 },
    { field: "company", headerName: "Company", minWidth: 160 },
    { field: "project", headerName: "Project", minWidth: 160 },
    { field: "status", headerName: "Status", minWidth: 110 },
    { field: "lastActive", headerName: "Last Active", minWidth: 130 },
  ]

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-6">

      <header>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-slate-400">
          Global user directory and management
        </p>
      </header>

      <div className="rounded-lg bg-card">
        <div className="mb-4 flex items-center justify-between">
          <Input placeholder="Search users by name, email, role, company, or project..." />
          <div className="text-sm text-slate-400 w-full text-right">
            Total Users: 13 | Active: 12
          </div>
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
