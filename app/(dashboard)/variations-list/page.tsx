"use client"

import { useState, useMemo } from "react"
import type { ColDef } from "ag-grid-community"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type VariationRow = {
  no: string
  date: string
  variationSheetNumber: string
  project: string
  createdBy: string
  comments: string
  assignedUser: string
  assignedUserIds: string[]
}

const summaryMetrics = [
  { label: "Variations QTY", value: "0000" },
  { label: "Added to Variation Summary", value: "400" },
  { label: "Variations Value", value: "000" },
  { label: "Approved Variations", value: "000" },
  { label: "Awaiting Approval", value: "000" },
  { label: "Submitted to Client", value: "000" },
  { label: "Signed by Client", value: "000" },
]

const ALL_USERS = [
  {
    id: "alison",
    name: "Alison Tylor",
    initials: "AC",
    color: "bg-[#3b82f6] text-white",
  },
  {
    id: "alex",
    name: "Alex Wanchis",
    initials: "AW",
    color: "bg-[#8b5cf6] text-white",
  },
  {
    id: "chanu",
    name: "Chanu Clap",
    initials: "CC",
    color: "bg-[#14b8a6] text-white",
  },
  {
    id: "chailau",
    name: "Chailau",
    initials: "CL",
    color: "bg-[#f43f5e] text-white",
  },
  {
    id: "provin",
    name: "Provin Kumar",
    initials: "PK",
    color: "bg-[#f97316] text-white",
  },
  {
    id: "yoshi",
    name: "Yoshi Kub",
    initials: "YK",
    color: "bg-[#d946ef] text-white",
  },
  {
    id: "sm",
    name: "Site Manager",
    initials: "SM",
    color: "bg-[#10b981] text-white",
  },
  {
    id: "jw",
    name: "John Watson",
    initials: "JW",
    color: "bg-[#6366f1] text-white",
  },
  {
    id: "er",
    name: "Emily Rose",
    initials: "ER",
    color: "bg-[#f43f5e] text-white",
  },
  {
    id: "mj",
    name: "Mark Jones",
    initials: "MJ",
    color: "bg-[#f59e0b] text-white",
  },
  {
    id: "pp",
    name: "Peter Parker",
    initials: "PP",
    color: "bg-[#a855f7] text-white",
  },
]

const initialRows: VariationRow[] = [
  {
    no: "1",
    date: "12-01-2024",
    variationSheetNumber: "A",
    project: "Project A",
    createdBy: "",
    comments: "This is a comment",
    assignedUser: "John Smith",
    assignedUserIds: ["sm", "jw", "er"],
  },
  {
    no: "2",
    date: "12-01-2024",
    variationSheetNumber: "B",
    project: "Project B",
    createdBy: "",
    comments: "This is a comment",
    assignedUser: "Alex Wanchis",
    assignedUserIds: ["alex"],
  },
  {
    no: "3",
    date: "12-01-2024",
    variationSheetNumber: "C",
    project: "Project C",
    createdBy: "",
    comments: "This is a comment",
    assignedUser: "Chanu Clap",
    assignedUserIds: ["chanu"],
  },
  {
    no: "4",
    date: "12-01-2024",
    variationSheetNumber: "D",
    project: "Project A",
    createdBy: "",
    comments: "This is a comment",
    assignedUser: "Chailau",
    assignedUserIds: ["chailau"],
  },
  {
    no: "5",
    date: "12-01-2024",
    variationSheetNumber: "E",
    project: "Project B",
    createdBy: "",
    comments: "This is a comment",
    assignedUser: "Provin Kumar",
    assignedUserIds: ["provin"],
  },
]

