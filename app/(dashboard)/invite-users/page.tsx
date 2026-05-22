"use client"
import type { ColDef } from "ag-grid-community"
import InviteUserDialog from "./invite-modal"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import { UserProfileDialog, UserProfileDialogProps } from "@/components/user-profile-dialog"

type UserRow = {
  name: string
  surname: string
  email: string
  profession: string
  cscsCardNo: string
  cscsExpiryDate: string
  // optional tone flags used for conditional colouring in the table
  cscsExpiryTone?: string
  ipaf: string
  pasma: string
  company: string
  ssstsSmsts: string
  expiryDate: string
  // optional tone for expiryDate colouring
  expiryTone?: string
  approvedUser: string
  approvedBy: string
}

const users: UserRow[] = [
  {
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
    approvedUser: "Yes",
    approvedBy: "Admin",
  },
  {
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
    approvedUser: "Yes",
    approvedBy: "Admin",
  },
  {
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
    approvedUser: "No",
    approvedBy: "",
  },
  {
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
    approvedUser: "No",
    approvedBy: "",
  },
]

const columnDefs: ColDef<UserRow>[] = [
  { headerName: "Name", field: "name" },
  { headerName: "Surname", field: "surname" },
  { headerName: "Email", field: "email" },
  { headerName: "Profession", field: "profession" },
  { headerName: "CSCS Card No", field: "cscsCardNo" },
  {
    headerName: "CSCS Expiry Date",
    field: "cscsExpiryDate",
    cellRenderer: (params: { data?: UserRow; value: string }) => (
      <span
        className={
          params.data?.cscsExpiryTone === "red"
            ? "text-red-500"
            : "text-emerald-400"
        }
      >
        {params.value}
      </span>
    ),
  },
  { headerName: "IPAF", field: "ipaf" },
  {
    headerName: "PASMA",
    field: "pasma",
    cellRenderer: (params: { value: string }) => (
      <span className="whitespace-pre-line">{params.value}</span>
    ),
  },
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
    cellRenderer: (params: { data?: UserProfileDialogProps["user"] }) =>
      params.data ? <UserProfileDialog user={params.data} /> : null,
  },
  { headerName: "Approved User", field: "approvedUser" },
  { headerName: "Approved By", field: "approvedBy" },
]

export default function Page() {
  return (
    <div className="w-full space-y-6 p-6">
      <h2 className="text-xl font-semibold">Invite Users</h2>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <TableStat
            summaryRows={[
              { label: "Total Users", value: "4" },
              { label: "Approved Users", value: "2" },
              { label: "CSCS Card Expired", value: "2", alert: true },
            ]}
          />
        </div>

        <InviteUserDialog />
      </div>
      <AgTable
        rowSelection="single"
        rowData={users}
        columnDefs={columnDefs}
        defaultColDef={{ flex: 1, minWidth: 140, resizable: true }}
      />
    </div>
  )
}
