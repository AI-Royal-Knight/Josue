"use client"

import { useState, useMemo, useCallback } from "react"
import type { ColDef } from "ag-grid-community"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CheckCircle2, Plus, Search, XCircle } from "lucide-react"
import { useRoleStore } from "@/lib/role-store"

type ApprovalStatus = "Pending" | "Approved" | "Rejected"

type VariationLine = {
  no: string
  siteInstruction: string
  workArea: string
  workSection: string
  labour: number
  /** Labour target — shown to assigned users when they view/invoice this variation */
  labourTarget: number
  material: number
  qty: number
}

type VariationRow = {
  id: string
  voNo: string
  date: string
  variationSheetNumber: string
  project: string
  siteInstructionNo: string
  descriptionOfWorks: string
  createdBy: string
  lines: VariationLine[]
  totalAmount: number
  evidence: string
  comments: string
  assignedUserIds: string[]
  approvalStatus: ApprovalStatus
  approvedBy: string
  submittedToClient: boolean
  signedByClient: boolean
}

type VariationFormData = {
  project: string
  siteInstructionNo: string
  attentionOf: string
  descriptionOfWorks: string
  lines: VariationLine[]
  comments: string
}

const ALL_USERS = [
  { id: "sm", name: "Site Manager", initials: "SM", color: "bg-emerald-600 text-white" },
  { id: "jw", name: "John Watson", initials: "JW", color: "bg-indigo-600 text-white" },
  { id: "er", name: "Emily Rose", initials: "ER", color: "bg-rose-600 text-white" },
  { id: "mj", name: "Mark Jones", initials: "MJ", color: "bg-amber-600 text-white" },
  { id: "alison", name: "Alison Tylor", initials: "AT", color: "bg-blue-600 text-white" },
  { id: "alex", name: "Alex Wanchis", initials: "AW", color: "bg-violet-600 text-white" },
  { id: "chanu", name: "Chanu Clap", initials: "CC", color: "bg-teal-600 text-white" },
  { id: "provin", name: "Provin Kumar", initials: "PK", color: "bg-orange-600 text-white" },
]

const PROJECTS = ["Project A", "Project B", "Project C"]

const emptyLine = (): VariationLine => ({
  no: "", siteInstruction: "", workArea: "", workSection: "",
  labour: 0, labourTarget: 0, material: 0, qty: 1,
})

const defaultForm = (): VariationFormData => ({
  project: "", siteInstructionNo: "", attentionOf: "",
  descriptionOfWorks: "", lines: [emptyLine()], comments: "",
})

let _nextId = 5
const initialRows: VariationRow[] = [
  {
    id: "1", voNo: "VO-001", date: "2024-01-12", variationSheetNumber: "A",
    project: "Project A", siteInstructionNo: "SI21654321012",
    descriptionOfWorks: "Additional steelwork to level 3",
    createdBy: "John Watson", lines: [], totalAmount: 4500,
    evidence: "", comments: "Approved by site manager",
    assignedUserIds: ["sm", "jw"], approvalStatus: "Approved",
    approvedBy: "Commercial Manager", submittedToClient: true, signedByClient: true,
  },
  {
    id: "2", voNo: "VO-002", date: "2024-01-12", variationSheetNumber: "B",
    project: "Project B", siteInstructionNo: "SI24654321019",
    descriptionOfWorks: "Revised drainage layout",
    createdBy: "Emily Rose", lines: [], totalAmount: 2800,
    evidence: "", comments: "",
    assignedUserIds: ["er"], approvalStatus: "Pending",
    approvedBy: "", submittedToClient: false, signedByClient: false,
  },
  {
    id: "3", voNo: "VO-003", date: "2024-01-12", variationSheetNumber: "C",
    project: "Project C", siteInstructionNo: "SI24654321070",
    descriptionOfWorks: "Extra cabling runs to plant room",
    createdBy: "Mark Jones", lines: [], totalAmount: 1200,
    evidence: "", comments: "Awaiting client sign-off",
    assignedUserIds: ["mj", "alison"], approvalStatus: "Approved",
    approvedBy: "Commercial Manager", submittedToClient: true, signedByClient: false,
  },
  {
    id: "4", voNo: "VO-004", date: "2024-01-12", variationSheetNumber: "D",
    project: "Project A", siteInstructionNo: "SI24659091030",
    descriptionOfWorks: "Temporary works for access platform",
    createdBy: "Alex Wanchis", lines: [], totalAmount: 3600,
    evidence: "", comments: "",
    assignedUserIds: ["alex"], approvalStatus: "Rejected",
    approvedBy: "Commercial Manager", submittedToClient: false, signedByClient: false,
  },
]

