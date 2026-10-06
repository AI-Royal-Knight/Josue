"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { adminApi, ProjectData } from "@/lib/api/admin"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function InviteProjectAdminForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await adminApi.getProjects()
        setProjects(data)
      } catch (error) {
        console.error("Failed to load projects:", error)
      }
    }
    fetchProjects()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const email = formData.get("email") as string
    const first_name = formData.get("first_name") as string
    const last_name = formData.get("last_name") as string

    setIsPending(true)
    setMessage(null)

    try {
      const payload = {
        email,
        first_name,
        last_name,
        ...(selectedProjectIds.length > 0 && { project_ids: selectedProjectIds })
      }
      
      const result = await adminApi.inviteProjectAdmin(payload)
      setMessage(result.message)
      form.reset()
      setSelectedProjectIds([])
      toast.success("Invitation sent successfully")
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send invitation")
    } finally {
      setIsPending(false)
    }
  }

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds((current) =>
      current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId]
    )
  }

  const filteredProjects = projects.filter((p) =>
    p.project_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <Field>
        <FieldLabel htmlFor="first_name">First Name</FieldLabel>
        <FieldContent>
          <Input
            id="first_name"
            name="first_name"
            type="text"
            placeholder="Enter first name"
            required
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
        <FieldContent>
          <Input
            id="last_name"
            name="last_name"
            type="text"
            placeholder="Enter last name"
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
            placeholder="Enter email address"
            required
          />
        </FieldContent>
      </Field>
      
      <Field>
        <FieldLabel>Assign Projects (Optional)</FieldLabel>
        <FieldContent>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-auto min-h-10 px-3 py-2 font-normal"
              >
                <div className="flex flex-wrap gap-1">
                  {selectedProjectIds.length === 0 && (
                    <span className="text-muted-foreground">Select projects...</span>
                  )}
                  {selectedProjectIds.map((id) => {
                    const project = projects.find((p) => p.id === id)
                    return project ? (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="mr-1 mb-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleProject(id)
                        }}
                      >
                        {project.project_name}
                        <X className="ml-1 h-3 w-3 cursor-pointer hover:bg-muted rounded-full" />
                      </Badge>
                    ) : null
                  })}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <div className="flex items-center border-b px-3">
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex h-10 w-full border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="max-h-[200px] overflow-y-auto p-1">
                {filteredProjects.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    No projects found.
                  </p>
                ) : (
                  filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => toggleProject(project.id)}
                      className={cn(
                        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                        selectedProjectIds.includes(project.id) ? "bg-accent/50" : ""
                      )}
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        {selectedProjectIds.includes(project.id) && (
                          <Check className="h-4 w-4" />
                        )}
                      </span>
                      {project.project_name}
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </FieldContent>
      </Field>

      <div className="flex justify-end gap-2 mt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending..." : "Send Invite"}
        </Button>
      </div>
      {message && (
        <p className="text-sm text-green-600 mt-2">{message}</p>
      )}
    </form>
  )
}
