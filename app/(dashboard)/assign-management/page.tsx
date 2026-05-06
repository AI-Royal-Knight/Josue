"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AssignUserModal } from "./_components/assign-user-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

  const handleOpenModal = (role: string) => {
    setSelectedRole(role)
    setModalOpen(true)
  }

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

  return (
    <div className="w-full p-4">
      <Card className="w-full">
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-6 pb-3 text-left text-sm font-semibold text-slate-100">
                    Role
                  </th>
                  <th className="px-6 pb-3 text-left text-sm font-semibold text-slate-100">
                    Assigned Users
                  </th>
                  <th className="px-6 pb-3 text-center text-sm font-semibold text-slate-100">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-white/5 hover:bg-white/2.5"
                  >
                    <td className="px-6 py-4 text-sm text-slate-100">
                      {assignment.role}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {assignment.users.map((user) => (
                          <span
                            key={user.id}
                            className="inline-flex items-center rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-200"
                          >
                            {user.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="outline"
                        className="border-white/10 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
                        onClick={() => handleOpenModal(assignment.role)}
                      >
                        Assign User
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      </Card>

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
