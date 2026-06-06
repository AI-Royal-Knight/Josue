"use client"

import { useState } from "react"
import type { ColDef } from "ag-grid-community"
import { BellRing, CheckCircle2, FileText, Plus, RotateCcw } from "lucide-react"
import { AgTable } from "@/components/common/AgTable"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import CreateQuotationForm from "./_components/create-quotation-form"
import { addOrder } from "@/lib/po-store"
import TableStat from "@/components/common/table-stat"
import SelectProject from "@/components/shared/select-project"
import { useRoleStore } from "@/lib/role-store"

type ApprovalStatus = "Approved" | "Rejected" | "Pending"

type QuotationRow = {
  no: number
  quotesRef: string
  project: string
  mainFolder: string
  subFolder: string
  variationRef: string
  supplierName: string
  supplierEmailAddress: string
  dateOfQuoteApproved: string
  quoteTotal: string
  poCreated: boolean
  datePoWasCreated: string
  procurementComments: string
  approveQuotesStatus: ApprovalStatus
  quoteApprovalReasons: string
}

type PendingAction =
  | { type: "approve" | "reject"; row: QuotationRow }
  | { type: "createPO"; row: QuotationRow }

const initialRows: QuotationRow[] = [
  {
    no: 1,
    quotesRef: "QR-2023-0891",
    project: "Downtown Tower A",
    mainFolder: "Structural",
    subFolder: "Concrete",
    variationRef: "VAR-001",
    supplierName: "BuildMat Supplies Ltd",
    supplierEmailAddress: "sales@buildmat.com",
    dateOfQuoteApproved: "2023-10-12",
    quoteTotal: "$45,000.00",
    poCreated: true,
    datePoWasCreated: "2023-10-14",
    procurementComments: "",
    approveQuotesStatus: "Approved",
    quoteApprovalReasons: "Lowest bidder, meets all specs.",
  },
  {
    no: 2,
    quotesRef: "QR-2023-0892",
    project: "Downtown Tower A",
    mainFolder: "Structural",
    subFolder: "Steel",
    variationRef: "-",
    supplierName: "IronWorks Inc.",
    supplierEmailAddress: "quotes@ironworks.net",
    dateOfQuoteApproved: "-",
    quoteTotal: "$125,500.50",
    poCreated: false,
    datePoWasCreated: "-",
    procurementComments: "",
    approveQuotesStatus: "Pending",
    quoteApprovalReasons: "-",
  },
  {
    no: 3,
    quotesRef: "QR-2023-0895",
    project: "Riverside Complex",
    mainFolder: "MEP",
    subFolder: "HVAC",
    variationRef: "VAR-012",
    supplierName: "CoolAir Systems",
    supplierEmailAddress: "bids@coolair.com",
    dateOfQuoteApproved: "2023-10-15",
    quoteTotal: "$89,200.00",
    poCreated: true,
    datePoWasCreated: "2023-10-16",
    procurementComments: "",
    approveQuotesStatus: "Approved",
    quoteApprovalReasons: "Preferred vendor, fast lead time.",
  },
  {
    no: 4,
    quotesRef: "QR-2023-0898",
    project: "Riverside Complex",
    mainFolder: "MEP",
    subFolder: "Electrical",
    variationRef: "-",
    supplierName: "VoltTech Solutions",
    supplierEmailAddress: "contact@volttech.com",
    dateOfQuoteApproved: "-",
    quoteTotal: "$67,400.00",
    poCreated: false,
    datePoWasCreated: "-",
    procurementComments: "",
    approveQuotesStatus: "Pending",
    quoteApprovalReasons: "-",
  },
  {
    no: 5,
    quotesRef: "QR-2023-0901",
    project: "Westside Mall",
    mainFolder: "Finishes",
    subFolder: "Flooring",
    variationRef: "VAR-003",
    supplierName: "Premium Tiles Co.",
    supplierEmailAddress: "orders@premiumtiles.com",
    dateOfQuoteApproved: "-",
    quoteTotal: "$112,000.00",
    poCreated: false,
    datePoWasCreated: "-",
    procurementComments: "",
    approveQuotesStatus: "Rejected",
    quoteApprovalReasons: "Rejected due to budget constraints.",
  },
]

