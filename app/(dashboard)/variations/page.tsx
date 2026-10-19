"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import type { ColDef } from "ag-grid-community"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Plus, XCircle, Loader2, UserPlus, Paperclip } from "lucide-react"
import { useRoleStore } from "@/lib/role-store"
import { useAuthStore } from "@/lib/auth-store"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  remindClientVariation,
  assignVariationUsers,
  toggleVariationSignature,
  type VariationApi,
} from "@/lib/api/variations"
import { getMyProjects, getApprovalConfigs, type ApprovalConfigurationData } from "@/lib/api/project-admin"
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
    assignedUserIds: v.assigned_user_ids || [],
    approvalStatus:
      v.approval_status === "approved"
        ? "Approved"
        : v.approval_status === "rejected"
        ? "Rejected"
        : "Pending",
    approvedBy: v.approved_by_name,
    submittedToClient: v.submitted_to_client,
    signedByClient: v.signed_by_client,
    clientName: v.client_name || "",
    clientEmail: v.client_email || "",
    attentionOf: v.attention_of || "",
    
    // Signatures
    sigCommercialDepartment: v.commercial_department_approved || false,
    sigCommercialDepartmentDate: v.commercial_department_approved_date || null,
    sigContractsManager: v.contracts_manager_approved || false,
    sigContractsManagerDate: v.contracts_manager_approved_date || null,
    sigProjectDirector: v.project_director_approved || false,
    sigProjectDirectorDate: v.project_director_approved_date || null,
    sigManagingDirector: v.managing_director_approved || false,
    sigManagingDirectorDate: v.managing_director_approved_date || null,
    fullyApproved: v.fully_approved || false,
    evidence_url: (v as any).evidence_url || null,
  }
}

// ── Toggle Cell ────────────────────────────────────────────────────────────

type ApprovalField =
  | "sigCommercialDepartment"
  | "sigContractsManager"
  | "sigProjectDirector"
  | "sigManagingDirector"

type PendingToggle = {
  id: string
  ref: string
  field: ApprovalField
  nextValue: boolean
  label: string
}

