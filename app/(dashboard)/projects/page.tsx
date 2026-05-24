"use client"
import { projects, VAT_OPTIONS } from "@/constants/projects"
import CreateProjectDialog from "./_components/create-project-dialog"
import { AgTable } from "@/components/common/AgTable"
import type { ColDef, ICellRendererParams } from "ag-grid-community"
import type { ProjectItem } from "@/constants/projects"
import Link from "next/link"

export default function Page() {
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
        <CreateProjectDialog />
      </div>

      <AgTable rowData={projects} columnDefs={columns} height="auto" />
    </div>
  )
}