export default function Page() {
  const [rows, setRows] = useState<QuotationRow[]>(initialRows)
  const [newQuoteOpen, setNewQuoteOpen] = useState(false)
  const [pending, setPending] = useState<PendingAction | null>(null)

  const role = useRoleStore((s) => s.role)
  const isProcurement = role === "procurement_department"

  // Apply a confirmed action
  const handleConfirm = () => {
    if (!pending) return
    const today = new Date().toISOString().slice(0, 10)

    if (pending.type === "approve") {
      setRows((prev) =>
        prev.map((r) =>
          r.no === pending.row.no
            ? {
                ...r,
                approveQuotesStatus: "Approved",
                dateOfQuoteApproved: today,
              }
            : r
        )
      )
    } else if (pending.type === "reject") {
      setRows((prev) =>
        prev.map((r) =>
          r.no === pending.row.no
            ? { ...r, approveQuotesStatus: "Rejected" }
            : r
        )
      )
    } else if (pending.type === "createPO") {
      setRows((prev) =>
        prev.map((r) =>
          r.no === pending.row.no
            ? { ...r, poCreated: true, datePoWasCreated: today }
            : r
        )
      )
      // Push into shared PO store so Purchase Order List picks it up
      addOrder({
        no: String(pending.row.no),
        quotationRef: pending.row.quotesRef,
        project: pending.row.project,
        mainFolder: pending.row.mainFolder,
        subFolder: pending.row.subFolder,
        variationRef: pending.row.variationRef,
        supplierName: pending.row.supplierName,
        supplierEmail: pending.row.supplierEmailAddress,
        dateOfQuoteApproved: pending.row.dateOfQuoteApproved,
        quoteTotal: pending.row.quoteTotal,
        datePOCreated: today,
        procurementComments: pending.row.procurementComments,
        approvalQuotation: "Approved",
        approvalRelatedRequests: pending.row.quoteApprovalReasons,
      })
    }

    setPending(null)
  }

  const columns: ColDef<QuotationRow>[] = [
    { headerName: "Quotes Ref", field: "quotesRef", minWidth: 140 },
    { headerName: "Project", field: "project" },
    { headerName: "Main Folder", field: "mainFolder" },
    { headerName: "Sub Folder", field: "subFolder" },
    { headerName: "Variation Ref", field: "variationRef" },
    { headerName: "Supplier Name", field: "supplierName" },
    {
      headerName: "Supplier Email",
      field: "supplierEmailAddress",
      minWidth: 200,
    },
    {
      headerName: "Date Quote Approved",
      field: "dateOfQuoteApproved",
      minWidth: 200,
    },
    {
      headerName: "Quote Total",
      field: "quoteTotal",
      cellStyle: { textAlign: "right" },
      minWidth: 140,
    },
    // ── Approve / Reject ────────────────────────────────────────────────────
    {
      headerName: "Approve Quote",
      field: "approveQuotesStatus",
      minWidth: 190,
      cellRenderer: (params: { data?: QuotationRow }) => {
        const row = params.data
        if (!row) return null
        const status = row.approveQuotesStatus

        if (status === "Approved") {
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">
              <CheckCircle2 className="size-3" /> Approved
            </span>
          )
        }
        if (status === "Rejected") {
          return (
            <span className="inline-flex rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-300">
              Rejected
            </span>
          )
        }
        if (!isProcurement) {
          return <span className="text-amber-400 font-medium text-sm">Pending</span>
        }

        return (
          <div className="flex gap-1">
            <Button
              className="h-7 rounded-none bg-emerald-600 px-2 text-xs text-white hover:bg-emerald-500"
              onClick={() => setPending({ type: "approve", row })}
            >
              Approve
            </Button>
            <Button
              className="h-7 rounded-none bg-red-600 px-2 text-xs text-white hover:bg-red-500"
              onClick={() => setPending({ type: "reject", row })}
            >
              Reject
            </Button>
          </div>
        )
      },
    },
    {
      headerName: "Approval Reasons",
      field: "quoteApprovalReasons",
      minWidth: 220,
    },
    // ── Create PO ───────────────────────────────────────────────────────────
    {
      headerName: "Create PO",
      field: "poCreated",
      minWidth: 160,
      cellRenderer: (params: { data?: QuotationRow }) => {
        const row = params.data
        if (!row) return null

        if (row.poCreated) {
          // Green badge — PO already created
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
              <CheckCircle2 className="size-3" /> PO Created
            </span>
          )
        }

        if (!isProcurement) {
          return (
            <Button
              disabled
              title="Only procurement department can create."
              className="h-7 rounded-none bg-slate-800 px-3 text-xs text-slate-500 cursor-not-allowed"
            >
              <FileText className="size-3.5" />
              Create PO
            </Button>
          )
        }

        const canCreate = row.approveQuotesStatus === "Approved"
        return (
          <Button
            disabled={!canCreate}
            title={
              canCreate
                ? "Create a PO from this quote"
                : "Quote must be approved first"
            }
            className="h-7 rounded-none bg-[#3467df] px-3 text-xs text-white hover:bg-[#2d59c2] disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => canCreate && setPending({ type: "createPO", row })}
          >
            <FileText className="size-3.5" />
            Create PO
          </Button>
        )
      },
    },
    { headerName: "Date PO Created", field: "datePoWasCreated", minWidth: 160 },
    {
      headerName: "Send Reminder",
      sortable: false,
      filter: false,
      cellRenderer: () => (
        <Button
          variant="outline"
          className="h-7 rounded-none border-white/10 bg-transparent px-2 text-xs text-slate-200 hover:bg-white/5"
        >
          <BellRing className="size-3.5" />
          Reminder
        </Button>
      ),
    },
    {
      headerName: "Procurement Comments",
      field: "procurementComments",
      minWidth: 200,
    },
    {
      headerName: "Request Re-quote",
      sortable: false,
      filter: false,
      cellRenderer: () => (
        <Button
          variant="outline"
          className="h-7 rounded-none border-white/10 bg-slate-700 px-2 text-xs text-slate-200 hover:bg-slate-600"
        >
          <RotateCcw className="size-3.5" />
          Re-quote
        </Button>
      ),
    },
  ]

  // Confirmation dialog copy
  const dialogCopy = pending
    ? {
        approve: {
          title: "Approve this quote?",
          description: `Approving "${pending.row.quotesRef}" will mark it as approved and allow a PO to be created.`,
          confirm: "Approve",
          confirmClass: "",
        },
        reject: {
          title: "Reject this quote?",
          description: `Rejecting "${pending.row.quotesRef}" cannot be undone.`,
          confirm: "Reject",
          confirmClass: "bg-red-600 hover:bg-red-500",
        },
        createPO: {
          title: "Create Purchase Order?",
          description: `This will create a PO from quote "${pending.row.quotesRef}" and add it to the Purchase Order List.`,
          confirm: "Create PO",
          confirmClass: "bg-[#3467df] hover:bg-[#2d59c2]",
        },
      }[pending.type]
    : null

  return (
    <div className="w-full min-w-0 space-y-4 px-6 py-4">
      <h2>Quotations</h2>

      <SelectProject />

      <div className="flex items-center justify-between">
        <TableStat
          summaryRows={[
            { label: "Quotes Requested", qty: "128" },
            { label: "Approved Quotes", qty: "87" },
            { label: "Awaiting Quotes", qty: "23" },
          ]}
        />
        <Button onClick={() => setNewQuoteOpen(true)}>
          <Plus className="size-4" />
          Create New Quotation
        </Button>
      </div>

      <AgTable
        rowData={rows}
        columnDefs={columns}
        suppressCellClickAction
        height="auto"
        defaultColDef={{ flex: 1, minWidth: 150 }}
        gridOptions={{ rowHeight: 48 }}
      />

      {/* New quotation form */}
      <Dialog open={newQuoteOpen} onOpenChange={setNewQuoteOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quotation</DialogTitle>
          </DialogHeader>
          <CreateQuotationForm
            onSuccess={(data) => {
              // Add the new quote row to the table
              const payload = data as typeof data & {
                mainFolder?: string
                subFolder?: string
                supplierEmails?: string[]
                variationRef?: string
              }
              setRows((prev) => [
                ...prev,
                {
                  no: prev.length + 1,
                  quotesRef: data.quoteRef,
                  project: data.project || "",
                  mainFolder: payload.mainFolder || "",
                  subFolder: payload.subFolder || "",
                  variationRef: payload.variationRef || "-",
                  supplierName: data.supplierName,
                  supplierEmailAddress: payload.supplierEmails?.join(", ") ?? data.supplierEmail,
                  dateOfQuoteApproved: "-",
                  quoteTotal: `$${Number(data.quoteTotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                  poCreated: false,
                  datePoWasCreated: "-",
                  procurementComments: "",
                  approveQuotesStatus: "Pending",
                  quoteApprovalReasons: "-",
                },
              ])
              setNewQuoteOpen(false)
            }}
            onCancel={() => setNewQuoteOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for approve / reject / create PO */}
      <AlertDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogCopy?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogCopy?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPending(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={dialogCopy?.confirmClass}
            >
              {dialogCopy?.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
