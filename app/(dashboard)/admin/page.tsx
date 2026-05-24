"use client"

import type { ColDef } from "ag-grid-community"

import { AgTable } from "@/components/common/AgTable"
import { Button } from "@/components/ui/button"
import { projectAmins } from "@/constants/project-admins"
import InviteDialog from "./_components/invite-dialog"
import { Download } from "lucide-react"

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

export default function page() {
  return (
    <>
      <div className="w-full min-w-0 overflow-x-auto px-4">
        <div className="flex justify-end gap-4 py-4">
          <InviteDialog />
          <Button variant={"outline"}>
            <Download />
            Export
          </Button>
        </div>
        <AgTable rowData={projectAmins} columnDefs={columnDefs} height="auto" />
      </div>
    </>
  )
}
