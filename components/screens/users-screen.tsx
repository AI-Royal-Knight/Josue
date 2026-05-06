"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DynamicTable } from "@/components/dynamic-table"
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

const columns: ColumnDef<UserRow>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "surname", header: "Surname" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "profession", header: "Profession" },
  { accessorKey: "cscsCardNo", header: "CSCS Card No" },
  {
    accessorKey: "cscsExpiryDate",
    header: "CSCS Expiry Date",
    cell: ({ row }) => (
      <span
        className={
          row.original.cscsExpiryTone === "red"
            ? "text-red-500"
            : "text-emerald-400"
        }
      >
        {row.original.cscsExpiryDate}
      </span>
    ),
  },
  { accessorKey: "ipaf", header: "IPAF" },
  {
    accessorKey: "pasma",
    header: "PASMA",
    cell: ({ row }) => (
      <span className="whitespace-pre-line">{row.original.pasma}</span>
    ),
  },
  { accessorKey: "company", header: "Company" },
  { accessorKey: "ssstsSmsts", header: "SSSTS/SMSTS" },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => (
      <span
        className={
          row.original.expiryTone === "red"
            ? "text-red-500"
            : "text-emerald-400"
        }
      >
        {row.original.expiryDate}
      </span>
    ),
  },
  {
    id: "profile",
    header: "Profile",
    cell: ({ row }) => <UserProfileDialog user={row.original} />,
  },
]

export function UsersScreen() {
  return <DynamicTable columns={columns} data={users} initialSortId="name" />
}
