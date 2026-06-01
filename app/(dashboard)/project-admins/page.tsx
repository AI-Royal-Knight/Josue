"use client"

import type { ColDef } from "ag-grid-community"
import { useMemo } from "react"

import { AgTable } from "@/components/common/AgTable"
import { ExportCsvButton } from "@/components/common/export-csv-button"
import { projectAmins } from "@/constants/project-admins"
import InviteDialog from "./_components/invite-dialog"

type ProjectAdminRow = {
  name: string
  surname: string
  emailAddress: string
  projects: string
  dateProjectCreated: string
  projectValue: string
}

const columnDefs: ColDef<ProjectAdminRow>[] = [
  { headerName: "Name", field: "name" },
  { headerName: "Surname", field: "surname" },
  { headerName: "Email Address", field: "emailAddress" },
  { headerName: "Projects", field: "projects" },
  { headerName: "Date Project Created", field: "dateProjectCreated" },
  { headerName: "Project Value", field: "projectValue" },
]

export default function Page() {
  const rowData = useMemo<ProjectAdminRow[]>(
    () =>
      projectAmins.flatMap((row) => {
        const projects = (
          Array.isArray(row.projects)
            ? row.projects
            : String(row.projects ?? "")
                .split(",")
                .map((project) => project.trim())
        )
          .map((project) => String(project).trim())
          .filter(Boolean)

        if (projects.length === 0) return [{ ...row, projects: "" }]
        return projects.map((project) => ({ ...row, projects: project }))
      }),
    []
  )

  return (
    <>
      <div className="w-full min-w-0 overflow-x-auto px-4">
        <div className="flex justify-between gap-4 py-4">
          <h2>Project Admins</h2>
          <div className="flex items-center gap-2">
            <InviteDialog />
            <ExportCsvButton<ProjectAdminRow>
              rows={rowData}
              fileNamePrefix="project-admins"
              label="Export"
              columns={[
                { header: "Name", field: "name" },
                { header: "Surname", field: "surname" },
                { header: "Email Address", field: "emailAddress" },
                { header: "Projects", field: "projects" },
                { header: "Date Project Created", field: "dateProjectCreated" },
                { header: "Project Value", field: "projectValue" },
              ]}
            />
          </div>
        </div>
        <AgTable rowData={rowData} columnDefs={columnDefs} height="auto" />
      </div>
    </>
  )
}
