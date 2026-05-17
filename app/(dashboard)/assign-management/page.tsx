"use client"

import { useState, useCallback } from "react"
import { type ColDef } from "ag-grid-community"
import { Button } from "@/components/ui/button"
import { AssignUserModal } from "./_components/assign-user-modal"
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
    users: [{ id: "6", name: "Hanny Emterson", checked: false }],
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
    users: [{ id: "10", name: "Alison Taylor", checked: false }],
  },
]

export default function Page() {
  const [assignments, setAssignments] = useState(initialAssignments)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleOpenModal = useCallback((role: string) => {
    setSelectedRole(role)
    setModalOpen(true)
  }, [])

  const handleUpdateUsers = (
    updatedUsers: Array<{ id: string; name: string; checked: boolean }>
  ) => {
    if (selectedRole) {
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.role === selectedRole
            ? { ...assignment, users: updatedUsers }
            : assignment
        )
      )
    }
  }

  const currentAssignment = assignments.find((a) => a.role === selectedRole)
  const columns: ColDef<RoleAssignment>[] = [
    { headerName: "Role", field: "role", minWidth: 220 },
    {
      headerName: "Assigned Users",
      field: "users",
      cellRenderer: (params: { data?: RoleAssignment }) => {
        return (
          <div className="flex flex-wrap gap-2">
            {params.data?.users.map((u) => (
              <span
                key={u.id}
                className="inline-flex items-center rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-200"
              >
                {u.name}
              </span>
            ))}
          </div>
        )
      },
    },
    {
      headerName: "Action",
      cellRenderer: (params: { data?: RoleAssignment }) => (
        <div className="text-center">
          <Button
            variant="outline"
            className="border-white/10 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
            onClick={() => handleOpenModal(params.data?.role || "")}
          >
            Assign User
          </Button>
        </div>
      ),
      minWidth: 160,
    },
  ]

  return (
    <div className="w-full">
      <AgTable rowData={assignments} columnDefs={columns} height="auto" />

      <AssignUserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        role={selectedRole || ""}
        users={currentAssignment?.users || []}
        onUsersChange={handleUpdateUsers}
      />
    </div>
  )
}
