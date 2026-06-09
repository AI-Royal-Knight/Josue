"use client"

import { useMemo, useState, useCallback } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

/** The four sequential approval signatures */
type ApprovalSignatures = {
  supervisorApproved: boolean
  supervisorApprovedDate: string
  contractsManagerApproved: boolean
  contractsManagerApprovedDate: string
  projectDirectorApproved: boolean
  projectDirectorApprovedDate: string
  managingDirectorApproved: boolean
  managingDirectorApprovedDate: string
}

type InvoiceRow = {
  no: string
  invoiceNumber: string
  date: string
  variationSheetNo: string
  nfiProformaNo: string
  project: string
  workArea: string
  workSection: string
  description: string
  createdBy: string
  approvedBy: string
  approved: boolean
  total: string
  datePaid: string
  paidBy: string
  financeComments: string
  commercialComments: string
} & ApprovalSignatures

/** Which toggle is being confirmed */
type PendingToggle = {
  no: string
  invoiceNumber: string
  field: keyof ApprovalSignatures & `${string}Approved`
  nextValue: boolean
  label: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = () => new Date().toLocaleDateString("en-GB")

const emptySignatures: ApprovalSignatures = {
  supervisorApproved: false,
  supervisorApprovedDate: "",
  contractsManagerApproved: false,
  contractsManagerApprovedDate: "",
  projectDirectorApproved: false,
  projectDirectorApprovedDate: "",
  managingDirectorApproved: false,
  managingDirectorApprovedDate: "",
}

// ─── Initial data ─────────────────────────────────────────────────────────────

const initialRows: InvoiceRow[] = [
  {
    no: "1",
    invoiceNumber: "INV-2024-003",
    date: "15/03/2024",
    variationSheetNo: "VS-012",
    nfiProformaNo: "NFI-045",
    project: "Al Barsha Tower",
    workArea: "Zone B",
    workSection: "Structural",
    description: "Concrete pouring for Level 5",
    createdBy: "Ahmed K.",
    approvedBy: "Mohammad R.",
    approved: true,
    total: "£145,000.00",
    datePaid: "22/03/2024",
    paidBy: "Sarah L.",
    financeComments: "Cleared",
    commercialComments: "Approved",
    // Pre-seeded: first two signed
    supervisorApproved: true,
    supervisorApprovedDate: "16/03/2024",
    contractsManagerApproved: true,
    contractsManagerApprovedDate: "17/03/2024",
    projectDirectorApproved: false,
    projectDirectorApprovedDate: "",
    managingDirectorApproved: false,
    managingDirectorApprovedDate: "",
  },
  {
    no: "2",
    invoiceNumber: "INV-2024-004",
    date: "20/03/2024",
    variationSheetNo: "VS-015",
    nfiProformaNo: "NFI-048",
    project: "Dubai Marina Plaza",
    workArea: "Zone C",
    workSection: "",
    description: "",
    createdBy: "",
    approvedBy: "",
    approved: false,
    total: "",
    datePaid: "",
    paidBy: "",
    financeComments: "",
    commercialComments: "",
    ...emptySignatures,
  },
  {
    no: "3",
    invoiceNumber: "INV-2024-005",
    date: "28/03/2024",
    variationSheetNo: "VS-018",
    nfiProformaNo: "NFI-052",
    project: "Dubai Marina Plaza",
    workArea: "Zone A",
    workSection: "MEP",
    description: "HVAC installation Phase 2",
    createdBy: "Omar S.",
    approvedBy: "Fatima H.",
    approved: true,
    total: "£89,500.00",
    datePaid: "05/04/2024",
    paidBy: "Sarah L.",
    financeComments: "Processed",
    commercialComments: "Verified",
    // All three prior signed → MD visible
    supervisorApproved: true,
    supervisorApprovedDate: "29/03/2024",
    contractsManagerApproved: true,
    contractsManagerApprovedDate: "30/03/2024",
    projectDirectorApproved: true,
    projectDirectorApprovedDate: "01/04/2024",
    managingDirectorApproved: false,
    managingDirectorApprovedDate: "",
  },
  {
    no: "4",
    invoiceNumber: "INV-2024-006",
    date: "01/04/2024",
    variationSheetNo: "VS-020",
    nfiProformaNo: "NFI-058",
    project: "Al Barsha Tower",
    workArea: "Zone C",
    workSection: "Electrical",
    description: "Main distribution board installation",
    createdBy: "Khalid M.",
    approvedBy: "",
    approved: false,
    total: "£62,000.00",
    datePaid: "",
    paidBy: "",
    financeComments: "",
    commercialComments: "",
    ...emptySignatures,
  },
  {
    no: "5",
    invoiceNumber: "INV-2024-007",
    date: "05/04/2024",
    variationSheetNo: "VS-022",
    nfiProformaNo: "NFI-061",
    project: "Dubai Marina Plaza",
    workArea: "Zone B",
    workSection: "Civil",
    description: "Foundation works Block D",
    createdBy: "Yusuf A.",
    approvedBy: "",
    approved: false,
    total: "£110,000.00",
    datePaid: "",
    paidBy: "",
    financeComments: "",
    commercialComments: "",
    ...emptySignatures,
  },
]

// ─── Approval toggle cell ─────────────────────────────────────────────────────

function ApprovalToggleCell({
  row,
  field,
  dateField,
  canToggle,
  isDisabled,
  disabledReason,
  onRequest,
}: {
  row: InvoiceRow
  field: keyof ApprovalSignatures & `${string}Approved`
  dateField: keyof ApprovalSignatures & `${string}ApprovedDate`
  canToggle: boolean
  isDisabled: boolean
  disabledReason?: string
  onRequest: (
    field: keyof ApprovalSignatures & `${string}Approved`,
    nextValue: boolean
  ) => void
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
  const [rows, setRows] = useState<InvoiceRow[]>(initialRows)
  const [pending, setPending] = useState<PendingToggle | null>(null)

  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoicePreviewData | null>(null)
  const [moneyOnHoldRow, setMoneyOnHoldRow] = useState<InvoiceRow | null>(null)
  const [assignUser, setAssignUser] = useState("")
  const [assignAmount, setAssignAmount] = useState("")

  // Sample users for assignment
  const userOptions = [
    { value: "alison", label: "Alison Taylor" },
    { value: "alex", label: "Alex Wanchis" },
    { value: "chanu", label: "Chanu Clap" },
    { value: "chailau", label: "Chailau" },
    { value: "provin", label: "Provin Kumar" },
    { value: "yoshi", label: "Yoshi Kub" },
  ]

  const handleAssignMoneyOnHold = useCallback(() => {
    if (!moneyOnHoldRow || !assignUser || !assignAmount) return
    // In a real app, this would make an API call
    setMoneyOnHoldRow(null)
    setAssignUser("")
    setAssignAmount("")
  }, [moneyOnHoldRow, assignUser, assignAmount])

  const openMoneyOnHold = useCallback((row: InvoiceRow) => {
    setMoneyOnHoldRow(row)
    setAssignUser("")
    setAssignAmount("")
  }, [])

  const role = useRoleStore((s) => s.role)
  const isSupervisor = role === "supervisor" || role === "managers"
  const isContractsManager = role === "contracts_manager"
  const isProjectDirector = role === "project_director"
  const isManagingDirector = role === "managing_director"

  const openInvoice = useCallback((row: InvoiceRow) => {
    setSelectedInvoice({
      invoiceNumber: row.invoiceNumber,
      date: row.date,
      project: row.project,
      statusLabel: "Approved",
      statusValue: row.approved ? "Yes" : "No",
      amount: row.total || "£0.00",
      description: row.description || "User invoice work",
    })
    setInvoiceDialogOpen(true)
  }, [])

  // Stage a signature toggle — opens confirmation dialog
  const requestSignatureToggle = useCallback(
    (
      row: InvoiceRow,
      field: keyof ApprovalSignatures & `${string}Approved`,
      nextValue: boolean,
      label: string
    ) => {
      setPending({
        no: row.no,
        invoiceNumber: row.invoiceNumber || `Row ${row.no}`,
        field,
        nextValue,
        label,
      })
    },
    []
  )

  // Stage the main approved toggle
  const requestToggle = useCallback(
    (no: string, invoiceNumber: string, nextValue: boolean) => {
      setPending({
        no,
        invoiceNumber,
        field: "supervisorApproved", // not used for main toggle; handled separately
        nextValue,
        label: "Finance",
      })
    },
    []
  )

  // Confirmed — commit the toggle
  const confirmToggle = useCallback(() => {
    if (!pending) return
    const todayStr = today()

    setRows((prev) =>
      prev.map((r) => {
        if (r.no !== pending.no) return r

        // If it's the main "Approved/Paid" toggle (label === "Finance")
        if (pending.label === "Finance") {
          return {
            ...r,
            approved: pending.nextValue,
            approvedBy: pending.nextValue ? "Finance Department" : "",
            datePaid: pending.nextValue ? todayStr : "",
            paidBy: pending.nextValue ? "Finance Department" : "",
          }
        }

        // It's one of the 4 signature toggles
        const dateField = (pending.field.replace(
          "Approved",
          "ApprovedDate"
        ) as keyof ApprovalSignatures) as keyof ApprovalSignatures &
          `${string}ApprovedDate`

        return {
          ...r,
          [pending.field]: pending.nextValue,
          [dateField]: pending.nextValue ? todayStr : "",
        }
      })
    )

    setPending(null)
  }, [pending])

  const approvedCount = rows.filter((r) => r.approved && r.invoiceNumber).length
  const pendingCount = rows.filter(
    (r) => !r.approved && r.invoiceNumber
  ).length

  const columns = useMemo<ColDef<InvoiceRow>[]>(() => {
    const cols: ColDef<InvoiceRow>[] = [
      {
        headerName: "Invoice Number",
        field: "invoiceNumber",
        minWidth: 160,
        cellRenderer: (params: { data?: InvoiceRow; value: string }) => {
          if (!params.value) return null
          const approved = params.data?.approved
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

      // ── Main Approved toggle (Finance) ──────────────────────────────────
      {
        headerName: "Approved",
        field: "approved",
        minWidth: 140,
        cellRenderer: (params: { data?: InvoiceRow }) => {
          const row = params.data
          if (!row) return null
          return (
            <div className="flex items-center gap-2 py-2">
              <Switch
                checked={row.approved}
                onCheckedChange={(checked) =>
                  requestToggle(
                    row.no,
                    row.invoiceNumber || `Row ${row.no}`,
                    checked
                  )
                }
              />
              <span
                className={
                  row.approved
                    ? "text-xs font-medium text-emerald-400"
                    : "text-xs font-medium text-slate-400"
                }
              >
                {row.approved ? "Yes" : "No"}
              </span>
            </div>
          )
        },
      },

      // ── Signature 1: Supervisor / Manager ───────────────────────────────
      {
        headerName: "Supervisor / Manager",
        colId: "sig_supervisor",
        minWidth: 180,
        cellRenderer: (params: { data?: InvoiceRow }) => {
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
        cellRenderer: (params: { data?: InvoiceRow }) => {
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

      // ── Signature 3: Project Director (visible once first 2 signed) ─────
      {
        headerName: "Project Director",
        colId: "sig_project_director",
        minWidth: 180,
        cellRenderer: (params: { data?: InvoiceRow }) => {
          const row = params.data
          if (!row) return null
          // Only shows content once first 2 signatures exist
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

      // ── Signature 4: Managing Director (visible once first 3 signed) ────
      {
        headerName: "Managing Director",
        colId: "sig_managing_director",
        minWidth: 180,
        cellRenderer: (params: { data?: InvoiceRow }) => {
          const row = params.data
          if (!row) return null
          // Only shows content once all 3 prior signatures exist
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

      // ── Money on Hold (clickable to assign to another user) ──────────────
      {
        headerName: "Money on Hold",
        field: "total",
        colId: "money_on_hold",
        minWidth: 160,
        cellRenderer: (params: { data?: InvoiceRow; value: string }) => {
          if (!params.value) return null
          const isNegative =
            params.value.startsWith("-") || params.value === "£0.00"
          return (
            <button
              type="button"
              className={`w-full cursor-pointer text-right transition-colors hover:text-amber-400 ${
                isNegative ? "text-slate-400" : "font-medium text-red-400"
              }`}
              title="Click to assign money on hold to another user"
              onClick={(e) => {
                e.stopPropagation()
                if (params.data) openMoneyOnHold(params.data)
              }}
            >
              {params.value}
            </button>
          )
        },
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
        field: "approved",
        colId: "paid",
        minWidth: 90,
        cellRenderer: (params: { data?: InvoiceRow }) => {
          const approved = params.data?.approved
          if (!params.data?.invoiceNumber) return null
          return (
            <span
              className={
                approved
                  ? "font-medium text-emerald-400"
                  : "font-medium text-slate-400"
              }
            >
              {approved ? "Yes" : "No"}
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
      },
      {
        headerName: "Commercial Comments",
        field: "commercialComments",
        minWidth: 200,
      },
    ]

    return cols
  }, [
    openInvoice,
    requestToggle,
    requestSignatureToggle,
    isSupervisor,
    isContractsManager,
    isProjectDirector,
    isManagingDirector,
  ])

  // Confirmation dialog copy
  const isMainToggle = pending?.label === "Finance"
  const dialogTitle = pending
    ? isMainToggle
      ? pending.nextValue
        ? "Approve invoice?"
        : "Revoke approval?"
      : pending.nextValue
        ? `Sign as ${pending.label}?`
        : `Revoke ${pending.label} signature?`
    : ""

  const dialogDescription = pending
    ? isMainToggle
      ? pending.nextValue
        ? `Approving ${pending.invoiceNumber} will mark it as paid. Are you sure?`
        : `Revoking approval for ${pending.invoiceNumber} will mark it as unpaid.`
      : pending.nextValue
        ? `You are adding your signature as ${pending.label} to invoice ${pending.invoiceNumber}. Today's date will be recorded.`
        : `This will remove your ${pending.label} signature from invoice ${pending.invoiceNumber}.`
    : ""

  return (
    <div className="w-full space-y-6 p-6">
      <h2 className="text-2xl font-semibold">User Invoices</h2>
      <SelectProject />

      <TableStat
        summaryRows={[
          {
            label: "Invoices",
            value: String(rows.filter((r) => r.invoiceNumber).length),
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
          { label: "Invoices Paid", value: String(approvedCount) },
          {
            label: "Money on hold",
            value: "£110,000.00",
            valueColor: pendingCount > 0 ? "red" : undefined,
          },
        ]}
      />

      <AgTable
        rowData={rows}
        columnDefs={columns}
        suppressCellClickAction
        height="auto"
        gridOptions={{ rowHeight: 56 }}
      />

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
            <AlertDialogAction onClick={confirmToggle}>
              {pending?.nextValue ? "Confirm" : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Money on Hold Assignment Dialog ── */}
      <Dialog
        open={!!moneyOnHoldRow}
        onOpenChange={(open) => !open && setMoneyOnHoldRow(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Assign Money on Hold</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Current invoice info */}
            {moneyOnHoldRow && (
              <div className="rounded border border-white/10 bg-slate-900 p-3 text-xs">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-slate-400">Invoice</span>
                  <span className="font-medium text-slate-200">
                    {moneyOnHoldRow.invoiceNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Amount on Hold</span>
                  <span className="font-semibold text-red-400">
                    {moneyOnHoldRow.total}
                  </span>
                </div>
              </div>
            )}

            {/* Amount to assign */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Amount to Assign
              </label>
              <Input
                type="text"
                placeholder="e.g. £10,000.00"
                value={assignAmount}
                onChange={(e) => setAssignAmount(e.target.value)}
                className="border-white/10"
              />
              <p className="text-[10px] text-slate-500">
                Enter a variable amount (not necessarily the full amount on hold)
              </p>
            </div>

            {/* Select user */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Assign to User
              </label>
              <Select
                value={assignUser}
                onValueChange={setAssignUser}
              >
                <SelectTrigger className="w-full border-white/10">
                  <SelectValue placeholder="Select a user…" />
                </SelectTrigger>
                <SelectContent>
                  {userOptions.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMoneyOnHoldRow(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignMoneyOnHold}
              disabled={!assignUser || !assignAmount}
            >
              Assign Amount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ViewInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        invoice={selectedInvoice}
      />
    </div>
  )
}
