"use client"

import { useState, useMemo, useCallback } from "react"
import type { ColDef } from "ag-grid-community"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Plus, Search, XCircle } from "lucide-react"
import { useRoleStore } from "@/lib/role-store"

import { VariationRow, VariationFormData } from "./types"
import { PROJECTS, formatGBP, ALL_USERS, buildVariationDocHtml, initialRows, summaryMetrics } from "./utils"
import CreateVariationDialog from "./_components/CreateVariationDialog"
import AssignUsersDialog from "./_components/AssignUsersDialog"
import ApprovalDialog from "./_components/ApprovalDialog"
import ViewVariationDialog from "./_components/ViewVariationDialog"
import ReminderDialog from "./_components/ReminderDialog"

let _nextId = 5

export default function Page() {
  const [selectedProject, setSelectedProject] = useState("all")
  const [rows, setRows] = useState<VariationRow[]>(initialRows)

  const role = useRoleStore((state) => state.role)

  // Create variation dialog
  const [formOpen, setFormOpen] = useState(false)

  // Assign users dialog
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignRowId, setAssignRowId] = useState<string | null>(null)
  const [assignInitial, setAssignInitial] = useState<string[]>([])

  // Approval confirmation
  const [pendingApproval, setPendingApproval] = useState<{
    id: string; voNo: string; action: "approve" | "reject"
  } | null>(null)

  // Variation View/Download/Submit
  const [variationDialogOpen, setVariationDialogOpen] = useState(false)
  const [selectedVariation, setSelectedVariation] = useState<VariationRow | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reminder Dialog
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [selectedReminder, setSelectedReminder] = useState<VariationRow | null>(null)
  const [isSendingReminder, setIsSendingReminder] = useState(false)

  const openReminder = useCallback((row: VariationRow) => {
    setSelectedReminder(row)
    setReminderDialogOpen(true)
  }, [])

  const handleSendReminder = useCallback(() => {
    if (!selectedReminder) return
    setIsSendingReminder(true)
    setTimeout(() => {
      setIsSendingReminder(false)
      setReminderDialogOpen(false)
    }, 1000)
  }, [selectedReminder])

  const openVariation = useCallback((row: VariationRow) => {
    setSelectedVariation(row)
    setVariationDialogOpen(true)
  }, [])

  const downloadVariationDoc = useCallback((row: VariationRow) => {
    const html = buildVariationDocHtml(row)
    const blob = new Blob([html], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${row.voNo}.doc`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [])

  const submitVariationToClient = useCallback((name: string, email: string) => {
    if (!selectedVariation || !name || !email) return
    setIsSubmitting(true)
    setTimeout(() => {
      setRows((prev) =>
        prev.map((r) =>
          r.id === selectedVariation.id ? { ...r, submittedToClient: true } : r
        )
      )
      setIsSubmitting(false)
      setVariationDialogOpen(false)
    }, 1000)
  }, [selectedVariation])

  const handleSubmitVariation = useCallback((form: VariationFormData, formTotal: number) => {
    const today = new Date().toISOString().slice(0, 10)
    _nextId++
    const newRow: VariationRow = {
      id: String(_nextId),
      voNo: `VO-${String(_nextId).padStart(3, "0")}`,
      date: today,
      variationSheetNumber: String.fromCharCode(64 + _nextId),
      project: form.project || "Project A",
      siteInstructionNo: form.siteInstructionNo,
      descriptionOfWorks: form.descriptionOfWorks,
      createdBy: "Current User",
      lines: form.lines,
      totalAmount: formTotal,
      evidence: "",
      comments: form.comments,
      assignedUserIds: [],
      approvalStatus: "Pending",
      approvedBy: "",
      submittedToClient: false,
      signedByClient: false,
    }
    setRows((prev) => [...prev, newRow])
    setFormOpen(false)
  }, [])

  const confirmApproval = () => {
    if (!pendingApproval) return
    setRows((prev) =>
      prev.map((r) =>
        r.id === pendingApproval.id
          ? {
              ...r,
              approvalStatus: pendingApproval.action === "approve" ? "Approved" : "Rejected",
              approvedBy: pendingApproval.action === "approve" ? "Commercial Manager" : "",
            }
          : r
      )
    )
    setPendingApproval(null)
  }

  const openAssign = useCallback((rowId: string, currentIds: string[]) => {
    setAssignRowId(rowId)
    setAssignInitial(currentIds)
    setAssignOpen(true)
  }, [])

  const confirmAssign = (selectedIds: string[]) => {
    if (!assignRowId) return
    setRows((prev) =>
      prev.map((r) =>
        r.id === assignRowId ? { ...r, assignedUserIds: selectedIds } : r
      )
    )
    setAssignOpen(false)
  }

  const columns = useMemo<ColDef<VariationRow>[]>(() => {
    const base: ColDef<VariationRow>[] = [
      {
        headerName: "VO No.",
        field: "voNo",
        cellRenderer: (params: { data?: VariationRow; value: string }) => (
          <button
            type="button"
            className="text-emerald-500 hover:underline"
            onClick={(event) => {
              event.stopPropagation()
              if (!params.data) return
              openVariation(params.data)
            }}
          >
            {params.value}
          </button>
        )
      },
      { headerName: "Date", field: "date", minWidth: 120 },
      { headerName: "Variation No.", field: "variationSheetNumber" },
      { headerName: "Project", field: "project" },
      {
        headerName: "Site Instruction No.",
        field: "siteInstructionNo",
        minWidth: 180,
      },
      {
        headerName: "Description of Works",
        field: "descriptionOfWorks",
        minWidth: 220,
      },
      {
        headerName: "Total Amount",
        field: "totalAmount",
        minWidth: 140,
        cellRenderer: (params: { value: number }) => (
          <span className="font-medium text-slate-100">
            {formatGBP(params.value)}
          </span>
        ),
      },
      {
        headerName: "Labour Target",
        field: "lines",
        colId: "labourTarget",
        minWidth: 140,
        cellRenderer: (params: { data?: VariationRow }) => {
          const lines = params.data?.lines ?? []
          const total = lines.reduce((s, l) => s + (l.labourTarget ?? 0), 0)
          if (total === 0) return <span className="text-slate-500">—</span>
          return (
            <span className="font-medium text-amber-300">
              {formatGBP(total)}
            </span>
          )
        },
      },
      { headerName: "Created By", field: "createdBy" },
    ]

    if (role === "commercial_department") {
      base.push({
        headerName: "Approval",
        field: "approvalStatus",
        minWidth: 200,
        cellRenderer: (params: { data?: VariationRow }) => {
          const row = params.data
          if (!row) return null
          const s = row.approvalStatus
          if (s === "Approved")
            return (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">
                <CheckCircle2 className="size-3" /> Approved
              </span>
            )
          if (s === "Rejected")
            return (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-300">
                <XCircle className="size-3" /> Rejected
              </span>
            )
          return (
            <div className="flex gap-1">
              <Button
                className="h-7 rounded-none bg-emerald-600 px-2 text-xs text-white hover:bg-emerald-500"
                onClick={() =>
                  setPendingApproval({
                    id: row.id,
                    voNo: row.voNo,
                    action: "approve",
                  })
                }
              >
                Approve
              </Button>
              <Button
                className="h-7 rounded-none bg-red-600 px-2 text-xs text-white hover:bg-red-500"
                onClick={() =>
                  setPendingApproval({
                    id: row.id,
                    voNo: row.voNo,
                    action: "reject",
                  })
                }
              >
                Reject
              </Button>
            </div>
          )
        },
      })
    }

    base.push(
      { headerName: "Approved By", field: "approvedBy" },
      {
        headerName: "Submitted to Client",
        field: "submittedToClient",
        cellRenderer: (params: { value: boolean }) => (
          <span
            className={params.value ? "text-emerald-400" : "text-slate-500"}
          >
            {params.value ? "Yes" : "No"}
          </span>
        ),
      },
      {
        headerName: "Signed by Client",
        field: "signedByClient",
        cellRenderer: (params: { data?: VariationRow; value: boolean }) => {
          if (params.value) return <span className="text-emerald-400">Yes</span>
          return (
            <button
              type="button"
              className="text-amber-500 hover:underline"
              onClick={(e) => {
                e.stopPropagation()
                if (params.data) openReminder(params.data)
              }}
            >
              No (Remind)
            </button>
          )
        },
      },
      {
        headerName: "Assigned Users",
        field: "assignedUserIds",
        maxWidth: 160,
        cellRenderer: (params: { data?: VariationRow }) => {
          const row = params.data
          if (!row) return null
          const ids = row.assignedUserIds
          const shown = ids.slice(0, 3)
          return (
            <button
              data-cell-click-ignore="true"
              className="flex h-full items-center -space-x-1.5 hover:opacity-80"
              onClick={() => openAssign(row.id, ids)}
            >
              {shown.map((id, i) => {
                const u = ALL_USERS.find((x) => x.id === id)
                return (
                  <div
                    key={id}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#10183a] text-[10px] font-bold ${u?.color ?? "bg-slate-600 text-white"}`}
                    style={{ zIndex: 10 - i }}
                  >
                    {u?.initials ?? id.slice(0, 2).toUpperCase()}
                  </div>
                )
              })}
              {ids.length > 3 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#10183a] bg-slate-700 text-[10px] font-bold text-slate-300">
                  +{ids.length - 3}
                </div>
              )}
              {ids.length === 0 && (
                <span className="text-xs text-slate-500">Assign</span>
              )}
            </button>
          )
        },
      },
      { headerName: "Comments", field: "comments", minWidth: 180 }
    )

    return base
  }, [openAssign, role])

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Variations</h2>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Create Variation
        </Button>
      </div>

      {/* Project filter */}
      <div className="max-w-xs">
        <label className="mb-2 block text-sm font-medium text-slate-300">Select Project</label>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="border-white/10 bg-slate-900"><SelectValue /></SelectTrigger>
          <SelectContent className="border-white/10 bg-slate-900">
            <SelectItem value="all">All Projects</SelectItem>
            {PROJECTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <TableStat summaryRows={summaryMetrics} />

      <AgTable
        rowData={selectedProject === "all" ? rows : rows.filter((r) => r.project === selectedProject)}
        columnDefs={columns}
        suppressCellClickAction
        height="auto"
        defaultColDef={{ flex: 1, minWidth: 150 }}
        gridOptions={{ rowHeight: 48 }}
      />

      <CreateVariationDialog open={formOpen} onOpenChange={setFormOpen} onSubmit={handleSubmitVariation} />

      <AssignUsersDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        initialSelected={assignInitial}
        onAssign={confirmAssign}
      />

      <ApprovalDialog
        pendingApproval={pendingApproval}
        onOpenChange={(open) => !open && setPendingApproval(null)}
        onConfirm={confirmApproval}
      />

      <ViewVariationDialog
        open={variationDialogOpen}
        onOpenChange={setVariationDialogOpen}
        variation={selectedVariation}
        onDownload={downloadVariationDoc}
        onSubmitToClient={submitVariationToClient}
        isSubmitting={isSubmitting}
      />

      <ReminderDialog
        open={reminderDialogOpen}
        onOpenChange={setReminderDialogOpen}
        variation={selectedReminder}
        onSendReminder={handleSendReminder}
        isSending={isSendingReminder}
      />
    </div>
  )
}
