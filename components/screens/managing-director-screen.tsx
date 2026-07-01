"use client"

import type { ColDef } from "ag-grid-community"
import { useEffect, useState } from "react"
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
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { adminApi, ManagingDirectorData } from "@/lib/api/admin"
import { ExportCsvButton } from "@/components/common/export-csv-button"

type DirectorRow = {
  name: string
  surname: string
  emailAddress: string
  status: string
  dateJoined: string
}

const columns: ColDef<DirectorRow>[] = [
  { headerName: "Name", field: "name" },
  { headerName: "Surname", field: "surname" },
  { headerName: "Email Address", field: "emailAddress" },
  { headerName: "Status", field: "status" },
  { headerName: "Date Joined", field: "dateJoined" },
]

function InviteManagingDirectorDialog({ onSuccess }: { onSuccess: () => void }) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !firstName || !lastName) return

    setIsLoading(true)
    try {
      const response = await adminApi.inviteManagingDirector({ 
        first_name: firstName,
        last_name: lastName,
        email: email 
      })
      toast.success(response.message || "Invitation sent successfully.")
      setIsOpen(false)
      setFirstName("")
      setLastName("")
      setEmail("")
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <Field>
            <FieldLabel htmlFor="firstName">First Name</FieldLabel>
            <FieldContent>
              <Input 
                id="firstName" 
                name="firstName" 
                placeholder="Enter first name" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
            <FieldContent>
              <Input 
                id="lastName" 
                name="lastName" 
                placeholder="Enter last name" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <FieldContent>
              <Input 
                id="email" 
                name="email" 
                type="email"
                placeholder="Enter email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FieldContent>
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ManagingDirectorScreen() {
  const [data, setData] = useState<ManagingDirectorData[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getManagingDirectors()
      setData(response.managing_directors)
    } catch (error: any) {
      toast.error(error.message || "Failed to load managing directors")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const rowData: DirectorRow[] = data.map((md) => ({
    name: md.first_name,
    surname: md.last_name,
    emailAddress: md.email,
    status: md.is_active ? "Active" : "Inactive",
    dateJoined: new Date(md.date_joined).toLocaleDateString(),
  }))

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 px-6">
      <div className="flex items-center justify-between gap-4 py-4">
         <h2>Managing Director</h2>
        <div className="flex items-center gap-2">
          <InviteManagingDirectorDialog onSuccess={loadData} />
          <ExportCsvButton<DirectorRow>
            rows={rowData}
            fileNamePrefix="managing-directors"
            label="Export"
            columns={[
              { header: "Name", field: "name" },
              { header: "Surname", field: "surname" },
              { header: "Email Address", field: "emailAddress" },
              { header: "Status", field: "status" },
              { header: "Date Joined", field: "dateJoined" },
            ]}
          />
        </div>
      </div>
      <AgTable rowData={rowData} columnDefs={columns} height="auto" />
    </div>
  )
}
