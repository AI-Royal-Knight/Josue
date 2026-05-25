"use client"

import { useState, useEffect, useCallback } from "react"
import type { ColDef } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import { UserProfileDialog } from "@/components/user-profile-dialog"
import { Switch } from "@/components/ui/switch"
import InviteUserDialog from "@/app/(dashboard)/invite-users/invite-modal"
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

const initialUsers: UserRow[] = [
  {
    id: "1",
    name: "John",
    surname: "Smith",
    email: "j.smith@buildco.com",
    profession: "Site Manager",
    cscsCardNo: "01234567",
    cscsExpiryDate: "2025-10-15",
    cscsExpiryTone: "emerald",
    ipaf: "3a, 3b",
    pasma: "Standard",
    company: "BuildCo Ltd",
    ssstsSmsts: "SMSTS",
    expiryDate: "2026-05-20",
    expiryTone: "emerald",
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
    cscsExpiryTone: "red",
    ipaf: "3a",
    pasma: "",
    company: "Sparky Bros",
    ssstsSmsts: "",
    expiryDate: "",
    expiryTone: "emerald",
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
    cscsExpiryTone: "emerald",
    ipaf: "",
    pasma: "",
    company: "Groundworks Plus",
    ssstsSmsts: "SSSTS",
    expiryDate: "2025-08-12",
    expiryTone: "emerald",
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
    cscsExpiryTone: "emerald",
    ipaf: "",
    pasma: "",
    company: "High Lifts Ltd",
    ssstsSmsts: "",
    expiryDate: "",
    expiryTone: "emerald",
    approvedUser: false,
    approvedBy: "",
  },
  {
    id: "5",
    name: "John",
    surname: "Doe",
    email: "john.doe@buildco.com",
    profession: "Electrician",
    cscsCardNo: "12345678",
    cscsExpiryDate: "2025-10-12",
    cscsExpiryTone: "emerald",
    ipaf: "Yes",
    pasma: "No",
    company: "BuildCo",
    ssstsSmsts: "SSTS",
    expiryDate: "2024-05-20",
    expiryTone: "red",
    approvedUser: true,
    approvedBy: "Admin",
  },
  {
    id: "6",
    name: "Jane",
    surname: "Smith",
    email: "j.smith@construct.net",
    profession: "Plumber",
    cscsCardNo: "87654321",
    cscsExpiryDate: "2026-02-15",
    cscsExpiryTone: "emerald",
    ipaf: "No",
    pasma: "Yes",
    company: "ConstructNet",
    ssstsSmsts: "None",
    expiryDate: "N/A",
    expiryTone: "emerald",
    approvedUser: true,
    approvedBy: "Admin",
  },
  {
    id: "7",
    name: "Robert",
    surname: "Johnson",
    email: "r.johnson@siteops.co.uk",
    profession: "Site Manager",
    cscsCardNo: "11223344",
    cscsExpiryDate: "2024-11-30",
    cscsExpiryTone: "red",
    ipaf: "Yes",
    pasma: "Yes",
    company: "SiteOps",
    ssstsSmsts: "SMSTS",
    expiryDate: "2025-08-10",
    expiryTone: "emerald",
    approvedUser: true,
    approvedBy: "Admin",
  },
  {
    id: "8",
    name: "Emily",
    surname: "Davis",
    email: "edavis@example.com",
    profession: "Carpenter",
    cscsCardNo: "44332211",
    cscsExpiryDate: "2027-01-05",
    cscsExpiryTone: "emerald",
    ipaf: "No",
    pasma: "No",
    company: "WoodWorks",
    ssstsSmsts: "None",
    expiryDate: "N/A",
    expiryTone: "emerald",
    approvedUser: false,
    approvedBy: "",
  },
  {
    id: "9",
    name: "William",
    surname: "Brown",
    email: "w.brown@steelcorp.com",
    profession: "Steel Fixer",
    cscsCardNo: "99887766",
    cscsExpiryDate: "2025-06-22",
    cscsExpiryTone: "emerald",
    ipaf: "Yes",
    pasma: "No",
    company: "SteelCorp",
    ssstsSmsts: "SSTS",
    expiryDate: "2026-03-15",
    expiryTone: "emerald",
    approvedUser: false,
    approvedBy: "",
  },
  {
    id: "10",
    name: "Olivia",
    surname: "Taylor",
    email: "otaylor@example.com",
    profession: "Painter",
    cscsCardNo: "55667788",
    cscsExpiryDate: "2024-09-18",
    cscsExpiryTone: "red",
    ipaf: "No",
    pasma: "Yes",
    company: "ColorPro",
    ssstsSmsts: "None",
    expiryDate: "N/A",
    expiryTone: "red",
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
    const handleStorage = () => setRole(window.localStorage.getItem(storageKey))
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const isDocumentController = role === "document_controller"

  const requestToggle = useCallback(
    (userId: string, userName: string, nextValue: boolean) => {
      setPending({ userId, userName, nextValue })
    },
    []
  )

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
    {
      headerName: "ID",
      field: "id",
      checkboxSelection: isDocumentController,
      headerCheckboxSelection: isDocumentController,
      maxWidth: 60,
      // pinned: "left",
      filter: false,
    },
    { headerName: "Name", field: "name" },
    { headerName: "Surname", field: "surname" },
    { headerName: "Email", field: "email", minWidth: 200 },
    { headerName: "Profession", field: "profession" },
    { headerName: "CSCS Card No", field: "cscsCardNo" },
    {
      headerName: "CSCS Expiry",
      field: "cscsExpiryDate",
      cellRenderer: (params: { data?: UserRow; value: string }) => (
        <span
          className={
            params.data?.cscsExpiryTone === "red"
              ? "text-red-400"
              : "text-emerald-400"
          }
        >
          {params.value}
        </span>
      ),
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
    </div>
  )
}
