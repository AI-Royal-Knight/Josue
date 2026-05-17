"use client"

import React, { useState } from "react"
import { AgTable } from "@/components/common/AgTable"
import type { ColDef } from "ag-grid-community"
// BreadcrumbWithBack removed (unused)
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  // SheetTrigger removed (unused)
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { getStatusVariant } from "@/lib/utils"

type ProjectRow = {
  id: string
  name: string
  company: string
  value: string
  users: number
  workers: number
  status: string
  action: string
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
    action: "View Details",
  },
  {
    id: "rv-1",
    name: "Riverside Mall Construction",
    company: "UrbanDev Inc",
    value: "$18.3M",
    users: 112,
    workers: 180,
    status: "Active",
    action: "View Details",
  },
  {
    id: "ms-1",
    name: "Metro Station Expansion",
    company: "SkyConstruct",
    value: "$25.7M",
    users: 145,
    workers: 250,
    status: "Active",
    action: "View Details",
  },
  {
    id: "hb-1",
    name: "Heritage Building Restoration",
    company: "PrimeDevelopers",
    value: "$6.2M",
    users: 45,
    workers: 65,
    status: "Completed",
    action: "View Details",
  },
]

export default function ProjectsPage() {
  const [rows] = useState<ProjectRow[]>(SAMPLE_PROJECTS)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<ProjectRow | null>(null)

  function openDetails(row: ProjectRow) {
    setSelected(row)
    setOpen(true)
  }

  function closeDetails() {
    setOpen(false)
    setSelected(null)
  }

  const columnDefs: ColDef<ProjectRow>[] = [
    { field: "name", headerName: "Project Name", minWidth: 260 },
    { field: "company", headerName: "Company", minWidth: 180 },
    { field: "value", headerName: "Value", minWidth: 120 },
    { field: "users", headerName: "Users", minWidth: 100 },
    { field: "workers", headerName: "Workers", minWidth: 100 },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      cellRenderer: (params: { value: string }) => {
        const status = params.value as string
        const variant = getStatusVariant(status)
        return <Badge variant={variant}>{status}</Badge>
      },
    },
    {
      field: "action",
      headerName: "Action",
      minWidth: 140,
      cellRenderer: (params: { data: ProjectRow }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openDetails(params.data as ProjectRow)}
        >
          View Details
        </Button>
      ),
    },
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
        {/* Sheet for project details */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" showCloseButton>
            <SheetHeader>
              <SheetTitle>{selected?.name ?? "Project Details"}</SheetTitle>
              <SheetDescription>
                Comprehensive project overview
              </SheetDescription>
            </SheetHeader>

            <SheetDescription className="space-y-4 p-4">
              {/* Project information */}
              <div className="rounded-md bg-card p-4">
                <div className="text-xs text-muted-foreground">
                  PROJECT INFORMATION
                </div>
                <h3 className="mt-2 font-medium">{selected?.name}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary">{selected?.company}</Badge>
                  <Badge variant="outline">{selected?.value}</Badge>
                </div>
              </div>

              {/* Users breakdown and role map */}
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-md bg-card p-4">
                  <div className="text-sm font-medium">Users Breakdown</div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-400">
                    <li className="flex justify-between">
                      <span>Total Users</span>
                      <span>{selected?.users ?? 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Managers</span>
                      <span>2</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Contracts Managers</span>
                      <span>1</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Finance</span>
                      <span>2</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Workers</span>
                      <span>{selected?.workers ?? 0}</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium">
                    ROLE ASSIGNMENT MAP
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-md p-3 ring-1">
                      <div className="mb-2 text-xs font-medium text-blue-200">
                        MANAGER
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-blue-700/80">
                          JM John Matthews
                        </Badge>
                        <Badge className="bg-blue-700/60">AK Alex Kumar</Badge>
                      </div>
                    </div>

                    <div className="rounded-md p-3 ring-1">
                      <div className="mb-2 text-xs font-medium text-purple-200">
                        CONTRACTS MANAGER
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-purple-700/80">SL Sarah Lee</Badge>
                      </div>
                    </div>

                    <div className="rounded-md p-3 ring-1">
                      <div className="mb-2 text-xs font-medium text-green-200">
                        FINANCE / COMMERCIAL
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-green-700/80">MC Mike Chen</Badge>
                        <Badge className="bg-green-700/60">ED Emma Davis</Badge>
                      </div>
                    </div>

                    <div className="rounded-md p-3 ring-1">
                      <div className="mb-2 text-xs font-medium text-amber-200">
                        WORKERS / LABOUR
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-amber-700/80">
                          {selected?.workers ?? 0} Workers
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics tiles */}
              <div>
                <div className="mb-3 text-sm font-medium">
                  PROJECT ANALYTICS
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-blue-950 p-4">
                    <div className="text-xs text-muted-foreground">
                      Total Manpower
                    </div>
                    <div className="mt-2 text-2xl font-bold">
                      {selected?.users ?? 0}
                    </div>
                  </div>
                  <div className="rounded-md bg-green-950 p-4">
                    <div className="text-xs text-muted-foreground">
                      Active Workers
                    </div>
                    <div className="mt-2 text-2xl font-bold">
                      {selected?.workers ?? 0}
                    </div>
                  </div>
                  <div className="rounded-md bg-purple-950 p-4">
                    <div className="text-xs text-muted-foreground">
                      Completed Value
                    </div>
                    <div className="mt-2 text-2xl font-bold">$8.2M</div>
                  </div>
                  <div className="rounded-md bg-amber-950 p-4">
                    <div className="text-xs text-muted-foreground">
                      Variations
                    </div>
                    <div className="mt-2 text-2xl font-bold">23</div>
                  </div>
                  <div className="col-span-2 rounded-md bg-amber-900/70 p-4">
                    <div className="text-xs text-muted-foreground">
                      Monthly Application Value
                    </div>
                    <div className="mt-2 text-2xl font-bold">$1.2M</div>
                  </div>
                </div>
              </div>
            </SheetDescription>

            <SheetFooter>
              <div className="flex gap-2">
                <Button variant="outline" onClick={closeDetails}>
                  Close
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
