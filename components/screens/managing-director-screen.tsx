"use client"

import type { ColDef } from "ag-grid-community"

import { AgTable } from "@/components/common/AgTable"
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

const columns: ColDef<DirectorRow>[] = [
  { headerName: "Name", field: "name" },
  { headerName: "Surname", field: "surname" },
  { headerName: "Email Address", field: "emailAddress" },
]

function InviteManagingDirectorDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Send Invite</Button>
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
          <Button>Send Invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ManagingDirectorScreen() {
  return (
    <div className="w-full min-w-0 px-6">
      <div className="flex items-center justify-between gap-4 py-4">
         <h2>Managing Director</h2>
        <InviteManagingDirectorDialog />
        {/* <Button variant={"outline"}>
          <Download />
          Export
        </Button> */}
      </div>
      <AgTable rowData={directors} columnDefs={columns} height="auto" />
    </div>
  )
}
