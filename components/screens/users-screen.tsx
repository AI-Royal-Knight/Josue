"use client"

import type { ColDef } from "ag-grid-community"

import { AgTable } from "@/components/common/AgTable"
import { UserProfileDialog } from "@/components/user-profile-dialog"

type UserRow = {
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
}

const users: UserRow[] = [
  {
    company: "BuildCo",
    cscsCardNo: "12345678",
    cscsExpiryDate: "2025-10-12",
    cscsExpiryTone: "emerald",
    email: "john.doe@buildco.com",
    expiryDate: "2024-05-20",
    expiryTone: "red",
    ipaf: "Yes",
    name: "John",
    pasma: "No",
    profession: "Electrician",
    ssstsSmsts: "SSTS",
    surname: "Doe",
  },
  {
    company: "ConstructNet",
    cscsCardNo: "87654321",
    cscsExpiryDate: "2026-02-15",
    cscsExpiryTone: "emerald",
    email: "j.smith@construct.net",
    expiryDate: "N/A",
    expiryTone: "emerald",
    ipaf: "No",
    name: "Jane",
    pasma: "Yes",
    profession: "Plumber",
    ssstsSmsts: "None",
    surname: "Smith",
  },
  {
    company: "SiteOps",
    cscsCardNo: "11223344",
    cscsExpiryDate: "2024-11-30",
    cscsExpiryTone: "red",
    email: "r.johnson@siteops.co.uk",
    expiryDate: "2025-08-10",
    expiryTone: "emerald",
    ipaf: "Yes",
    name: "Robert",
    pasma: "Yes",
    profession: "Site Manager",
    ssstsSmsts: "SMSTS",
    surname: "Johnson",
  },
  {
    company: "WoodWorks",
    cscsCardNo: "44332211",
    cscsExpiryDate: "2027-01-05",
    cscsExpiryTone: "emerald",
    email: "edavis@example.com",
    expiryDate: "N/A",
    expiryTone: "emerald",
    ipaf: "No",
    name: "Emily",
    pasma: "No",
    profession: "Carpenter",
    ssstsSmsts: "None",
    surname: "Davis",
  },
  {
    company: "SteelCorp",
    cscsCardNo: "99887766",
    cscsExpiryDate: "2025-06-22",
    cscsExpiryTone: "emerald",
    email: "w.brown@steelcorp.com",
    expiryDate: "2026-03-15",
    expiryTone: "emerald",
    ipaf: "Yes",
    name: "William",
    pasma: "No",
    profession: "Steel Fixer",
    ssstsSmsts: "SSTS",
    surname: "Brown",
  },
  {
    company: "ColorPro",
    cscsCardNo: "55667788",
    cscsExpiryDate: "2024-09-18",
    cscsExpiryTone: "red",
    email: "otaylor@example.com",
    expiryDate: "N/A",
    expiryTone: "red",
    ipaf: "No",
    name: "Olivia",
    pasma: "Yes",
    profession: "Painter",
    ssstsSmsts: "None",
    surname: "Taylor",
  },
]

const columns: ColDef<UserRow>[] = [
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
    cellRenderer: (params: { data?: UserRow }) =>
      params.data ? <UserProfileDialog user={params.data} /> : null,
  },
]

export function UsersScreen() {
  return (
    <div className="w-full min-w-0 px-6 py-4 space-y-6">
      <h2>Users</h2>
      <AgTable rowData={users} columnDefs={columns} height="auto" />
    </div>
  )
}
