"use client"
import { projects } from "@/constants/projects"
import CreateProjectDialog from "./_components/create-project-dialog"
import { AgTable } from "@/components/common/AgTable"
import type { ColDef, ICellRendererParams } from "ag-grid-community"
import type { ProjectItem } from "@/constants/projects"

export default function Page() {
  const columns: ColDef<ProjectItem>[] = [
    { headerName: "Project Name", field: "projectName" },
    { headerName: "Job Code", field: "jobCode" },
    { headerName: "VAT Temp", field: "vatTemp" },
    { headerName: "Address", field: "address" },
    { headerName: "Date Created", field: "dateCreated" },
    { headerName: "Project Value", field: "projectValue" },
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
    <div className="w-full p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2>Projects</h2>
        <CreateProjectDialog />
      </div>

      <AgTable rowData={projects} columnDefs={columns} height="auto" />
    </div>
  )
}