function ApprovalToggleCell({
  row,
  field,
  dateField,
  canToggle,
  isDisabled,
  disabledReason,
  onRequest,
}: {
  row: VariationRow
  field: ApprovalField
  dateField: keyof VariationRow
  canToggle: boolean
  isDisabled: boolean
  disabledReason?: string
  onRequest: (field: ApprovalField, nextValue: boolean) => void
}) {
  const checked = row[field] as boolean
  const date = row[dateField] as string

  return (
    <div className="flex flex-col justify-center gap-0.5 py-1">
      <div className="flex items-center gap-2">
        <Switch
          checked={checked}
          disabled={!canToggle || isDisabled}
          title={isDisabled ? disabledReason : undefined}
          onCheckedChange={(next) => onRequest(field, next)}
        />
        <span
          className={
            checked
              ? "text-xs font-medium text-emerald-400"
              : "text-xs font-medium text-slate-400"
          }
        >
          {checked ? "Yes" : "No"}
        </span>
      </div>
      {date && (
        <span className="text-[10px] text-slate-500 leading-none">{date}</span>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Page() {
  const [rows, setRows] = useState<VariationRow[]>([])
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [selectedProject, setSelectedProject] = useState("all")
  const [loading, setLoading] = useState(true)

  const user = useAuthStore((state) => state.user)
  const roleFromStore = useRoleStore((state) => state.role)
  const role = roleFromStore || user?.role || ""
  
  const isContractsManager = role === "contracts_manager"
  const isProjectDirector = role === "project_director"
  const isManagingDirector = role === "managing_director"
  const isCommercial = role === "commercial_department"

  // ── Approval state ───────────────────────────────────────────────────────
  const [config, setConfig] = useState<ApprovalConfigurationData | null>(null)
  const [pendingToggle, setPendingToggle] = useState<PendingToggle | null>(null)
  const [submittingToggle, setSubmittingToggle] = useState(false)

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
  
  useEffect(() => {
    async function loadConfig() {
      if (!selectedProject || selectedProject === "all") {
        setConfig(null)
        return
      }
      try {
        const configs = await getApprovalConfigs(selectedProject)
        const vConfig = configs.find(c => c.action_type === "variations") || null
        setConfig(vConfig)
      } catch (e) {
        console.error(e)
      }
    }
    loadConfig()
  }, [selectedProject])

  const requestSignatureToggle = useCallback(
    (
      row: VariationRow,
      field: ApprovalField,
      nextValue: boolean,
      label: string
    ) => {
      setPendingToggle({
        id: row.id,
        ref: row.voNo,
        field,
        nextValue,
        label,
      })
    },
    []
  )

  const confirmToggle = useCallback(async () => {
    if (!pendingToggle || submittingToggle) return
    setSubmittingToggle(true)
    try {
      await toggleVariationSignature(pendingToggle.id, pendingToggle.nextValue)
      // refresh just the row or all rows
      const { variations } = await getVariations(selectedProject === "all" ? undefined : selectedProject)
      setRows(variations.map(apiToRow))
      
      toast.success(
        pendingToggle.nextValue
          ? `Signed as ${pendingToggle.label}`
          : `Revoked ${pendingToggle.label} signature`
      )
    } catch (e) {
      toast.error("Failed to update approval.")
      console.error(e)
    } finally {
      setSubmittingToggle(false)
      setPendingToggle(null)
    }
  }, [pendingToggle, submittingToggle, selectedProject])

  const isRoleConfigured = useCallback((roleKey: string) => {
    if (!config) return false // fallback
    return config.required_roles.split(',').includes(roleKey)
  }, [config])

  const isRoleRequired = useCallback((roleKey: string, row: VariationRow) => {
    if (!config) return false // fallback to required if no config
    if (!config.required_roles.split(',').includes(roleKey)) return false

    let threshold = config.role_thresholds?.[roleKey]
    if (threshold === undefined) threshold = 0 // default to 0 if no budget set

    if (threshold === 0) return true
    return row.totalAmount > threshold
  }, [config])

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
          evidence: form.evidence,
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
    const target = rows.find((r) => r.id === rowId)
    const isCommercialApproved = target && (target.approvalStatus === "Approved" || Boolean(target.sigCommercialDepartment))
    if (!isCommercialApproved) {
      toast.error("Can only assign app users once approved by the Commercial Manager.")
      return
    }
    setAssignRowId(rowId)
    setAssignInitial(currentIds)
    setAssignOpen(true)
  }, [rows])

  const confirmAssign = useCallback(async (selectedIds: string[]) => {
    if (!assignRowId) return
    try {
      const updated = await assignVariationUsers(assignRowId, selectedIds)
      setRows((prev) =>
        prev.map((r) => (r.id === assignRowId ? apiToRow(updated) : r))
      )
      toast.success("Users assigned successfully.")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to assign users."
      toast.error(msg)
    } finally {
      setAssignOpen(false)
    }
  }, [assignRowId])

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
    async (name: string, email: string) => {
      if (!selectedVariation) return
      setIsSubmitting(true)
      try {
        const updated = await submitVariationToClient(selectedVariation.id, {
          client_name: name,
          client_email: email,
        })
        setRows((prev) => prev.map((r) => (r.id === updated.id ? apiToRow(updated) : r)))
        toast.success("Variation issued to client.")
        setVariationDialogOpen(false)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to issue to client"
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
    if (!isCommercial) {
      toast.error("Only the Commercial Department can send reminders to clients.")
      return
    }
    if (!row.clientEmail) {
      toast.error("No client email has been provided for this variation.")
      return
    }
    setSelectedReminder(row)
    setReminderDialogOpen(true)
  }, [isCommercial])

  const handleSendReminder = useCallback(async (email: string) => {
    if (!selectedReminder) return
    setIsSendingReminder(true)
    try {
      const updated = await remindClientVariation(selectedReminder.id, {
        client_email: email,
      })
      setRows((prev) => prev.map((r) => (r.id === updated.id ? apiToRow(updated) : r)))
      toast.success("Reminder sent to client.")
      setReminderDialogOpen(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reminder"
      toast.error(msg)
    } finally {
      setIsSendingReminder(false)
    }
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
      { headerName: "Project", field: "project" },
      { headerName: "Site Instruction No.", field: "siteInstructionNo", minWidth: 180 },
      {
        headerName: "Description of Works",
        field: "descriptionOfWorks",
        minWidth: 260,
        wrapText: true,
        autoHeight: true,
        cellStyle: { wordBreak: "break-word", lineHeight: "1.4" },
      },
      {
        headerName: "Evidence",
        field: "evidence_url",
        minWidth: 110,
        cellRenderer: (params: { value?: string | null }) => {
          if (!params.value) return <span className="text-slate-500">—</span>
          return (
            <a
              href={params.value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <Paperclip className="size-3" /> View
            </a>
          )
        },
      },
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
    
    // -- Signature Columns --
    base.push(
      {
        headerName: "Commercial Manager",
        colId: "sig_commercial",
        minWidth: 170,
        hide: !isRoleConfigured("commercial_department"),
        cellRenderer: (params: { data?: VariationRow }) => {
          const row = params.data
          if (!row) return null
          if (!isRoleRequired("commercial_department", row)) return <span className="text-[11px] italic text-slate-500">N/A</span>
          return (
            <ApprovalToggleCell
              row={row}
              field="sigCommercialDepartment"
              dateField="sigCommercialDepartmentDate"
              canToggle={isCommercial}
              isDisabled={false}
              onRequest={(field, next) => requestSignatureToggle(row, field, next, "Commercial Manager")}
            />
          )
        },
      },
      {
        headerName: "Contracts Manager",
        colId: "sig_contracts_manager",
        minWidth: 170,
        hide: !isRoleConfigured("contracts_manager"),
        cellRenderer: (params: { data?: VariationRow }) => {
          const row = params.data
          if (!row) return null
          if (!isRoleRequired("contracts_manager", row)) return <span className="text-[11px] italic text-slate-500">N/A</span>
          return (
            <ApprovalToggleCell
              row={row}
              field="sigContractsManager"
              dateField="sigContractsManagerDate"
              canToggle={isContractsManager}
              isDisabled={false}
              onRequest={(field, next) => requestSignatureToggle(row, field, next, "Contracts Manager")}
            />
          )
        },
      },
      {
        headerName: "Project Director",
        colId: "sig_project_director",
        minWidth: 160,
        hide: !isRoleConfigured("project_director"),
        cellRenderer: (params: { data?: VariationRow }) => {
          const row = params.data
          if (!row) return null
          if (!isRoleRequired("project_director", row)) return <span className="text-[11px] italic text-slate-500">N/A</span>
          return (
            <ApprovalToggleCell
              row={row}
              field="sigProjectDirector"
              dateField="sigProjectDirectorDate"
              canToggle={isProjectDirector}
              isDisabled={false}
              onRequest={(field, next) => requestSignatureToggle(row, field, next, "Project Director")}
            />
          )
        },
      },
      {
        headerName: "Managing Director",
        colId: "sig_managing_director",
        minWidth: 170,
        hide: !isRoleConfigured("managing_director"),
        cellRenderer: (params: { data?: VariationRow }) => {
          const row = params.data
          if (!row) return null
          if (!isRoleRequired("managing_director", row)) return <span className="text-[11px] italic text-slate-500">N/A</span>
          return (
            <ApprovalToggleCell
              row={row}
              field="sigManagingDirector"
              dateField="sigManagingDirectorDate"
              canToggle={isManagingDirector}
              isDisabled={false}
              onRequest={(field, next) => requestSignatureToggle(row, field, next, "Managing Director")}
            />
          )
        },
      }
    )

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
          // Only the commercial department is allowed to send reminders to clients
          if (!isCommercial) {
            return <span className="text-slate-500">No</span>
          }
          if (!params.data?.clientEmail) {
            return <span className="text-slate-500" title="No client email provided">No</span>
          }
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
        minWidth: 160,
        cellRenderer: (params: { data?: VariationRow; value?: string[] }) => {
          const row = params.data
          if (!row) return null
          const count = params.value?.length ?? 0
          const isCommercialApproved = row.approvalStatus === "Approved" || Boolean(row.sigCommercialDepartment)

          return (
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-slate-300">
                {count === 0 ? "None" : `${count} user${count > 1 ? "s" : ""}`}
              </span>
              {isCommercialApproved ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
                  onClick={(e) => {
                    e.stopPropagation()
                    openAssign(row.id, row.assignedUserIds || [])
                  }}
                  title="Assign Users"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="h-7 w-7 p-0 text-slate-600 opacity-40 cursor-not-allowed"
                  title="Requires Commercial Manager approval before assigning users"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              )}
            </div>
          )
        }
      },
      { headerName: "Comments", field: "comments", minWidth: 180 }
    )

    return base
  }, [openAssign, openReminder, openVariation, role, isCommercial])

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
        columnDefs={columns.filter(c => !c.hide)}
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
