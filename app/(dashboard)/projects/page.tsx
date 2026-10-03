"use client"
import { useEffect, useState, useRef } from "react"
import { VAT_OPTIONS } from "@/constants/projects"
import type { ProjectItem } from "@/constants/projects"
import CreateProjectDialog from "./_components/create-project-dialog"
import { AgTable } from "@/components/common/AgTable"
import type { ColDef, ICellRendererParams, GridApi } from "ag-grid-community"
import Link from "next/link"
import { getMyProjects } from "@/lib/api/project-admin"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function Page() {
  const [projectsData, setProjectsData] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const gridApiRef = useRef<GridApi | null>(null)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const result = await getMyProjects()
      setProjectsData(result.projects)
    } catch (err) {
      console.error("Failed to load projects:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const columns: ColDef<ProjectItem>[] = [
    {
      headerName: "Project Name",
      field: "projectName",
      minWidth: 220,
      cellRenderer: (params: ICellRendererParams<ProjectItem, string>) => (
        <Link
          href={`/projects/${params.data?.id}`}
          className="text-sm font-medium text-green-500"
          onClick={(e) => e.stopPropagation()}
        >
          {params.value}
        </Link>
      ),
    },
    { headerName: "Job Code", field: "jobCode" },
    {
      headerName: "VAT Rate",
      field: "vatRate",
      cellRenderer: (
        params: ICellRendererParams<ProjectItem, string | undefined>
      ) => {
        const option = VAT_OPTIONS.find((o) => o.value === params.value)
        if (!option) return params.value ?? "—"
        return (
          <span
            className={
              option.rate === 20
                ? "font-medium text-amber-400"
                : "font-medium text-green-400"
            }
          >
            {option.label}
          </span>
        )
      },
    },
    { headerName: "Address", field: "address" },
    { headerName: "Date Created", field: "dateCreated" },
    { headerName: "Project Value", field: "projectValue" },
    { headerName: "Material Estimate", field: "materialEstimate" },
    { headerName: "Labour Estimate", field: "labourEstimate" },
    { headerName: "Prelims Estimate", field: "prelimsEstimate" },
    { headerName: "Estimate Profit", field: "estimateProfit" },
    { headerName: "Start Date", field: "startDate" },
    { headerName: "Completion Date", field: "completionDate" },
    {
      headerName: "Overdue",
      field: "overdue",
      cellRenderer: (
        params: ICellRendererParams<ProjectItem, string | undefined>
      ) => (
        <span className={params.value ? "text-red-500" : "text-green-500"}>
          {params.value ? "Yes" : "No"}
        </span>
      ),
    },
    {
      headerName: "Completed",
      field: "completed",
      cellRenderer: (
        params: ICellRendererParams<ProjectItem, string | undefined>
      ) => (
        <span className={params.value ? "text-green-500" : "text-red-500"}>
          {params.value ? "Yes" : "No"}
        </span>
      ),
    },
  ]

  const handleExport = () => {
    if (gridApiRef.current) {
      gridApiRef.current.exportDataAsCsv({ fileName: "projects_export.csv" })
    }
  }

  return (
    <div className="w-full px-6 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2>Projects</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <CreateProjectDialog onSuccess={fetchProjects} />
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500">
          Loading projects...
        </div>
      ) : (
        <AgTable 
          rowData={projectsData} 
          columnDefs={columns} 
          height="auto" 
          onGridReady={(api) => { gridApiRef.current = api }}
          suppressCellClickAction
          gridOptions={{ suppressRowClickSelection: true, suppressContextMenu: true }}
        />
      )}
    </div>
  )
}
