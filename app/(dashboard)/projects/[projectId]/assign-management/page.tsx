"use client"

import { useState, useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import { type ColDef } from "ag-grid-community"
import { Button } from "@/components/ui/button"
import { AssignUserModal } from "./_components/assign-user-modal"
import { AgTable } from "@/components/common/AgTable"
import { getProjectRoles, type ProjectRoleData, type ProjectUser } from "@/lib/api/project-admin"
import { ApiError } from "@/lib/api/client"
import { Loader2 } from "lucide-react"

export default function AssignManagementPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [assignments, setAssignments] = useState<ProjectRoleData[]>([])
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!projectId) return
    setLoading(true)
    setError(null)
    try {
      const rolesRes = await getProjectRoles(projectId)
      setAssignments(rolesRes)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [projectId])

  const handleOpenModal = useCallback((roleKey: string) => {
    setSelectedRole(roleKey)
    setModalOpen(true)
  }, [])

  const handleUsersChange = useCallback(
    (updatedUsers: ProjectUser[]) => {
      if (!selectedRole) return
      setAssignments((prev) =>
        prev.map((a) =>
          a.role_key === selectedRole ? { ...a, users: updatedUsers } : a
        )
      )
    },
    [selectedRole]
  )

  const columns: ColDef<ProjectRoleData>[] = [
    {
      headerName: "Role",
      field: "role",
      flex: 1,
      cellClass: "font-medium text-slate-100",
    },
    {
      headerName: "Assigned",
      field: "users",
      flex: 2,
      cellRenderer: (params: { data: ProjectRoleData }) => {
        const assigned = params.data.users.filter((u) => u.checked)
        const displayed = assigned.length > 0 ? assigned : params.data.users
        return (
          <div className="flex flex-wrap items-center gap-2 py-1">
            {displayed.map((user) => (
              <span
                key={user.id}
                className="rounded bg-white/10 px-2 py-0.5 text-xs text-slate-200"
              >
                {user.name}
              </span>
            ))}
          </div>
        )
      },
    },
    {
      headerName: "",
      field: "role",
      colId: "actions",
      width: 120,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data: ProjectRoleData }) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => handleOpenModal(params.data.role_key)}
        >
          Assign
        </Button>
      ),
    },
  ]

  const currentAssignment = assignments.find((a) => a.role_key === selectedRole)

  return (
    <div className="w-full p-6">
      <h2 className="mb-6 text-xl font-semibold text-slate-100">
        Management Structure
      </h2>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading roles...
        </div>
      ) : (
        <div className="flex flex-1 flex-col rounded-lg bg-card">
           <AgTable
             rowData={assignments}
             columnDefs={columns}
             height="auto"
             suppressCellClickAction
             defaultColDef={{ minWidth: 140 }}
             gridOptions={{ rowHeight: 48 }}
           />
        </div>
      )}

      {selectedRole && currentAssignment && projectId && (
        <AssignUserModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          projectId={projectId}
          roleKey={selectedRole}
          users={currentAssignment.users}
          onUsersChange={handleUsersChange}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}
