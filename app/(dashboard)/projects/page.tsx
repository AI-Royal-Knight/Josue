"use client"
import { useEffect, useState } from "react"
import { VAT_OPTIONS } from "@/constants/projects"
import type { ProjectItem } from "@/constants/projects"
import CreateProjectDialog from "./_components/create-project-dialog"
import { AgTable } from "@/components/common/AgTable"
import type { ColDef, ICellRendererParams } from "ag-grid-community"
import Link from "next/link"
import { getProjects } from "@/lib/api/project-admin"

export default function Page() {
  const [projectsData, setProjectsData] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const result = await getProjects()
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

  return (
    <div className="w-full px-6 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2>Projects</h2>
        <CreateProjectDialog onSuccess={fetchProjects} />
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500">
          Loading projects...
        </div>
      ) : (
        <AgTable rowData={projectsData} columnDefs={columns} height="auto" />
      )}
    </div>
  )
}
