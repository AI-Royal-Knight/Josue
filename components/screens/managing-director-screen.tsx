"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DynamicTable } from "@/components/dynamic-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Download } from "lucide-react"

type DirectorRow = {
  name: string
  surname: string
  emailAddress: string
}

const directors: DirectorRow[] = [
  {
    emailAddress: "r.branson@example.com",
    name: "Richard",
    surname: "Branson",
  },
  {
    emailAddress: "e.musk@example.com",
    name: "Elon",
    surname: "Musk",
  },
  {
    emailAddress: "t.cook@example.com",
    name: "Tim",
    surname: "Cook",
  },
]

const columns: ColumnDef<DirectorRow>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "surname", header: "Surname" },
  { accessorKey: "emailAddress", header: "Email Address" },
]

function InviteManagingDirectorDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-8 rounded-none bg-blue-600 px-4 text-[11px] text-white hover:bg-blue-500">
          Send Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Invite Managing Director</DialogTitle>
          <DialogDescription>
            Send an invitation to a new managing director.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 py-4">
          <Field>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <FieldContent>
              <Input id="email" name="email" placeholder="Enter email" />
            </FieldContent>
          </Field>
        </form>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-500">
            Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ManagingDirectorScreen() {
  return (
    <div className="w-full min-w-0 px-6">
      <div className="flex items-center justify-end gap-4 py-4">
        <InviteManagingDirectorDialog />
        <Button variant={"outline"}>
          <Download />
          Export
        </Button>
      </div>
      <DynamicTable columns={columns} data={directors} initialSortId="name" />
    </div>
  )
}
