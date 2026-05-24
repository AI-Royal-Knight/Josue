"use client"

import { useState, useCallback } from "react"
import { type ColDef } from "ag-grid-community"
import { Button } from "@/components/ui/button"
import { AssignUserModal } from "@/app/(dashboard)/assign-management/_components/assign-user-modal"
import { AgTable } from "@/components/common/AgTable"

type RoleAssignment = {
  role: string
  users: Array<{ id: string; name: string; checked: boolean }>
}

const initialAssignments: RoleAssignment[] = [
  {
    role: "Project Director",
    users: [
      { id: "1", name: "Alex Jonson", checked: false },
      { id: "2", name: "Jon Alison", checked: false },
    ],
  },
  {
    role: "Procurement Department",
    users: [
      { id: "3", name: "Joshu Pro", checked: false },
      { id: "4", name: "Diana Eva", checked: false },
    ],
  },
  {
    role: "Commercial Department",
    users: [{ id: "5", name: "Evana Hani", checked: false }],
  },
  {
    role: "Document Controller",
    users: [{ id: "6", name: "Hanny Enterson", checked: false }],
  },
  {
    role: "Finance Department",
    users: [{ id: "7", name: "Evana Hani", checked: false }],
  },
  {
    role: "Contracts Manager",
    users: [{ id: "8", name: "Joshu Pro", checked: false }],
  },
  {
    role: "Manager",
    users: [{ id: "9", name: "Alison Tyson", checked: false }],
  },
  {
    role: "Supervisor",
    users: [{ id: "10", name: "Alison Tylor", checked: false }],
  },
]

export default function AssignManagementPage() {
  const [assignments, setAssignments] = useState(initialAssignments)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleOpenModal = useCallback((role: string) => {
    setSelectedRole(role)
    setModalOpen(true)
  }, [])

  const handleUsersChange = useCallback(
    (updatedUsers: Array<{ id: string; name: string; checked: boolean }>) => {
      if (!selectedRole) return
      setAssignments((prev) =>
        prev.map((a) =>
          a.role === selectedRole ? { ...a, users: updatedUsers } : a
        )
      )
    },
    [selectedRole]
  )

  const columns: ColDef<RoleAssignment>[] = [
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
      cellRenderer: (params: { data: RoleAssignment }) => {
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
      cellRenderer: (params: { data: RoleAssignment }) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => handleOpenModal(params.data.role)}
        >
          Assign
        </Button>
      ),
    },
  ]

  const currentAssignment = assignments.find((a) => a.role === selectedRole)

  return (
    <div className="w-full p-6">
      <h2 className="mb-6 text-xl font-semibold text-slate-100">
        Management Structure
      </h2>

      <AgTable
        rowData={assignments}
        columnDefs={columns}
        height="auto"
        suppressCellClickAction
        defaultColDef={{ minWidth: 140 }}
        gridOptions={{ rowHeight: 48 }}
      />

      {selectedRole && currentAssignment && (
        <AssignUserModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          role={selectedRole}
          users={currentAssignment.users}
          onUsersChange={handleUsersChange}
        />
      )}
    </div>
  )
}
