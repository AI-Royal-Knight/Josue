"use client"

import type { ColDef } from "ag-grid-community"
import { useEffect, useState } from "react"

import { AgTable } from "@/components/common/AgTable"
import { ExportCsvButton } from "@/components/common/export-csv-button"
import InviteDialog from "./_components/invite-dialog"
import { adminApi, ProjectAdminData } from "@/lib/api/admin"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

type ProjectAdminRow = {
  name: string
  surname: string
  emailAddress: string
  status: string
  dateJoined: string
}

const columnDefs: ColDef<ProjectAdminRow>[] = [
  { headerName: "Name", field: "name" },
  { headerName: "Surname", field: "surname" },
  { headerName: "Email Address", field: "emailAddress" },
  { headerName: "Status", field: "status" },
  { headerName: "Date Joined", field: "dateJoined" },
]

export default function Page() {
  const [data, setData] = useState<ProjectAdminData[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const response = await adminApi.getProjectAdmins()
      setData(response.project_admins)
    } catch (error: any) {
      toast.error(error.message || "Failed to load project admins")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const rowData: ProjectAdminRow[] = data.map((admin) => ({
    name: admin.first_name,
    surname: admin.last_name,
    emailAddress: admin.email,
    status: admin.is_active ? "Active" : "Inactive",
    dateJoined: new Date(admin.date_joined).toLocaleDateString(),
  }))

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="w-full min-w-0 overflow-x-auto px-4">
        <div className="flex justify-between gap-4 py-4">
          <h2>Project Admins</h2>
          <div className="flex items-center gap-2">
            <InviteDialog onSuccess={loadData} />
            <ExportCsvButton<ProjectAdminRow>
              rows={rowData}
              fileNamePrefix="project-admins"
              label="Export"
              columns={[
                { header: "Name", field: "name" },
                { header: "Surname", field: "surname" },
                { header: "Email Address", field: "emailAddress" },
                { header: "Status", field: "status" },
                { header: "Date Joined", field: "dateJoined" },
              ]}
            />
          </div>
        </div>
        <AgTable rowData={rowData} columnDefs={columnDefs} height="auto" />
      </div>
    </>
  )
}
