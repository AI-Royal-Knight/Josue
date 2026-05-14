"use client"

import React, { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { Download, Filter } from "lucide-react"

export default function Filters() {
  const [projectFilter, setProjectFilter] = useState("all-projects")
  const [supplierFilter, setSupplierFilter] = useState("all-suppliers")
  return (
    <div className="flex items-center justify-end gap-3">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Filter className="size-3.5" />
        Filters :
      </div>

      <Select value={projectFilter} onValueChange={setProjectFilter}>
        <SelectTrigger className="h-9 w-[130px] border-[#2d2d2d] bg-[#101012] text-xs text-slate-200">
          <SelectValue placeholder="All Projects" />
        </SelectTrigger>
        <SelectContent className="border-[#2d2d2d] bg-[#101012] text-slate-200">
          <SelectItem value="all-projects">All Projects</SelectItem>
          <SelectItem value="project-a">Project A</SelectItem>
          <SelectItem value="project-b">Project B</SelectItem>
        </SelectContent>
      </Select>

      <Select value={supplierFilter} onValueChange={setSupplierFilter}>
        <SelectTrigger className="h-9 w-[130px] border-[#2d2d2d] bg-[#101012] text-xs text-slate-200">
          <SelectValue placeholder="All Suppliers" />
        </SelectTrigger>
        <SelectContent className="border-[#2d2d2d] bg-[#101012] text-slate-200">
          <SelectItem value="all-suppliers">All Suppliers</SelectItem>
          <SelectItem value="office">Office</SelectItem>
          <SelectItem value="construction">Construction</SelectItem>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-9 border-[#2d2d2d] bg-[#101012] text-xs text-slate-200 hover:bg-[#1a1a1e]"
          >
            <Download className="mr-1.5 size-3.5" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44 border-[#2d2d2d] bg-[#101012] text-slate-200">
          <DropdownMenuItem className="text-xs">
            Export as Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs">
            Export as CSV (.csv)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
