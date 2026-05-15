"use client"

import React, { use } from "react"
import { AgTable } from "@/components/common/AgTable"
import type { ColDef } from "ag-grid-community"
import { Card, CardContent } from "@/components/ui/card"
import BreadcrumbWithBack from "@/components/ui/breadcrumb-with-back"

const data = [
  {
    title: "Total Users",
    value: "75",
  },
  {
    title: "Workers",
    value: "56",
  },
  {
    title: "Project Value",
    value: "12.5M",
  },
  {
    title: "Start Date",
    value: "2024-01-15",
  },
]

type UserRow = {
  id: string
  name: string
  role: string
  email: string
  assignedProject: string
  status: string
}

const SAMPLE_USERS: UserRow[] = [
  {
    id: "jm",
    name: "John Matthews",
    role: "Manager",
    email: "john@buildco.com",
    assignedProject: "Downtown Tower Phase 1",
    status: "Active",
  },
  {
    id: "sl",
    name: "Sarah Lee",
    role: "Contracts Manager",
    email: "sarah.lee@buildco.com",
    assignedProject: "Downtown Tower Phase 1",
    status: "Active",
  },
  {
    id: "mc",
    name: "Mike Chen",
    role: "Finance",
    email: "mike@buildco.com",
    assignedProject: "Downtown Tower Phase 1",
    status: "Active",
  },
]

export default function ProjectPage({
  params,
}: {
  params: Promise<{ company: string; project: string }>
}) {
  const { company, project } = use(params)

  const columnDefs: ColDef<UserRow>[] = [
    { field: "name", headerName: "User Name", minWidth: 220 },
    { field: "role", headerName: "Role", minWidth: 160 },
    { field: "email", headerName: "Email", minWidth: 220 },
    { field: "assignedProject", headerName: "Assigned Project", minWidth: 220 },
    { field: "status", headerName: "Status", minWidth: 110 },
  ]

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-6">
      <BreadcrumbWithBack
        items={[
          { label: "Companies (Admins)", href: "/super-admin/companies" },
          {
            label: company.replace(/-/g, " "),
            href: `/super-admin/companies/${company}`,
          },
          { label: project.replace(/-/g, " ") },
        ]}
      />
      <header>
        <h1 className="text-2xl font-bold">{project.replace(/-/g, " ")}</h1>
        <p className="text-sm text-slate-400">
          Project Details & User Management
        </p>
      </header>

      <section className="flex gap-16 rounded-lg bg-card">
        {data.map((item) => (
          <Card key={item.title} className="w-full">
            <CardContent>
              <h2>{item.title}</h2>
              <div className="text-2xl font-semibold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="flex flex-1 flex-col rounded-lg bg-card">
        <h2 className="mb-3 font-semibold">Users Inside Project</h2>
        <AgTable
          rowData={SAMPLE_USERS}
          columnDefs={columnDefs}
          height="100%"
          pagination
          pageSize={10}
        />
      </section>
    </div>
  )
}
