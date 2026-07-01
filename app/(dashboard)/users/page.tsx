"use client"

import { useState, useCallback, useEffect } from "react"
import type { ColDef } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import { UserProfileDialog } from "@/components/user-profile-dialog"
import { Switch } from "@/components/ui/switch"
import InviteUserDialog from "@/app/(dashboard)/invite-users/invite-modal"
import { useRoleStore } from "@/lib/role-store"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { BellRing } from "lucide-react"

type UserRow = {
  id: string
  name: string
  surname: string
  email: string
  phone: string
  profession: string
  cscsCardNo: string
  cscsExpiryDate: string
  cscsExpiryTone: "emerald" | "red"
  ipaf: string
  pasma: string
  company: string
  ssstsSmsts: string
  expiryDate: string
  expiryTone: "emerald" | "red"
  approvedUser: boolean
  approvedBy: string
}

type PendingToggle = {
  userId: string
  userName: string
  nextValue: boolean
}

export default function Page() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const role = useRoleStore((s) => s.role)
  const [pending, setPending] = useState<PendingToggle | null>(null)
  const [reminderUser, setReminderUser] = useState<UserRow | null>(null)

  const isDocumentController = role === "document_controller"
  const isAdmin = role === "admin" || role === "super_admin"

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("http://localhost:8000/api/v1/account/users/")
      if (res.ok) {
        const data = await res.json()
        const sortedData = data.sort((a: UserRow, b: UserRow) => {
          if (a.approvedUser === b.approvedUser) return 0
          return a.approvedUser ? 1 : -1
        })
        setUsers(sortedData)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const requestToggle = useCallback(
    (userId: string, userName: string, nextValue: boolean) => {
      setPending({ userId, userName, nextValue })
    },
    []
  )

  const confirmToggle = useCallback(async () => {
    if (!pending) return
    try {
      const res = await fetch("http://localhost:8000/api/v1/account/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: pending.userId, approved: pending.nextValue }),
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === pending.userId
              ? {
                  ...u,
                  approvedUser: pending.nextValue,
                  approvedBy: pending.nextValue ? (isAdmin ? "Admin" : "Document Controller") : "",
                }
              : u
          )
        )
      }
    } catch (e) {
      console.error(e)
    } finally {
      setPending(null)
    }
  }, [pending, isAdmin])

  const cancelToggle = useCallback(() => setPending(null), [])

  const handleProfileAction = useCallback(
    (userId: string, action: "accept" | "reject") => {
      if (!isDocumentController) return
      const user = users.find((u) => u.id === userId)
      if (!user) return
      setPending({
        userId,
        userName: `${user.name} ${user.surname}`,
        nextValue: action === "accept",
      })
    },
    [isDocumentController, users]
  )

  const approvedCount = users.filter((u) => u.approvedUser).length
  const cscsExpiredCount = users.filter(
    (u) => u.cscsExpiryTone === "red"
  ).length

  const columnDefs: ColDef<UserRow>[] = [
   //  {
   //    headerName: "ID",
   //    field: "id",
   //    checkboxSelection: isDocumentController,
   //    headerCheckboxSelection: isDocumentController,
   //    maxWidth: 60,
   //    pinned: "left",
   //    filter: false,
   //  },
    { headerName: "Name", field: "name" },
    { headerName: "Surname", field: "surname" },
    { headerName: "Phone", field: "phone" },
    { headerName: "Email", field: "email", minWidth: 200 },
    { headerName: "Profession", field: "profession" },
    { headerName: "CSCS Card No", field: "cscsCardNo" },
    {
      headerName: "CSCS Expiry",
      field: "cscsExpiryDate",
      cellRenderer: (params: { data?: UserRow; value: string }) => {
        if (!params.data) return null;
        const isExpired = params.data.cscsExpiryTone === "red"
        return (
          <div className="flex items-center gap-2 group">
            <span className={isExpired ? "text-red-400" : "text-emerald-400"}>
              {params.value}
            </span>
            <button
              onClick={() => setReminderUser(params.data!)}
              className="text-slate-500 opacity-0 group-hover:opacity-100 hover:text-white transition-all"
              title="Send Reminder"
            >
              <BellRing className="size-3.5" />
            </button>
          </div>
        )
      },
    },
    { headerName: "IPAF", field: "ipaf" },
    { headerName: "PASMA", field: "pasma" },
    { headerName: "Company", field: "company" },
    { headerName: "SSSTS/SMSTS", field: "ssstsSmsts" },
    {
      headerName: "Expiry Date",
      field: "expiryDate",
      cellRenderer: (params: { data?: UserRow; value: string }) => (
        <span
          className={
            params.data?.expiryTone === "red"
              ? "text-red-400"
              : "text-emerald-400"
          }
        >
          {params.value}
        </span>
      ),
    },
    {
      headerName: "Profile",
      sortable: false,
      filter: false,
      cellRenderer: (params: { data?: UserRow }) => {
        if (!params.data) return null
        const u = params.data
        return (
          <UserProfileDialog
            user={u}
            canApprove={isDocumentController}
            onAction={(action) => handleProfileAction(u.id, action)}
          />
        )
      },
    },
    {
      headerName: "Approved",
      field: "approvedUser",
      minWidth: 150,
      cellClass: "justify-center pt-2",
      cellRenderer: (params: { data?: UserRow }) => {
        if (!params.data) return null
        const u = params.data
        const isExpired = u.cscsExpiryTone === "red"
        const approved = u.approvedUser

        if (isDocumentController || isAdmin) {
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={approved}
                aria-invalid={isExpired}
                onCheckedChange={(checked) => {
                  requestToggle(u.id, `${u.name} ${u.surname}`, checked)
                }}
              />
              <span
                className={
                  approved
                    ? "text-xs text-emerald-400"
                    : isExpired
                    ? "text-xs text-red-400"
                    : "text-xs text-slate-400"
                }
              >
                {approved ? "Yes" : isExpired ? "Expired" : "No"}
              </span>
            </div>
          )
        }

        return (
          <span className={approved ? "text-emerald-400" : isExpired ? "text-red-400" : "text-slate-400"}>
            {approved ? "Yes" : isExpired ? "Expired" : "No"}
          </span>
        )
      },
    },
    { headerName: "Approved By", field: "approvedBy" },
  ]

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Users</h2>
        <InviteUserDialog />
      </div>

      <div className="flex items-start gap-6">
        <TableStat
          summaryRows={[
            { label: "Total Users", value: String(users.length) },
            {
              label: "Approved Users",
              value: String(approvedCount),
              valueColor: "green",
            },
            {
              label: "Pending Approval",
              value: String(users.length - approvedCount),
            },
            {
              label: "CSCS Card Expired",
              value: String(cscsExpiredCount),
              valueColor: cscsExpiredCount > 0 ? "red" : undefined,
            },
          ]}
        />
      </div>

      <AgTable
        rowSelection="single"
        rowData={users}
        columnDefs={columnDefs}
        suppressCellClickAction
        defaultColDef={{ flex: 1, minWidth: 140, resizable: true }}
        gridOptions={{ rowHeight: 48 }}
      />

      <AlertDialog
        open={!!pending}
        onOpenChange={(open) => !open && cancelToggle()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.nextValue ? "Approve user?" : "Revoke approval?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.nextValue
                ? `This will approve ${pending.userName} and grant them access. Are you sure?`
                : `This will revoke approval for ${pending?.userName}. They will lose access. Are you sure?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelToggle}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>
              {pending?.nextValue ? "Approve" : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!reminderUser}
        onOpenChange={(open) => !open && setReminderUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Reminder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send a reminder to {reminderUser?.name} {reminderUser?.surname} to update their CSCS details? If the CSCS card expires, the user cannot send invoices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReminderUser(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              // Note: actual send logic would go here
              setReminderUser(null)
            }}>
              Send Reminder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
