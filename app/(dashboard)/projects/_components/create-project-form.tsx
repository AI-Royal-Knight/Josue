"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { createProject } from "../actions"
import { useFormStatus } from "react-dom"

export default function CreateProjectForm() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createProject(null, formData)
      if (result.success) {
        setMessage(result.message)
        e.currentTarget.reset()
      } else {
        setMessage(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="projectName">Project Name</FieldLabel>
          <FieldContent>
            <Input id="projectName" name="projectName" required />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="jobCode">Job Code</FieldLabel>
          <FieldContent>
            <Input id="jobCode" name="jobCode" />
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="vatTemp">VAT/Temp</FieldLabel>
          <FieldContent>
            <Input id="vatTemp" name="vatTemp" />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <FieldContent>
            <Input id="address" name="address" />
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="projectValue">Project Value</FieldLabel>
          <FieldContent>
            <Input id="projectValue" name="projectValue" />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
          <FieldContent>
            <Input id="startDate" name="startDate" type="date" />
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="completionDate">Completion Date</FieldLabel>
          <FieldContent>
            <Input id="completionDate" name="completionDate" type="date" />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="monthlyApplicationDate">Monthly Application Date</FieldLabel>
          <FieldContent>
            <Input id="monthlyApplicationDate" name="monthlyApplicationDate" />
          </FieldContent>
        </Field>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit">Create Project</Button>
      </div>

      {message && <p className="text-sm text-green-600">{message}</p>}
    </form>
  )
}
