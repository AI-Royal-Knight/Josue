"use client"

import { useState, useEffect, useCallback } from "react"
import type { ColDef } from "ag-grid-community"
import InviteUserDialog from "./invite-modal"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import { UserProfileDialog } from "@/components/user-profile-dialog"
import { Switch } from "@/components/ui/switch"
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

const storageKey = "tresta:selectedRole"

type UserRow = {
  id: string
  name: string
  surname: string
  email: string
  profession: string
  cscsCardNo: string
  cscsExpiryDate: string
  cscsExpiryTone?: string
  ipaf: string
  pasma: string
  company: string
  ssstsSmsts: string
  expiryDate: string
  expiryTone?: string
  approvedUser: boolean
  approvedBy: string
}

type PendingToggle = {
  userId: string
  userName: string
  nextValue: boolean
}

const initialUsers: UserRow[] = [
  {
    id: "1",
    name: "John",
    surname: "Smith",
    email: "j.smith@buildco.com",
    profession: "Site Manager",
    cscsCardNo: "01234567",
    cscsExpiryDate: "2025-10-15",
    ipaf: "3a, 3b",
    pasma: "Standard",
    company: "BuildCo Ltd",
    ssstsSmsts: "SMSTS",
    expiryDate: "2026-05-20",
    approvedUser: true,
    approvedBy: "Admin",
  },
  {
    id: "2",
    name: "Sarah",
    surname: "Jones",
    email: "s.jones@electrical.co.uk",
    profession: "Electrician",
    cscsCardNo: "98765432",
    cscsExpiryDate: "2023-11-05",
    ipaf: "3a",
    pasma: "",
    company: "Sparky Bros",
    ssstsSmsts: "",
    expiryDate: "",
    approvedUser: true,
    approvedBy: "Admin",
  },
  {
    id: "3",
    name: "Michael",
    surname: "Brown",
    email: "m.brown@groundworks.com",
    profession: "Groundworker",
    cscsCardNo: "45678912",
    cscsExpiryDate: "2027-02-28",
    ipaf: "",
    pasma: "",
    company: "Groundworks Plus",
    ssstsSmsts: "SSSTS",
    expiryDate: "2025-08-12",
    approvedUser: false,
    approvedBy: "",
  },
  {
    id: "4",
    name: "Emma",
    surname: "Davis",
    email: "e.davis@cranes.com",
    profession: "Crane Operator",
    cscsCardNo: "34567890",
    cscsExpiryDate: "2026-09-10",
    ipaf: "",
    pasma: "",
    company: "High Lifts Ltd",
    ssstsSmsts: "",
    expiryDate: "",
    approvedUser: false,
    approvedBy: "",
  },
]

export default function Page() {
  const [users, setUsers] = useState<UserRow[]>(initialUsers)
  const [role, setRole] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingToggle | null>(null)

  useEffect(() => {
    setRole(window.localStorage.getItem(storageKey))
    const handleStorage = () =>
      setRole(window.localStorage.getItem(storageKey))
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const isDocumentController = role === "document_controller"

  // Stage a toggle — opens the confirmation dialog
  const requestToggle = useCallback(
    (userId: string, userName: string, nextValue: boolean) => {
      setPending({ userId, userName, nextValue })
    },
    []
  )

  // User confirmed — commit the change
  const confirmToggle = useCallback(() => {
    if (!pending) return
    setUsers((prev) =>
      prev.map((u) =>
        u.id === pending.userId
          ? {
              ...u,
              approvedUser: pending.nextValue,
              approvedBy: pending.nextValue ? "Document Controller" : "",
            }
          : u
      )
    )
    setPending(null)
  }, [pending])

  // User cancelled — discard
  const cancelToggle = useCallback(() => setPending(null), [])

  // Profile dialog Accept/Reject also goes through the confirmation flow
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

  const columnDefs: ColDef<UserRow>[] = [
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
              ? "text-red-500"
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
            user={{
              name: u.name,
              surname: u.surname,
              email: u.email,
              profession: u.profession,
              cscsCardNo: u.cscsCardNo,
              cscsExpiryDate: u.cscsExpiryDate,
              cscsExpiryTone:
                (u.cscsExpiryTone as "emerald" | "red") ?? "emerald",
              ipaf: u.ipaf,
              pasma: u.pasma,
              company: u.company,
              ssstsSmsts: u.ssstsSmsts,
              expiryDate: u.expiryDate,
              expiryTone: (u.expiryTone as "emerald" | "red") ?? "emerald",
            }}
            canApprove={isDocumentController}
            onAction={(action) => handleProfileAction(u.id, action)}
          />
        )
      },
    },
    {
      headerName: "Approved User",
      field: "approvedUser",
      cellRenderer: (params: { data?: UserRow }) => {
        if (!params.data) return null
        const u = params.data
        const approved = u.approvedUser

        if (isDocumentController) {
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={approved}
                onCheckedChange={(checked) =>
                  requestToggle(u.id, `${u.name} ${u.surname}`, checked)
                }
              />
              <span
                className={
                  approved
                    ? "text-xs text-emerald-400"
                    : "text-xs text-slate-400"
                }
              >
                {approved ? "Yes" : "No"}
              </span>
            </div>
          )
        }

        return (
          <span className={approved ? "text-emerald-400" : "text-slate-400"}>
            {approved ? "Yes" : "No"}
          </span>
        )
      },
    },
    {
      headerName: "Approved By",
      field: "approvedBy",
    },
  ]

  return (
    <div className="w-full space-y-6 p-6">
      <h2 className="text-xl font-semibold">Invite Users</h2>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <TableStat
            summaryRows={[
              { label: "Total Users", value: String(users.length) },
              { label: "Approved Users", value: String(approvedCount) },
              {
                label: "CSCS Card Expired",
                value: String(
                  users.filter((u) => u.cscsExpiryTone === "red").length
                ),
                alert: true,
              },
            ]}
          />
        </div>
        <InviteUserDialog />
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
    </div>
  )
}
