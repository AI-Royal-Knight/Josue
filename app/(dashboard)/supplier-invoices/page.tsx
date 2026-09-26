"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react"

import { AgTable } from "@/components/common/AgTable"
import type { ColDef } from "ag-grid-community"
import TableStat from "@/components/common/table-stat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getProcurementSupplierInvoices,
  updateProcurementSupplierInvoice,
  type ProcurementSupplierInvoice,
} from "@/lib/api/suppliers"
import { getMediaUrl } from "@/lib/api/client"

type InvoiceRow = {
  id: string
  no: string
  invoiceNumber: string
  date: string
  supplierName: string
  supplierEmail: string
  amount: string
  poReference: string
  callOffReference: string
  description: string
  status: string
  procurementComments: string
  fileUrl: string | null
  submittedAt: string
}

export default function SupplierInvoicesPage() {
  const [invoices, setInvoices] = useState<ProcurementSupplierInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Edit / Process Dialog State
  const [selectedInvoice, setSelectedInvoice] = useState<ProcurementSupplierInvoice | null>(null)
  const [editStatus, setEditStatus] = useState<string>("")
  const [editComments, setEditComments] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProcurementSupplierInvoices()
      setInvoices(data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load supplier invoices")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenProcessDialog = (inv: ProcurementSupplierInvoice) => {
    setSelectedInvoice(inv)
    setEditStatus(inv.status)
    setEditComments(inv.procurement_comments || "")
  }

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return
    setIsUpdating(true)
    try {
      await updateProcurementSupplierInvoice(selectedInvoice.id, {
        status: editStatus,
        procurement_comments: editComments,
      })
      toast.success("Invoice status updated successfully")
      setSelectedInvoice(null)
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to update invoice")
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesStatus =
        statusFilter === "all" || inv.status.toLowerCase() === statusFilter.toLowerCase()
      const matchesSearch =
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.supplier_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.description && inv.description.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesStatus && matchesSearch
    })
  }, [invoices, statusFilter, searchQuery])

  const rows: InvoiceRow[] = useMemo(() => {
    return filteredInvoices.map((inv, idx) => ({
      id: inv.id,
      no: String(idx + 1).padStart(2, "0"),
      invoiceNumber: inv.invoice_number,
      date: inv.invoice_date,
      supplierName: inv.supplier_name,
      supplierEmail: inv.supplier_email,
      amount: `£${parseFloat(inv.amount || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      poReference: inv.po_reference || "—",
      callOffReference: inv.call_off_reference || "—",
      description: inv.description || "—",
      status: inv.status,
      procurementComments: inv.procurement_comments || "—",
      fileUrl: inv.file_url,
      submittedAt: new Date(inv.created_at).toLocaleDateString(),
    }))
  }, [filteredInvoices])

  const stats = useMemo(() => {
    const totalCount = invoices.length
    const totalValue = invoices.reduce(
      (sum, i) => sum + (parseFloat(i.amount) || 0),
      0
    )
    const submitted = invoices.filter((i) => i.status === "submitted").length
    const processing = invoices.filter((i) => i.status === "processing").length
    const approved = invoices.filter((i) => i.status === "approved" || i.status === "paid").length

    return {
      totalCount,
      totalValue,
      submitted,
      processing,
      approved,
    }
  }, [invoices])

  const columnDefs = useMemo<ColDef<InvoiceRow>[]>(
    () => [
      { headerName: "No", field: "no", maxWidth: 70, filter: false },
      {
        headerName: "Invoice Number",
        field: "invoiceNumber",
        minWidth: 150,
        cellRenderer: (params: any) => {
          const row = params.data as InvoiceRow
          const rawInv = invoices.find((i) => i.id === row?.id)
          return (
            <button
              type="button"
              onClick={() => rawInv && handleOpenProcessDialog(rawInv)}
              className="font-mono text-xs font-semibold text-blue-600 hover:underline"
            >
              {params.value}
            </button>
          )
        },
      },
      { headerName: "Invoice Date", field: "date", minWidth: 110 },
      { headerName: "Supplier Name", field: "supplierName", minWidth: 160 },
      { headerName: "Supplier Email", field: "supplierEmail", minWidth: 180 },
      { headerName: "Amount", field: "amount", minWidth: 120 },
      { headerName: "PO Reference", field: "poReference", minWidth: 140 },
      { headerName: "Call-Off Ref", field: "callOffReference", minWidth: 130 },
      {
        headerName: "Status",
        field: "status",
        minWidth: 130,
        cellRenderer: (params: any) => {
          const val = (params.value || "").toLowerCase()
          const colorClass =
            val === "approved" || val === "paid"
              ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
              : val === "processing"
              ? "bg-amber-50 text-amber-700 ring-amber-600/20"
              : val === "rejected"
              ? "bg-rose-50 text-rose-700 ring-rose-600/20"
              : "bg-blue-50 text-blue-700 ring-blue-600/20"

          return (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ${colorClass}`}
            >
              {val}
            </span>
          )
        },
      },
      {
        headerName: "Attachment",
        field: "fileUrl",
        minWidth: 110,
        cellRenderer: (params: any) => {
          if (!params.value) return <span className="text-slate-400">—</span>
          return (
            <a
              href={getMediaUrl(params.value) as string}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <Download className="h-3.5 w-3.5" />
              <span>View File</span>
            </a>
          )
        },
      },
      { headerName: "Procurement Notes", field: "procurementComments", minWidth: 180 },
      {
        headerName: "Action",
        field: "id",
        maxWidth: 120,
        cellRenderer: (params: any) => {
          const rawInv = invoices.find((i) => i.id === params.value)
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => rawInv && handleOpenProcessDialog(rawInv)}
              className="h-7 text-xs"
            >
              Review
            </Button>
          )
        },
      },
    ],
    [invoices]
  )

  return (
    <div className="w-full min-w-0 space-y-6 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Supplier Invoices</h1>
          <p className="mt-1 text-xs text-slate-500">
            Review and process invoices submitted directly by suppliers.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <TableStat
        summaryRows={[
          { label: "Total Invoices", value: String(stats.totalCount) },
          { label: "Submitted (New)", value: String(stats.submitted) },
          { label: "In Processing", value: String(stats.processing) },
          { label: "Approved / Paid", value: String(stats.approved) },
          {
            label: "Total Value",
            value: `£${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          },
        ]}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {["all", "submitted", "processing", "approved", "rejected", "paid"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search invoice or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <AgTable
        columnDefs={columnDefs}
        rowData={rows}
        defaultColDef={{
          flex: 1,
          minWidth: 120,
          resizable: true,
        }}
      />

      {/* Review / Process Invoice Dialog */}
      <Dialog open={Boolean(selectedInvoice)} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="max-w-md bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Process Supplier Invoice</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update submission status and procurement comments for this invoice.
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Number:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedInvoice.invoice_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Supplier:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedInvoice.supplier_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-700">{selectedInvoice.supplier_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Amount:</span>
                  <span className="font-bold text-emerald-600">
                    £{parseFloat(selectedInvoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="text-slate-700">{selectedInvoice.invoice_date}</span>
                </div>

                {/* PO / Call-Off linkage */}
                {(selectedInvoice.po_reference || selectedInvoice.call_off_reference) && (
                  <div className="pt-1.5 border-t border-slate-200 space-y-1">
                    {selectedInvoice.po_reference && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">PO Reference:</span>
                        <span className="font-mono font-semibold text-blue-700">{selectedInvoice.po_reference}</span>
                      </div>
                    )}
                    {selectedInvoice.call_off_reference && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Call-Off Ref:</span>
                        <span className="font-mono font-semibold text-purple-700">{selectedInvoice.call_off_reference}</span>
                      </div>
                    )}
                    {selectedInvoice.call_off_amount && (
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-slate-500">Call-Off Value:</span>
                        <span className="font-bold text-slate-800">
                          £{parseFloat(selectedInvoice.call_off_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    {/* Variance indicator */}
                    {selectedInvoice.call_off_amount && (() => {
                      const invoiceAmt = parseFloat(selectedInvoice.amount)
                      const callOffAmt = parseFloat(selectedInvoice.call_off_amount)
                      const diff = invoiceAmt - callOffAmt
                      const isMatch = Math.abs(diff) < 0.01
                      return (
                        <div className={`flex justify-between items-center rounded px-2 py-1 text-[11px] font-semibold ${
                          isMatch ? "bg-emerald-50 text-emerald-700" : diff > 0 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          <span>Match check:</span>
                          <span>
                            {isMatch ? "✓ Invoice matches call-off" : diff > 0
                              ? `⚠ Over by £${Math.abs(diff).toFixed(2)}`
                              : `⚠ Under by £${Math.abs(diff).toFixed(2)}`
                            }
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {selectedInvoice.description && (
                  <div className="pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Description: </span>
                    <span className="text-slate-700">{selectedInvoice.description}</span>
                  </div>
                )}
                {selectedInvoice.file_url && (
                  <div className="pt-1 border-t border-slate-200">
                    <a
                      href={selectedInvoice.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                    >
                      <Download className="h-3.5 w-3.5" />
                      View Uploaded Document
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Invoice Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Procurement Comments / Internal Notes</Label>
                <Textarea
                  placeholder="Add notes for this invoice..."
                  value={editComments}
                  onChange={(e) => setEditComments(e.target.value)}
                  rows={3}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedInvoice(null)}
                  disabled={isUpdating}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateInvoice}
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
