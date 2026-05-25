import React, { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

export default function SelectProject() {
  const [selectedProject, setSelectedProject] = useState("project-a")
  return (
    <div className="w-1/3">
      <label className="mb-2 block text-sm font-medium text-slate-300">
        Select Project
      </label>
      <Select value={selectedProject} onValueChange={setSelectedProject}>
        <SelectTrigger className="border-white/10 bg-slate-900">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-slate-900">
          <SelectItem value="project-a">Project A</SelectItem>
          <SelectItem value="project-b">Project B</SelectItem>
          <SelectItem value="project-c">Project C</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
