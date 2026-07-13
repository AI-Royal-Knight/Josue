"use client"

import { useMemo, useState, useCallback, useEffect } from "react"
import type { ColDef } from "ag-grid-community"
import TableStat from "@/components/common/table-stat"
import { AgTable } from "@/components/common/AgTable"
import { Switch } from "@/components/ui/switch"
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
import SelectProject from "@/components/shared/select-project"
import ViewInvoiceDialog, {
  InvoicePreviewData,
} from "@/components/common/view-invoice-dialog"
import { useRoleStore } from "@/lib/role-store"
import { getUserInvoices, approveUserInvoice, commentUserInvoice, UserInvoiceApi } from "@/lib/api/user-invoices"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

type ApprovalField =
  | "supervisorApproved"
  | "contractsManagerApproved"
  | "projectDirectorApproved"
  | "managingDirectorApproved"

/** Which toggle is being confirmed */
type PendingToggle = {
  id: string
  invoiceNumber: string
  field: ApprovalField
  nextValue: boolean
  label: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ApprovalToggleCell({
  row,
  field,
  dateField,
  canToggle,
  isDisabled,
  disabledReason,
  onRequest,
}: {
  row: UserInvoiceApi
  field: ApprovalField
  dateField: keyof UserInvoiceApi
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [rows, setRows] = useState<UserInvoiceApi[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState("")
  const [pending, setPending] = useState<PendingToggle | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoicePreviewData | null>(null)

  const role = useRoleStore((s) => s.role)
  const isSupervisor = role === "supervisor" || role === "managers"
  const isContractsManager = role === "contracts_manager"
  const isProjectDirector = role === "project_director"
  const isManagingDirector = role === "managing_director"
  const isCommercialDepartment = role === "commercial_department"

  // Fetch invoices when project changes
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await getUserInvoices(
          selectedProject && selectedProject !== "none"
            ? { project_id: selectedProject }
            : undefined
        )
        setRows(res.invoices)
      } catch (e) {
        console.error("Failed to load invoices", e)
        toast.error("Failed to load invoices")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedProject])

  const openInvoice = useCallback((row: UserInvoiceApi) => {
    setSelectedInvoice({
      invoiceNumber: row.invoiceNumber,
      date: row.date,
      project: row.project,
      statusLabel: "Approved",
      statusValue: row.fullyApproved ? "Yes" : "No",
      amount: row.total || "£0.00",
      description: row.description || "User invoice work",
    })
    setInvoiceDialogOpen(true)
  }, [])

  const requestSignatureToggle = useCallback(
    (
      row: UserInvoiceApi,
      field: ApprovalField,
      nextValue: boolean,
      label: string
    ) => {
      setPending({
        id: row.id,
        invoiceNumber: row.invoiceNumber || `Row ${row.no}`,
        field,
        nextValue,
        label,
      })
    },
    []
  )

  const confirmToggle = useCallback(async () => {
    if (!pending || submitting) return
    setSubmitting(true)
    try {
      const res = await approveUserInvoice(pending.id, pending.nextValue)
      setRows((prev) =>
        prev.map((r) => (r.id === pending.id ? res.invoice : r))
      )
      toast.success(
        pending.nextValue
          ? `Signed as ${pending.label}`
          : `Revoked ${pending.label} signature`
      )
    } catch (e) {
      toast.error("Failed to update approval. Please try again.")
      console.error(e)
    } finally {
      setSubmitting(false)
      setPending(null)
    }
  }, [pending, submitting])

  const approvedCount = rows.filter((r) => r.fullyApproved).length
  const pendingCount = rows.filter((r) => !r.fullyApproved).length

  const columns = useMemo<ColDef<UserInvoiceApi>[]>(() => {
    const cols: ColDef<UserInvoiceApi>[] = [
      {
        headerName: "Invoice Number",
        field: "invoiceNumber",
        minWidth: 160,
        cellRenderer: (params: { data?: UserInvoiceApi; value: string }) => {
          if (!params.value) return null
          const approved = params.data?.fullyApproved
          return (
            <button
              type="button"
              className={`hover:underline ${
                approved
                  ? "font-medium text-emerald-400"
                  : "font-medium text-red-400"
              }`}
              onClick={(e) => {
                e.stopPropagation()
                if (params.data) openInvoice(params.data)
              }}
            >
              {params.value}
            </button>
          )
        },
      },
      { headerName: "Date", field: "date", minWidth: 120 },
      {
        headerName: "Variation Sheet No.",
        field: "variationSheetNo",
        minWidth: 160,
      },
      { headerName: "Proforma NR", field: "nfiProformaNo", minWidth: 150 },
      { headerName: "Project", field: "project", minWidth: 160 },
      {
        headerName: "Description of Work",
        field: "description",
        minWidth: 220,
      },
      { headerName: "Created By", field: "createdBy", minWidth: 140 },

      // ── Signature 1: Supervisor / Manager ───────────────────────────────
      {
        headerName: "Supervisor / Manager",
        colId: "sig_supervisor",
        minWidth: 180,
        cellRenderer: (params: { data?: UserInvoiceApi }) => {
          const row = params.data
          if (!row) return null
          return (
            <ApprovalToggleCell
              row={row}
              field="supervisorApproved"
              dateField="supervisorApprovedDate"
              canToggle={isSupervisor}
              isDisabled={false}
              onRequest={(field, next) =>
                requestSignatureToggle(row, field, next, "Supervisor / Manager")
              }
            />
          )
        },
      },

      // ── Signature 2: Contracts Manager ──────────────────────────────────
      {
        headerName: "Contracts Manager",
        colId: "sig_contracts_manager",
        minWidth: 180,
        cellRenderer: (params: { data?: UserInvoiceApi }) => {
          const row = params.data
          if (!row) return null
          const prerequisiteMet = row.supervisorApproved
          return (
            <ApprovalToggleCell
              row={row}
              field="contractsManagerApproved"
              dateField="contractsManagerApprovedDate"
              canToggle={isContractsManager}
              isDisabled={!prerequisiteMet}
              disabledReason="Supervisor must approve first"
              onRequest={(field, next) =>
                requestSignatureToggle(row, field, next, "Contracts Manager")
              }
            />
          )
        },
      },

      // ── Signature 3: Project Director ───────────────────────────────────
      {
        headerName: "Project Director",
        colId: "sig_project_director",
        minWidth: 180,
        cellRenderer: (params: { data?: UserInvoiceApi }) => {
          const row = params.data
          if (!row) return null
          const firstTwoSigned =
            row.supervisorApproved && row.contractsManagerApproved
          if (!firstTwoSigned) {
            return (
              <span className="text-[11px] italic text-slate-600">
                Awaiting prior approvals
              </span>
            )
          }
          return (
            <ApprovalToggleCell
              row={row}
              field="projectDirectorApproved"
              dateField="projectDirectorApprovedDate"
              canToggle={isProjectDirector}
              isDisabled={false}
              onRequest={(field, next) =>
                requestSignatureToggle(row, field, next, "Project Director")
              }
            />
          )
        },
      },

      // ── Signature 4: Managing Director ──────────────────────────────────
      {
        headerName: "Managing Director",
        colId: "sig_managing_director",
        minWidth: 180,
        cellRenderer: (params: { data?: UserInvoiceApi }) => {
          const row = params.data
          if (!row) return null
          const allThreeSigned =
            row.supervisorApproved &&
            row.contractsManagerApproved &&
            row.projectDirectorApproved
          if (!allThreeSigned) {
            return (
              <span className="text-[11px] italic text-slate-600">
                Awaiting prior approvals
              </span>
            )
          }
          return (
            <ApprovalToggleCell
              row={row}
              field="managingDirectorApproved"
              dateField="managingDirectorApprovedDate"
              canToggle={isManagingDirector}
              isDisabled={false}
              onRequest={(field, next) =>
                requestSignatureToggle(row, field, next, "Managing Director")
              }
            />
          )
        },
      },

      // ── Rest of columns ──────────────────────────────────────────────────
      {
        headerName: "Money on Hold",
        field: "total",
        minWidth: 160,
        cellStyle: { textAlign: "right" },
      },
      { headerName: "Approved By", field: "approvedBy", minWidth: 140 },
      {
        headerName: "Total",
        field: "total",
        minWidth: 130,
        cellStyle: { textAlign: "right" },
      },
      {
        headerName: "Paid",
        field: "paid",
        colId: "paid",
        minWidth: 90,
        cellRenderer: (params: { data?: UserInvoiceApi }) => {
          const paid = params.data?.paid
          if (!params.data?.invoiceNumber) return null
          return (
            <span
              className={
                paid
                  ? "font-medium text-emerald-400"
                  : "font-medium text-slate-400"
              }
            >
              {paid ? "Yes" : "No"}
            </span>
          )
        },
      },
      { headerName: "Date Paid", field: "datePaid", minWidth: 120 },
      { headerName: "Paid By", field: "paidBy", minWidth: 140 },
      {
        headerName: "Finance Comments",
        field: "financeComments",
        minWidth: 200,
        tooltipField: "financeComments",
      },
      {
        headerName: "Commercial Comments",
        field: "commercialComments",
        minWidth: 200,
        tooltipField: "commercialComments",
        editable: isCommercialDepartment,
        cellEditor: "agLargeTextCellEditor",
        cellEditorPopup: true,
        onCellValueChanged: async (params) => {
          if (!params.data) return
          try {
            const res = await commentUserInvoice(params.data.id, params.newValue)
            setRows((current) => current.map(r => r.id === params.data?.id ? res.invoice : r))
            toast.success("Comment updated")
          } catch (e) {
            toast.error("Failed to update comment")
            params.node?.setDataValue("commercialComments", params.oldValue)
          }
        },
      },
    ]

    return cols
  }, [
    openInvoice,
    requestSignatureToggle,
    isSupervisor,
    isContractsManager,
    isProjectDirector,
    isManagingDirector,
    isCommercialDepartment,
  ])

  // Confirmation dialog copy
  const dialogTitle = pending
    ? pending.nextValue
      ? `Sign as ${pending.label}?`
      : `Revoke ${pending.label} signature?`
    : ""

  const dialogDescription = pending
    ? pending.nextValue
      ? `You are adding your signature as ${pending.label} to invoice ${pending.invoiceNumber}. Today's date will be recorded.`
      : `This will remove your ${pending.label} signature from invoice ${pending.invoiceNumber}.`
    : ""

  return (
    <div className="w-full space-y-6 p-6">
      <h2 className="text-2xl font-semibold">User Invoices</h2>
      <SelectProject value={selectedProject} onChange={setSelectedProject} />

      <TableStat
        summaryRows={[
          {
            label: "Invoices",
            value: String(rows.length),
          },
          {
            label: "Approved Invoices",
            value: String(approvedCount),
            valueColor: "green",
          },
          {
            label: "Awaiting Approval",
            value: String(pendingCount),
            valueColor: pendingCount > 0 ? "red" : undefined,
          },
          { label: "Invoices Paid", value: String(rows.filter((r) => r.paid).length) },
        ]}
      />

      {loading ? (
        <div className="text-slate-400 p-8 text-center">Loading invoices...</div>
      ) : (
        <AgTable
          rowData={rows}
          columnDefs={columns}
          suppressCellClickAction
          height="auto"
          gridOptions={{ rowHeight: 56 }}
        />
      )}

      {/* Confirmation dialog */}
      <AlertDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPending(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle} disabled={submitting}>
              {submitting ? "Saving..." : pending?.nextValue ? "Confirm" : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ViewInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        invoice={selectedInvoice}
      />
    </div>
  )
}
