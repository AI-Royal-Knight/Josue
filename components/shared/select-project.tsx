import React, { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { getProcurementProjects, ProcurementProject } from "@/lib/api/quotations"

type Props = {
  value?: string
  onChange?: (value: string) => void
  onProjectSelect?: (project: ProcurementProject | null) => void
}

export default function SelectProject({ value, onChange, onProjectSelect }: Props) {
  const [projects, setProjects] = useState<ProcurementProject[]>([])
  const [internalSelected, setInternalSelected] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const selectedValue = value !== undefined ? value : internalSelected

  const handleValueChange = (newVal: string) => {
    if (value === undefined) {
      setInternalSelected(newVal)
    }
    if (onChange) {
      onChange(newVal)
    }
    if (onProjectSelect) {
      const found = projects.find((p) => String(p.id) === newVal) ?? null
      onProjectSelect(found)
    }
  }

  useEffect(() => {
    getProcurementProjects()
      .then((data) => {
        setProjects(data)
        // Only set default if no value is provided and nothing is selected
        if (data.length > 0 && !value && !internalSelected) {
          const first = data[0]
          handleValueChange(String(first.id))
          if (onProjectSelect) onProjectSelect(first)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="w-1/3">
      <label className="mb-2 block text-sm font-medium text-slate-300">
        Select Project
      </label>
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger className="border-white/10 bg-slate-900">
          <SelectValue placeholder={loading ? "Loading..." : "Select project"} />
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-slate-900">
          {projects.length === 0 && !loading ? (
            <SelectItem value="none" disabled>
              No project assigned to you
            </SelectItem>
          ) : (
            projects.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.project_name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
