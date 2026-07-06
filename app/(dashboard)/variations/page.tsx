"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import type { ColDef } from "ag-grid-community"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Plus, XCircle, Loader2 } from "lucide-react"
import { useRoleStore } from "@/lib/role-store"
import { toast } from "sonner"

import { VariationRow, VariationFormData } from "./types"
import { formatGBP, buildVariationDocHtml } from "./utils"
import CreateVariationDialog from "./_components/CreateVariationDialog"
import AssignUsersDialog from "./_components/AssignUsersDialog"
import ApprovalDialog from "./_components/ApprovalDialog"
import ViewVariationDialog from "./_components/ViewVariationDialog"
import ReminderDialog from "./_components/ReminderDialog"

import {
  getVariations,
  createVariation,
  approveVariation,
  submitVariationToClient,
  type VariationApi,
} from "@/lib/api/variations"
import { getMyProjects } from "@/lib/api/project-admin"
import type { ProjectItem } from "@/constants/projects"

// ── Helpers ────────────────────────────────────────────────────────────────

function apiToRow(v: VariationApi): VariationRow {
  return {
    id: v.id,
    voNo: v.vo_number,
    date: v.date,
    variationSheetNumber: v.variation_sheet_number,
    project: v.project_name,
    projectId: v.project,
    siteInstructionNo: v.site_instruction_no,
    descriptionOfWorks: v.description_of_works,
    createdBy: v.created_by_name,
    lines: v.lines.map((l) => ({
      no: "",
      siteInstruction: l.site_instruction,
      workArea: l.work_area,
      workSection: l.work_section,
      labour: parseFloat(l.labour),
      labourTarget: parseFloat(l.labour_target),
      material: parseFloat(l.material),
      qty: parseFloat(l.qty),
    })),
    totalAmount: parseFloat(v.total_amount),
    evidence: "",
    comments: v.comments,
    assignedUserIds: [],
    approvalStatus:
      v.approval_status === "approved"
        ? "Approved"
        : v.approval_status === "rejected"
        ? "Rejected"
        : "Pending",
    approvedBy: v.approved_by_name,
    submittedToClient: v.submitted_to_client,
    signedByClient: v.signed_by_client,
  }
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Page() {
  const [rows, setRows] = useState<VariationRow[]>([])
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [selectedProject, setSelectedProject] = useState("all")
  const [loading, setLoading] = useState(true)

  const role = useRoleStore((state) => state.role)

  // ── Fetch data ──────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [varData, projData] = await Promise.all([
          getVariations(),
          getMyProjects(),
        ])
        setRows(varData.variations.map(apiToRow))
        setProjects(projData.projects)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load variations"
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const projectOptions = useMemo(
    () => projects.map((p) => ({ id: p.id, name: p.projectName })),
    [projects]
  )

  // ── Create variation dialog ─────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false)

  const handleSubmitVariation = useCallback(
    async (form: VariationFormData, _formTotal: number): Promise<boolean> => {
      try {
        const payload = {
          project_id: form.project,
          site_instruction_no: form.siteInstructionNo,
          attention_of: form.attentionOf,
          description_of_works: form.descriptionOfWorks,
          comments: form.comments,
          lines: form.lines.map((l) => ({
            siteInstruction: l.siteInstruction,
            workArea: l.workArea,
            workSection: l.workSection,
            labour: l.labour,
            labourTarget: l.labourTarget,
            material: l.material,
            qty: l.qty,
          })),
        }
        const created = await createVariation(payload)
        setRows((prev) => [apiToRow(created), ...prev])
        toast.success("Variation created successfully.")
        return true
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create variation"
        toast.error(msg)
        return false
      }
    },
    []
  )

  // ── Assign users dialog ─────────────────────────────────────────────────
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignRowId, setAssignRowId] = useState<string | null>(null)
  const [assignInitial, setAssignInitial] = useState<string[]>([])

  const openAssign = useCallback((rowId: string, currentIds: string[]) => {
    setAssignRowId(rowId)
    setAssignInitial(currentIds)
    setAssignOpen(true)
  }, [])

  const confirmAssign = (selectedIds: string[]) => {
    if (!assignRowId) return
    setRows((prev) =>
      prev.map((r) => (r.id === assignRowId ? { ...r, assignedUserIds: selectedIds } : r))
    )
    setAssignOpen(false)
  }

  // ── Approval ────────────────────────────────────────────────────────────
  const [pendingApproval, setPendingApproval] = useState<{
    id: string; voNo: string; action: "approve" | "reject"
  } | null>(null)

  const confirmApproval = useCallback(async () => {
    if (!pendingApproval) return
    try {
      const updated = await approveVariation(pendingApproval.id, pendingApproval.action)
      setRows((prev) => prev.map((r) => (r.id === updated.id ? apiToRow(updated) : r)))
      toast.success(
        pendingApproval.action === "approve"
          ? "Variation approved."
          : "Variation rejected."
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update approval"
      toast.error(msg)
    } finally {
      setPendingApproval(null)
    }
  }, [pendingApproval])

  // ── Variation View / Download / Submit ──────────────────────────────────
  const [variationDialogOpen, setVariationDialogOpen] = useState(false)
  const [selectedVariation, setSelectedVariation] = useState<VariationRow | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const submitVariationToClientHandler = useCallback(
    async (_name: string, _email: string) => {
      if (!selectedVariation) return
      setIsSubmitting(true)
      try {
        const updated = await submitVariationToClient(selectedVariation.id)
        setRows((prev) => prev.map((r) => (r.id === updated.id ? apiToRow(updated) : r)))
        toast.success("Variation submitted to client.")
        setVariationDialogOpen(false)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to submit to client"
        toast.error(msg)
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedVariation]
  )

  // ── Reminder dialog ─────────────────────────────────────────────────────
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
      toast.success("Reminder sent.")
    }, 1000)
  }, [selectedReminder])

  // ── Summary metrics ─────────────────────────────────────────────────────
  const summaryMetrics = useMemo(() => {
    const filtered = selectedProject === "all" ? rows : rows.filter((r) => r.projectId === selectedProject)
    const total = filtered.reduce((s, r) => s + r.totalAmount, 0)
    const approved = filtered.filter((r) => r.approvalStatus === "Approved").length
    const pending = filtered.filter((r) => r.approvalStatus === "Pending").length
    const submitted = filtered.filter((r) => r.submittedToClient).length
    const signed = filtered.filter((r) => r.signedByClient).length
    return [
      { label: "Variations", value: formatGBP(total) },
      { label: "Approved", value: String(approved), valueColor: "green" as const },
      { label: "Awaiting Approval", value: String(pending), valueColor: "red" as const },
      { label: "Submitted to Client", value: String(submitted) },
      { label: "Signed by Client", value: String(signed) },
    ]
  }, [rows, selectedProject])

  // ── Table columns ───────────────────────────────────────────────────────
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
      { headerName: "Site Instruction No.", field: "siteInstructionNo", minWidth: 180 },
      { headerName: "Description of Works", field: "descriptionOfWorks", minWidth: 220 },
      {
        headerName: "Total Amount",
        field: "totalAmount",
        minWidth: 140,
        cellRenderer: (params: { value: number }) => (
          <span className="font-medium text-slate-100">{formatGBP(params.value)}</span>
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
          return <span className="font-medium text-amber-300">{formatGBP(total)}</span>
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
                onClick={() => setPendingApproval({ id: row.id, voNo: row.voNo, action: "approve" })}
              >
                Approve
              </Button>
              <Button
                className="h-7 rounded-none bg-red-600 px-2 text-xs text-white hover:bg-red-500"
                onClick={() => setPendingApproval({ id: row.id, voNo: row.voNo, action: "reject" })}
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
          <span className={params.value ? "text-emerald-400" : "text-slate-500"}>
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
      { headerName: "Comments", field: "comments", minWidth: 180 }
    )

    return base
  }, [openAssign, openReminder, openVariation, role])

  // ── Filtered rows ───────────────────────────────────────────────────────
  const filteredRows = useMemo(
    () => (selectedProject === "all" ? rows : rows.filter((r) => r.projectId === selectedProject)),
    [rows, selectedProject]
  )

  // ── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-400">Loading variations…</span>
      </div>
    )
  }

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
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TableStat summaryRows={summaryMetrics} />

      <AgTable
        rowData={filteredRows}
        columnDefs={columns}
        suppressCellClickAction
        height="auto"
        defaultColDef={{ flex: 1, minWidth: 150 }}
        gridOptions={{ rowHeight: 48 }}
      />

      <CreateVariationDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmitVariation}
        projects={projectOptions}
      />

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
        onSubmitToClient={submitVariationToClientHandler}
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
