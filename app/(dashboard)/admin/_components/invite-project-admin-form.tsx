"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { inviteProjectAdmin } from "../actions"
import { useFormStatus } from "react-dom"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"

type InviteResult =
  | { success: true; message: string }
  | { success: false; error: string }

const ROLES = [
  { value: "project_admin", label: "Project Admin" },
  { value: "project_director", label: "Project Director" },
  { value: "supervisor", label: "Supervisor" },
  { value: "finance_department", label: "Finance Department" },
  { value: "procurement_department", label: "Procurement Department" },
  { value: "commercial_department", label: "Commercial Department" },
]

const PROJECTS = [
  { value: "alpha", label: "Alpha" },
  { value: "beta", label: "Beta" },
  { value: "gamma", label: "Gamma" },
  { value: "delta", label: "Delta" },
  { value: "epsilon", label: "Epsilon" },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending..." : "Send Invite"}
    </Button>
  )
}

export default function InviteProjectAdminForm() {
  const [role, setRole] = useState("")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await inviteProjectAdmin(null, formData)
      if (result.success) {
        setMessage(result.message)
        e.currentTarget.reset()
        setRole("")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <Field>
        <FieldLabel htmlFor="email">Email Address</FieldLabel>
        <FieldContent>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            required
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor="role">Role</FieldLabel>
        <FieldContent>
          <Select value={role} onValueChange={setRole} name="role" required>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor="project">Project Assignment</FieldLabel>
        <FieldContent>
          <Select name="project">
            <SelectTrigger id="project">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {PROJECTS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldContent>
      </Field>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <SubmitButton />
      </div>
      {message && (
        <p className="text-sm text-green-600">{message}</p>
      )}
    </form>
  )
}
