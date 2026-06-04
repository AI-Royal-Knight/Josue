"use client"

import type { ColDef } from "ag-grid-community"

import { AgTable } from "@/components/common/AgTable"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { projectAmins } from "@/constants/project-admins"

type ProjectAdminRow = {
  name: string
  surname: string
  emailAddress: string
  projects: string[] | string
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
  return (
    <div className="w-full min-w-0 p-4 md:p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Project Admins</CardTitle>
          <CardDescription>
            A resizable table that stretches to the available viewport width on
            load and on window resize.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <AgTable
            rowData={projectAmins}
            columnDefs={columnDefs}
            height="auto"
          />
        </CardContent>
      </Card>
    </div>
  )
}
