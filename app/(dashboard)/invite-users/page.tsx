"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { ColDef } from "ag-grid-community"
import InviteUserDialog from "./invite-modal"
import { AgTable } from "@/components/common/AgTable"

type UserRow = {
  name: string
  surname: string
  email: string
  profession: string
  cscsCardNo: string
  cscsExpiryDate: string
  ipaf: string
  pasma: string
  company: string
  ssstsSmsts: string
  expiryDate: string
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
  { headerName: "First Name", field: "name" },
  { headerName: "Last Name", field: "surname" },
  { headerName: "Email", field: "email" },
  { headerName: "Profession", field: "profession" },
  { headerName: "CSCS Card No.", field: "cscsCardNo" },
  { headerName: "CSCS Expiry Date", field: "cscsExpiryDate" },
  { headerName: "IPAF", field: "ipaf" },
  { headerName: "PASMA", field: "pasma" },
  { headerName: "Company", field: "company" },
  { headerName: "SSSTS/SMSTS", field: "ssstsSmsts" },
  { headerName: "SSSTS/SMSTS Expiry", field: "expiryDate" },
  { headerName: "Approved User", field: "approvedUser" },
  { headerName: "Approved By", field: "approvedBy" },
]

export default function Page() {
  return (
    <div className="w-full space-y-6 p-6">
      <h2 className="text-xl font-semibold">Document Controller</h2>

      <div className="flex items-start justify-between gap-6">
        <div className="space-y-5">
          <div className="flex items-center gap-8">
            <InviteUserDialog />
          </div>
        </div>

        <Card className="min-w-[230px] overflow-hidden border border-cyan-500/60 bg-[#1a2a3f]">
          <CardContent className="space-y-4">
            <div className="border-b border-cyan-500/40 pb-2 text-xs text-slate-200">
              Users Summary
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Users</span>
                <span>4</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Approved users</span>
                <span>2</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>CSCS Card Expired</span>
                <span className="text-red-400">2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <AgTable rowData={users} columnDefs={columnDefs} />
    </div>
  )
}