export default function Page() {
  const [selectedProject, setSelectedProject] = useState("project-a")
  const [tableData, setTableData] = useState<VariationRow[]>(initialRows)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeRowNo, setActiveRowNo] = useState<string | null>(null)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const columns = useMemo<ColDef<VariationRow>[]>(
    () => [
      {
        headerName: "No.",
        field: "no",
        maxWidth: 70,
        filter: false,
      },
      {
        headerName: "Date",
        field: "date",
      },
      {
        headerName: "Variation Sheet Number",
        field: "variationSheetNumber",
      },
      {
        headerName: "Project",
        field: "project",
      },
      {
        headerName: "Created by",
        field: "createdBy",
      },
      {
        headerName: "Assign Users",
        field: "assignedUserIds",
        maxWidth: 160,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        cellRenderer: (params: { data?: VariationRow }) => {
          const row = params.data
          if (!row) return null

          const userIds = row.assignedUserIds || []
          const displayLimit = 3
          const displayedIds = userIds.slice(0, displayLimit)
          const hasOverflow = userIds.length > displayLimit

          return (
            <button
              data-cell-click-ignore="true"
              onClick={() => {
                setActiveRowNo(row.no)
                setSelectedUserIds(userIds)
                setSearchQuery("")
                setIsDialogOpen(true)
              }}
              className="flex h-full cursor-pointer items-center justify-center -space-x-1.5 transition hover:opacity-80 focus:outline-none"
            >
              {displayedIds.map((id, index) => {
                const user = ALL_USERS.find((u) => u.id === id)
                const initials = user
                  ? user.initials
                  : id.toUpperCase().slice(0, 2)
                const color = user ? user.color : "bg-slate-600 text-white"
                return (
                  <div
                    key={id}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#10183a] text-[10px] font-bold ${color} select-none`}
                    style={{ zIndex: 10 - index }}
                  >
                    {initials}
                  </div>
                )
              })}
              {hasOverflow && (
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#10183a] bg-slate-800 text-[10px] font-bold text-slate-300 select-none"
                  style={{ zIndex: 0 }}
                >
                  +
                </div>
              )}
            </button>
          )
        },
      },
      {
        headerName: "Comments",
        field: "comments",
      },
    ],
    []
  )

  const filteredUsers = useMemo(() => {
    // Keep Alison Tylor, Alex Wanchis, Chanu Clap, Chailau, Provin Kumar, Yoshi Kub at the top or in the displayed sequence.
    // We filter based on search query.
    return ALL_USERS.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const handleAssignUser = () => {
    if (!activeRowNo) return
    setTableData((prev) =>
      prev.map((row) => {
        if (row.no === activeRowNo) {
          return {
            ...row,
            assignedUserIds: selectedUserIds,
          }
        }
        return row
      })
    )
    setIsDialogOpen(false)
  }

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h2 className="mb-4 text-2xl font-semibold">Variations List</h2>
        <div className="max-w-xs">
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
      </div>

      {/* <TableStat summaryRows={summaryMetrics} /> */}

      <div className="mt-8 overflow-x-auto">
        <AgTable
          rowData={tableData}
          columnDefs={columns}
          height="auto"
          defaultColDef={{ minWidth: 180 }}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Users</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 border-white/10 bg-slate-900"
          />

          <div className="max-h-[300px] space-y-4 overflow-y-auto pr-1">
            {filteredUsers.map((user) => {
              const isChecked = selectedUserIds.includes(user.id)
              return (
                <div
                  key={user.id}
                  className="flex items-center space-x-3.5 py-1"
                >
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUserIds((prev) => [...prev, user.id])
                      } else {
                        setSelectedUserIds((prev) =>
                          prev.filter((id) => id !== user.id)
                        )
                      }
                    }}
                  />
                  <label
                    htmlFor={`user-${user.id}`}
                    className="cursor-pointer text-[14px] leading-none font-medium text-slate-200 select-none"
                  >
                    {user.name}
                  </label>
                </div>
              )
            })}
            {filteredUsers.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-500">
                No users found
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-slate-800/80 pt-4">
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleAssignUser}>Assign User</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