const summaryMetrics = [
  { label: "Variations QTY", value: "4" },
  { label: "Variations Value", value: "£12,100" },
  { label: "Approved", value: "2", valueColor: "green" as const },
  { label: "Awaiting Approval", value: "1", valueColor: "red" as const },
  { label: "Submitted to Client", value: "2" },
  { label: "Signed by Client", value: "1" },
]

function lineTotal(l: VariationLine) {
  return (l.labour + l.material) * l.qty
}

function formatGBP(n: number) {
  return n.toLocaleString("en-GB", { style: "currency", currency: "GBP" })
}

export default function Page() {
  const [selectedProject, setSelectedProject] = useState("all")
  const [rows, setRows] = useState<VariationRow[]>(initialRows)

  const role = useRoleStore((state) => state.role)

  // Create variation dialog
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<VariationFormData>(defaultForm())

  // Assign users dialog
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignRowId, setAssignRowId] = useState<string | null>(null)
  const [assignSelected, setAssignSelected] = useState<string[]>([])
  const [userSearch, setUserSearch] = useState("")

  // Approval confirmation
  const [pendingApproval, setPendingApproval] = useState<{
    id: string; voNo: string; action: "approve" | "reject"
  } | null>(null)

  const formTotal = useMemo(
    () => form.lines.reduce((s, l) => s + lineTotal(l), 0),
    [form.lines]
  )

  const updateLine = (i: number, patch: Partial<VariationLine>) =>
    setForm((f) => ({
      ...f,
      lines: f.lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    }))

  const addLine = () =>
    setForm((f) => ({ ...f, lines: [...f.lines, emptyLine()] }))

  const removeLine = (i: number) =>
    setForm((f) => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }))

  const handleSubmitVariation = () => {
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
    setForm(defaultForm())
  }

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
    setAssignSelected(currentIds)
    setUserSearch("")
    setAssignOpen(true)
  }, [])

  const confirmAssign = () => {
    if (!assignRowId) return
    setRows((prev) =>
      prev.map((r) =>
        r.id === assignRowId ? { ...r, assignedUserIds: assignSelected } : r
      )
    )
    setAssignOpen(false)
  }

  const filteredUsers = ALL_USERS.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase())
  )

  const columns = useMemo<ColDef<VariationRow>[]>(() => {
    const base: ColDef<VariationRow>[] = [
      { headerName: "VO No.", field: "voNo" },
      { headerName: "Date", field: "date", minWidth: 120 },
      { headerName: "Sheet No.", field: "variationSheetNumber" },
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
        cellRenderer: (params: { value: boolean }) => (
          <span
            className={params.value ? "text-emerald-400" : "text-slate-500"}
          >
            {params.value ? "Yes" : "No"}
          </span>
        ),
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
        <Button onClick={() => { setForm(defaultForm()); setFormOpen(true) }}>
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

      {/* Create Variation Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Variation</DialogTitle>
            <DialogDescription>
              Fill in the variation details. Once submitted it will be sent to the Commercial Manager for approval.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Top meta */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Project</label>
                <Select value={form.project} onValueChange={(v) => setForm((f) => ({ ...f, project: v }))}>
                  <SelectTrigger className="border-white/10 bg-slate-900"><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-900">
                    {PROJECTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Site Instruction No.</label>
                <Input
                  placeholder="e.g. SI24654321019"
                  value={form.siteInstructionNo}
                  onChange={(e) => setForm((f) => ({ ...f, siteInstructionNo: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Attention of</label>
                <Input
                  placeholder="Name"
                  value={form.attentionOf}
                  onChange={(e) => setForm((f) => ({ ...f, attentionOf: e.target.value }))}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Reason for Variation / Description of Works</label>
              <textarea
                rows={3}
                value={form.descriptionOfWorks}
                onChange={(e) => setForm((f) => ({ ...f, descriptionOfWorks: e.target.value }))}
                placeholder="Describe the variation works…"
                className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Line Items</label>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="size-3" /> Add Line
                </Button>
              </div>
              <div className="overflow-x-auto rounded border border-white/10">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-slate-400">
                      {["No.", "Site Instruction", "Work Area", "Work Section", "Labour (£)", "Labour Target (£)", "Material (£)", "QTY", "Total", ""].map((h) => (
                        <th key={h} className="border-r border-white/10 px-2 py-2 text-left last:border-r-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {form.lines.map((line, i) => (
                      <tr key={i} className="border-b border-white/10 last:border-b-0">
                        <td className="border-r border-white/10 px-2 py-1 text-slate-400">{i + 1}</td>
                        {(["siteInstruction", "workArea", "workSection"] as const).map((f) => (
                          <td key={f} className="border-r border-white/10 px-1 py-1">
                            <Input
                              value={line[f]}
                              onChange={(e) => updateLine(i, { [f]: e.target.value })}
                              className="h-7 border-white/10 bg-transparent text-xs"
                            />
                          </td>
                        ))}
                        {/* Labour */}
                        <td className="border-r border-white/10 px-1 py-1">
                          <Input
                            type="number" min={0}
                            value={line.labour === 0 ? "" : line.labour}
                            onChange={(e) => updateLine(i, { labour: parseFloat(e.target.value) || 0 })}
                            className="h-7 w-20 border-white/10 bg-transparent text-right text-xs"
                          />
                        </td>
                        {/* Labour Target */}
                        <td className="border-r border-white/10 px-1 py-1">
                          <Input
                            type="number" min={0}
                            value={line.labourTarget === 0 ? "" : line.labourTarget}
                            onChange={(e) => updateLine(i, { labourTarget: parseFloat(e.target.value) || 0 })}
                            className="h-7 w-20 border-amber-500/30 bg-amber-500/5 text-right text-xs text-amber-300 placeholder:text-amber-700"
                            placeholder="0"
                            title="Labour target shown to users when invoicing this variation"
                          />
                        </td>
                        {/* Material */}
                        <td className="border-r border-white/10 px-1 py-1">
                          <Input
                            type="number" min={0}
                            value={line.material === 0 ? "" : line.material}
                            onChange={(e) => updateLine(i, { material: parseFloat(e.target.value) || 0 })}
                            className="h-7 w-20 border-white/10 bg-transparent text-right text-xs"
                          />
                        </td>
                        {/* QTY */}
                        <td className="border-r border-white/10 px-1 py-1">
                          <Input
                            type="number" min={0}
                            value={line.qty === 0 ? "" : line.qty}
                            onChange={(e) => updateLine(i, { qty: parseFloat(e.target.value) || 0 })}
                            className="h-7 w-20 border-white/10 bg-transparent text-right text-xs"
                          />
                        </td>
                        <td className="border-r border-white/10 px-2 py-1 text-right font-medium text-slate-100">
                          {formatGBP(lineTotal(line))}
                        </td>
                        <td className="px-2 py-1">
                          <button onClick={() => removeLine(i)} className="text-slate-500 hover:text-red-400">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-white/20 bg-white/5">
                      <td colSpan={8} className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Total</td>
                      <td className="px-2 py-2 text-right text-sm font-bold text-slate-100">{formatGBP(formTotal)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Qualifications &amp; Comments</label>
              <textarea
                rows={2}
                value={form.comments}
                onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
                placeholder="Any additional notes…"
                className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button
                disabled={!form.project || !form.descriptionOfWorks}
                onClick={handleSubmitVariation}
              >
                Submit for Approval
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Users Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Assign Users</DialogTitle></DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              placeholder="Search users…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="border-white/10 bg-slate-900 pl-9"
            />
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {filteredUsers.map((u) => (
              <label key={u.id} className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-white/5">
                <Checkbox
                  checked={assignSelected.includes(u.id)}
                  onCheckedChange={(checked) =>
                    setAssignSelected((prev) =>
                      checked ? [...prev, u.id] : prev.filter((id) => id !== u.id)
                    )
                  }
                />
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${u.color}`}>
                  {u.initials}
                </div>
                <span className="text-sm text-slate-200">{u.name}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={confirmAssign}>Assign</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval confirmation */}
      <AlertDialog open={!!pendingApproval} onOpenChange={(o) => !o && setPendingApproval(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingApproval?.action === "approve" ? "Approve variation?" : "Reject variation?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingApproval?.action === "approve"
                ? `Approving ${pendingApproval.voNo} will mark it as approved by the Commercial Manager.`
                : `Rejecting ${pendingApproval?.voNo} cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingApproval(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApproval}
              className={pendingApproval?.action === "reject" ? "bg-red-600 hover:bg-red-500" : ""}
            >
              {pendingApproval?.action === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
