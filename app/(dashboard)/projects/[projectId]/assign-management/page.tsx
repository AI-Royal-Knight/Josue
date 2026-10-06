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
import UpdateProjectForm from "../details/_components/update-project-form"

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
      const filteredRoles = rolesRes.filter(
        r => r.role_key !== "employee" && r.role_key !== "supplier" && r.role_key !== "managing_director" && r.role_key !== "project_admin"
      )
      setAssignments(filteredRoles)
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

  const handleUnassign = async (roleKey: string, userIdToRemove: string, currentUsers: ProjectUser[]) => {
    try {
      const updatedUserIds = currentUsers.filter(u => u.id !== userIdToRemove).map(u => u.id)
      const { assignProjectRole } = await import("@/lib/api/project-admin")
      await assignProjectRole(projectId, {
        role_key: roleKey,
        user_ids: updatedUserIds
      })
      fetchData()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message)
    }
  }

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
            {displayed.map((user, idx) => (
              <span
                key={`${user.id}-${idx}`}
                className="group relative flex items-center rounded bg-white/10 px-2 py-0.5 text-xs text-slate-200"
              >
                {user.name}
                <button
                  onClick={() => handleUnassign(params.data.role_key, user.id, params.data.users)}
                  className="ml-1 text-slate-400 hover:text-red-400"
                  title="Unassign user"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
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
  const allAssignedUserIds = assignments.flatMap(a => a.users.map(u => u.id))

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-y-auto">
      <div className="mb-8">
        <h2 className="mb-6 text-xl font-semibold text-slate-100">
          Project Details
        </h2>
        <UpdateProjectForm projectId={projectId} />
      </div>

      <h2 className="mb-6 text-xl font-semibold text-slate-100 mt-4">
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
          allAssignedUserIds={allAssignedUserIds}
          onUsersChange={handleUsersChange}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}
