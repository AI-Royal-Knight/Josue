"use client"

import type { ColDef, ICellRendererParams } from "ag-grid-community"

import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import { useState, useEffect } from "react"
import { getDailyRegister, type DailyRegisterRow } from "@/lib/api/daily-register"
import { getMyProjects } from "@/lib/api/project-admin"
import type { ProjectItem } from "@/constants/projects"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ExportCsvButton } from "@/components/common/export-csv-button"

const columns: ColDef<DailyRegisterRow>[] = [
  { headerName: "No.", valueGetter: "node.rowIndex + 1", maxWidth: 60, filter: false },
  { headerName: "Name", field: "name" },
  { headerName: "Surname", field: "surname" },
  { headerName: "Project", field: "project_name" },
  { headerName: "Date", field: "date", valueFormatter: (params) => params.value ? format(new Date(params.value), "yyyy-MM-dd") : "" },
  { headerName: "Clock in Time", field: "check_in_time", valueFormatter: (params) => params.value ? format(new Date(params.value), "HH:mm:ss") : "" },
  { 
    headerName: "Clock in GPS", 
    cellRenderer: (params: ICellRendererParams<DailyRegisterRow>) => {
      if (params.data?.check_in_lat && params.data?.check_in_long) {
        const coords = `${params.data.check_in_lat}, ${params.data.check_in_long}`
        return (
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${coords}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {coords}
          </a>
        )
      }
      return ""
    }
  },
  { headerName: "Clock out", field: "check_out_time", valueFormatter: (params) => params.value ? format(new Date(params.value), "HH:mm:ss") : "" },
  { 
    headerName: "Clock out GPS", 
    cellRenderer: (params: ICellRendererParams<DailyRegisterRow>) => {
      if (params.data?.check_out_lat && params.data?.check_out_long) {
        const coords = `${params.data.check_out_lat}, ${params.data.check_out_long}`
        return (
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${coords}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {coords}
          </a>
        )
      }
      return ""
    }
  },
  { headerName: "Profession", field: "profession" },
  { headerName: "Management", field: "management" },
]

export default function Page() {
  const [rows, setRows] = useState<DailyRegisterRow[]>([])
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { projects } = await getMyProjects()
        setProjects(projects)
      } catch (e) {
        console.error("Failed to load projects", e)
      }
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getDailyRegister(selectedProjectId)
        setRows(data)
      } catch (error) {
        console.error("Failed to load daily register", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedProjectId])

  const today = new Date().toISOString().split("T")[0]
  
  // Calculate summary stats
  const todaysClockInCount = rows.filter(r => r.date === today && r.check_in_time).length
  const todaysClockOutCount = rows.filter(r => r.date === today && r.check_out_time).length

  // Simplified week/month filtering
  const thisMonthCount = rows.filter(r => r.date.startsWith(today.slice(0, 7))).length

  const summaryRows = [
    { label: "Todays Clock In Users", qty: todaysClockInCount.toString() },
    { label: "Todays Clock out Users", qty: todaysClockOutCount.toString() },
    { label: "This Months Users", qty: thisMonthCount.toString() },
  ]

  return (
    <div className="w-full min-w-0 space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Daily Register</h1>
      
      <div className="w-1/3">
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Select Project
        </label>
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="border-white/10 bg-slate-900">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-slate-900">
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end justify-between">
        <TableStat summaryRows={summaryRows} />

        <ExportCsvButton
          columns={columns.map((c) => ({
            header: c.headerName ?? "",
            field: typeof c.field === "string" ? c.field : undefined,
          }))}
          rows={rows}
          fileName="daily-register.csv"
        />
      </div>
      <AgTable rowData={rows} columnDefs={columns} height="60vh" loading={loading} />
    </div>
  )
}
