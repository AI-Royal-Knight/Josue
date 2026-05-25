"use client"

import { useState, useMemo } from "react"
import type { ColDef } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Send, PackageCheck, Download, History } from "lucide-react"
import SelectProject from "@/components/shared/select-project"

type CallOffHistoryEntry = {
  callOffRef: string
  callOffDate: string
  callOffQty: number
  callOffPrice: string
  callOffBy: string
  approveBy: string
  expectedDeliveryDate: string
}

type CallOffRow = {
  poRef: string
  callOffRef: string
  project: string
  mainFolder: string
  subFolder: string
  variationRef: string
  supplierName: string
  supplierEmail: string
  no: string
  productDescription: string
  totalQty: number
  unit: string
  unitPrice: string
  unitPriceNum: number
  qtyRemaining: number
  callOffQty: number
  callOffPrice: string
  callOffDate: string
  expectedDeliveryDate: string
  callOffBy: string
  approveBy: string
  /** Full history of all call-offs made against this product line */
  history: CallOffHistoryEntry[]
}

type CallOffOrderLine = {
  callOffRef: string
  productDescription: string
  unit: string
  unitPrice: string
  unitPriceNum: number
  qtyRemaining: number
  orderQty: number
}

type PODialogState = {
  poRef: string
  supplierName: string
  supplierEmail: string
  lines: CallOffOrderLine[]
  focusRef?: string
}

type HistoryDialogState = {
  poRef: string
  callOffRef: string
  productDescription: string
  totalQty: number
  unit: string
  unitPrice: string
  history: CallOffHistoryEntry[]
}

function formatGBP(n: number) {
  return n.toLocaleString("en-GB", { style: "currency", currency: "GBP" })
}

function downloadCSV(
  filename: string,
  rows: CallOffHistoryEntry[],
  meta: HistoryDialogState
) {
  const escape = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`
  const headers = [
    "Call Off Ref",
    "Call Off Date",
    "QTY Called Off",
    "Call Off Price",
    "Called Off By",
    "Approved By",
    "Expected Delivery",
  ]
  const body = rows.map((r) =>
    [
      escape(r.callOffRef),
      escape(r.callOffDate),
      escape(r.callOffQty),
      escape(r.callOffPrice),
      escape(r.callOffBy),
      escape(r.approveBy),
      escape(r.expectedDeliveryDate),
    ].join(",")
  )

  const metaLines = [
    `"PO Ref","${meta.poRef}"`,
    `"Call Off Ref","${meta.callOffRef}"`,
    `"Product","${meta.productDescription}"`,
    `"Total QTY","${meta.totalQty} ${meta.unit}"`,
    `"Unit Price","${meta.unitPrice}"`,
    "",
  ]

  const csv = [...metaLines, headers.map(escape).join(","), ...body].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const initialData: CallOffRow[] = [
  {
    poRef: "PO-2023-001",
    callOffRef: "CO-001-A",
    project: "Project Alpha",
    mainFolder: "Structural",
    subFolder: "Steelwork",
    variationRef: "VAR-00",
    supplierName: "Acme Steel Co.",
    supplierEmail: "sales@acmesteel.com",
    no: "1",
    productDescription: "Universal Beam 203x133x25",
    totalQty: 100,
    unit: "EA",
    unitPrice: "£150.00",
    unitPriceNum: 150,
    qtyRemaining: 80,
    callOffQty: 20,
    callOffPrice: "£3,000.00",
    callOffDate: "2023-10-15",
    expectedDeliveryDate: "2023-11-15",
    callOffBy: "John Smith",
    approveBy: "Manager",
    history: [
      {
        callOffRef: "CO-001-A/1",
        callOffDate: "2023-09-01",
        callOffQty: 10,
        callOffPrice: "£1,500.00",
        callOffBy: "John Smith",
        approveBy: "Manager",
        expectedDeliveryDate: "2023-09-20",
      },
      {
        callOffRef: "CO-001-A/2",
        callOffDate: "2023-10-15",
        callOffQty: 10,
        callOffPrice: "£1,500.00",
        callOffBy: "John Smith",
        approveBy: "Manager",
        expectedDeliveryDate: "2023-11-15",
      },
    ],
  },
  {
    poRef: "PO-2023-001",
    callOffRef: "CO-001-B",
    project: "Project Alpha",
    mainFolder: "Structural",
    subFolder: "Steelwork",
    variationRef: "VAR-00",
    supplierName: "Acme Steel Co.",
    supplierEmail: "sales@acmesteel.com",
    no: "2",
    productDescription: "Universal Column 203x203x46",
    totalQty: 50,
    unit: "EA",
    unitPrice: "£225.00",
    unitPriceNum: 225,
    qtyRemaining: 40,
    callOffQty: 10,
    callOffPrice: "£2,250.00",
    callOffDate: "2023-10-18",
    expectedDeliveryDate: "2023-11-20",
    callOffBy: "John Smith",
    approveBy: "Supervisor",
    history: [
      {
        callOffRef: "CO-001-B/1",
        callOffDate: "2023-10-18",
        callOffQty: 10,
        callOffPrice: "£2,250.00",
        callOffBy: "John Smith",
        approveBy: "Supervisor",
        expectedDeliveryDate: "2023-11-20",
      },
    ],
  },
  {
    poRef: "PO-2023-045",
    callOffRef: "CO-045-A",
    project: "Project Alpha",
    mainFolder: "Electrical",
    subFolder: "Cabling",
    variationRef: "VAR-01",
    supplierName: "VoltTech Supplies",
    supplierEmail: "orders@volttech.co.uk",
    no: "3",
    productDescription: "Armoured Cable 3 Core 2.5mm",
    totalQty: 1000,
    unit: "M",
    unitPrice: "£2.50",
    unitPriceNum: 2.5,
    qtyRemaining: 500,
    callOffQty: 500,
    callOffPrice: "£1,250.00",
    callOffDate: "2023-10-12",
    expectedDeliveryDate: "2023-10-25",
    callOffBy: "James Wilson",
    approveBy: "Lead Electrician",
    history: [
      {
        callOffRef: "CO-045-A/1",
        callOffDate: "2023-08-10",
        callOffQty: 200,
        callOffPrice: "£500.00",
        callOffBy: "James Wilson",
        approveBy: "Lead Electrician",
        expectedDeliveryDate: "2023-08-25",
      },
      {
        callOffRef: "CO-045-A/2",
        callOffDate: "2023-09-15",
        callOffQty: 150,
        callOffPrice: "£375.00",
        callOffBy: "James Wilson",
        approveBy: "Lead Electrician",
        expectedDeliveryDate: "2023-09-30",
      },
      {
        callOffRef: "CO-045-A/3",
        callOffDate: "2023-10-12",
        callOffQty: 150,
        callOffPrice: "£375.00",
        callOffBy: "James Wilson",
        approveBy: "Lead Electrician",
        expectedDeliveryDate: "2023-10-25",
      },
    ],
  },
  {
    poRef: "PO-2023-088",
    callOffRef: "CO-088-A",
    project: "Project Alpha",
    mainFolder: "Civils",
    subFolder: "Concrete",
    variationRef: "VAR-00",
    supplierName: "BuildMat Direct",
    supplierEmail: "dispatch@buildmat.com",
    no: "4",
    productDescription: "Ready Mix Concrete C35",
    totalQty: 200,
    unit: "M3",
    unitPrice: "£110.00",
    unitPriceNum: 110,
    qtyRemaining: 150,
    callOffQty: 50,
    callOffPrice: "£5,500.00",
    callOffDate: "2023-10-11",
    expectedDeliveryDate: "2023-10-12",
    callOffBy: "Site Manager",
    approveBy: "Safety Officer",
    history: [
      {
        callOffRef: "CO-088-A/1",
        callOffDate: "2023-10-11",
        callOffQty: 50,
        callOffPrice: "£5,500.00",
        callOffBy: "Site Manager",
        approveBy: "Safety Officer",
        expectedDeliveryDate: "2023-10-12",
      },
    ],
  },
  {
    poRef: "PO-2023-088",
    callOffRef: "CO-088-B",
    project: "Project Alpha",
    mainFolder: "Civils",
    subFolder: "Rebar",
    variationRef: "VAR-02",
    supplierName: "BuildMat Direct",
    supplierEmail: "dispatch@buildmat.com",
    no: "5",
    productDescription: "High Tensile Rebar 16mm",
    totalQty: 5000,
    unit: "KG",
    unitPrice: "£0.85",
    unitPriceNum: 0.85,
    qtyRemaining: 3000,
    callOffQty: 2000,
    callOffPrice: "£1,700.00",
    callOffDate: "2023-10-09",
    expectedDeliveryDate: "2023-10-11",
    callOffBy: "Concrete Lead",
    approveBy: "Area Manager",
    history: [
      {
        callOffRef: "CO-088-B/1",
        callOffDate: "2023-09-01",
        callOffQty: 1000,
        callOffPrice: "£850.00",
        callOffBy: "Concrete Lead",
        approveBy: "Area Manager",
        expectedDeliveryDate: "2023-09-05",
      },
      {
        callOffRef: "CO-088-B/2",
        callOffDate: "2023-10-09",
        callOffQty: 1000,
        callOffPrice: "£850.00",
        callOffBy: "Concrete Lead",
        approveBy: "Area Manager",
        expectedDeliveryDate: "2023-10-11",
      },
    ],
  },
  {
    poRef: "PO-2023-102",
    callOffRef: "CO-102-A",
    project: "Project Alpha",
    mainFolder: "Fit Out",
    subFolder: "Partitions",
    variationRef: "VAR-00",
    supplierName: "InteriorPro",
    supplierEmail: "sales@interiorpro.com",
    no: "6",
    productDescription: "Plasterboard 12.5mm 2400x1200",
    totalQty: 400,
    unit: "EA",
    unitPrice: "£8.50",
    unitPriceNum: 8.5,
    qtyRemaining: 400,
    callOffQty: 0,
    callOffPrice: "£0.00",
    callOffDate: "-",
    expectedDeliveryDate: "-",
    callOffBy: "-",
    approveBy: "-",
    history: [],
  },
  {
    poRef: "PO-2023-102",
    callOffRef: "CO-102-B",
    project: "Project Alpha",
    mainFolder: "Fit Out",
    subFolder: "Partitions",
    variationRef: "VAR-00",
    supplierName: "InteriorPro",
    supplierEmail: "sales@interiorpro.com",
    no: "7",
    productDescription: "Metal Stud 70mm x 3m",
    totalQty: 600,
    unit: "EA",
    unitPrice: "£4.20",
    unitPriceNum: 4.2,
    qtyRemaining: 600,
    callOffQty: 0,
    callOffPrice: "£0.00",
    callOffDate: "-",
    expectedDeliveryDate: "-",
    callOffBy: "-",
    approveBy: "-",
    history: [],
  },
  {
    poRef: "PO-2023-115",
    callOffRef: "CO-115-A",
    project: "Project Alpha",
    mainFolder: "Plumbing",
    subFolder: "Pipes",
    variationRef: "VAR-03",
    supplierName: "AquaFlow Systems",
    supplierEmail: "orders@aquaflow.com",
    no: "8",
    productDescription: "Copper Tube 15mm x 3m",
    totalQty: 300,
    unit: "EA",
    unitPrice: "£12.00",
    unitPriceNum: 12,
    qtyRemaining: 250,
    callOffQty: 50,
    callOffPrice: "£600.00",
    callOffDate: "2023-10-20",
    expectedDeliveryDate: "2023-10-28",
    callOffBy: "Plumbing Lead",
    approveBy: "Project Manager",
    history: [
      {
        callOffRef: "CO-115-A/1",
        callOffDate: "2023-10-20",
        callOffQty: 50,
        callOffPrice: "£600.00",
        callOffBy: "Plumbing Lead",
        approveBy: "Project Manager",
        expectedDeliveryDate: "2023-10-28",
      },
    ],
  },
]

const summaryMetrics = [
  { label: "PO", value: "" },
  { label: "Call Off", value: "" },
  { label: "PO Remaining", value: "" },
]

export default function Page() {
  const [data] = useState<CallOffRow[]>(initialData)

  const isApprovedRow = (row?: CallOffRow) => {
    const approveBy = row?.approveBy?.trim()
    if (!approveBy || approveBy === "-") return false
    return approveBy.toLowerCase() !== "pending"
  }

  // PO order dialog
  const [poDialog, setPoDialog] = useState<PODialogState | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sentPO, setSentPO] = useState<string | null>(null)

  const [historyDialog, setHistoryDialog] = useState<HistoryDialogState | null>(
    null
  )

  const openPODialog = (poRef: string, focusRef?: string) => {
    const poRows = data.filter((r) => r.poRef === poRef)
    if (!poRows.length) return
    setPoDialog({
      poRef,
      supplierName: poRows[0].supplierName,
      supplierEmail: poRows[0].supplierEmail,
      focusRef,
      lines: poRows.map((r) => ({
        callOffRef: r.callOffRef,
        productDescription: r.productDescription,
        unit: r.unit,
        unitPrice: r.unitPrice,
        unitPriceNum: r.unitPriceNum,
        qtyRemaining: r.qtyRemaining,
        orderQty: 0,
      })),
    })
    setSentPO(null)
  }

  const updateOrderQty = (callOffRef: string, qty: number) =>
    setPoDialog((prev) =>
      prev
        ? {
            ...prev,
            lines: prev.lines.map((l) =>
              l.callOffRef === callOffRef ? { ...l, orderQty: qty } : l
            ),
          }
        : null
    )

  const orderTotal = useMemo(() => {
    if (!poDialog) return 0
    return poDialog.lines.reduce(
      (sum, l) => sum + l.orderQty * l.unitPriceNum,
      0
    )
  }, [poDialog])

  const hasOrder = (poDialog?.lines ?? []).some((l) => l.orderQty > 0)

  const handleSendToSupplier = () => {
    setSentPO(poDialog?.poRef ?? null)
    setConfirmOpen(false)
    setPoDialog(null)
  }

  const openHistoryDialog = (row: CallOffRow) => {
    setHistoryDialog({
      poRef: row.poRef,
      callOffRef: row.callOffRef,
      productDescription: row.productDescription,
      totalQty: row.totalQty,
      unit: row.unit,
      unitPrice: row.unitPrice,
      history: row.history,
    })
  }

  const HistoryCell = (field: keyof CallOffRow) => {
    function HistoryCellRenderer(params: {
      value: unknown
      data?: CallOffRow
    }) {
      if (!params.data) return String(params.value ?? "")
      const row = params.data
      return (
        <button
          className="flex w-full items-center justify-between gap-1 text-left underline-offset-2 hover:underline"
          onClick={() => openHistoryDialog(row)}
          title="Click to view call-off history"
        >
          <span>{String(params.value ?? "")}</span>
          <History className="size-3 shrink-0 text-slate-500" />
        </button>
      )
    }

    HistoryCellRenderer.displayName = `HistoryCell(${String(field)})`

    return HistoryCellRenderer
  }

  const columns: ColDef<CallOffRow>[] = [
    {
      headerName: "PO Ref",
      field: "poRef",
      minWidth: 140,
      cellRenderer: (params: { value: string; data?: CallOffRow }) => (
        <button
          className="font-medium underline-offset-2 hover:underline"
          onClick={() => openPODialog(params.value)}
        >
          {params.value}
        </button>
      ),
    },
    {
      headerName: "Call Off Ref",
      field: "callOffRef",
      minWidth: 140,
      cellRenderer: (params: { value: string; data?: CallOffRow }) => (
        <button
          className="font-medium underline-offset-2 hover:underline"
          onClick={() =>
            params.data && openPODialog(params.data.poRef, params.value)
          }
        >
          {params.value}
        </button>
      ),
    },
    { headerName: "Project", field: "project" },
    { headerName: "Main Folder", field: "mainFolder" },
    { headerName: "Sub Folder", field: "subFolder" },
    { headerName: "Variation Ref.", field: "variationRef" },
    { headerName: "Supplier Name", field: "supplierName" },
    { headerName: "Supplier Email", field: "supplierEmail" },
    {
      headerName: "Product Description",
      field: "productDescription",
      minWidth: 220,
      cellRenderer: HistoryCell("productDescription"),
    },
    {
      headerName: "Total QTY",
      field: "totalQty",
      cellRenderer: HistoryCell("totalQty"),
    },
    {
      headerName: "Unit",
      field: "unit",
      cellRenderer: HistoryCell("unit"),
    },
    {
      headerName: "Unit Price",
      field: "unitPrice",
      cellRenderer: HistoryCell("unitPrice"),
    },
    {
      headerName: "QTY Remaining",
      field: "qtyRemaining",
      cellRenderer: HistoryCell("qtyRemaining"),
    },
    {
      headerName: "Call Off QTY",
      field: "callOffQty",
      cellRenderer: HistoryCell("callOffQty"),
    },
    {
      headerName: "Call Off Price",
      field: "callOffPrice",
      cellRenderer: HistoryCell("callOffPrice"),
    },
    {
      headerName: "Call Off Date",
      field: "callOffDate",
      cellRenderer: HistoryCell("callOffDate"),
    },
    {
      headerName: "Expected Delivery",
      field: "expectedDeliveryDate",
      minWidth: 180,
    },
    { headerName: "Call-off By", field: "callOffBy" },
    { headerName: "Approve By", field: "approveBy" },
  ]

  return (
    <div className="w-full space-y-6 p-6">
      <h2 className="mb-4 text-2xl font-semibold">Call Off List</h2>

      <div className="flex items-start justify-between gap-4">
        <TableStat summaryRows={summaryMetrics} />
        <SelectProject />
      </div>

      {sentPO && (
        <div className="flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <PackageCheck className="size-4 shrink-0" />
          Order for <strong>{sentPO}</strong> sent to supplier successfully.
        </div>
      )}

      <AgTable
        rowData={data}
        columnDefs={columns}
        suppressCellClickAction
        height="auto"
        defaultColDef={{
          flex: 1,
          minWidth: 140,
          cellClassRules: {
            "text-green-400": (params) => isApprovedRow(params.data),
            "text-red-400": (params) => !isApprovedRow(params.data),
          },
        }}
        gridOptions={{ rowHeight: 44 }}
      />

      {/* Call-Off History Dialog  */}
      <Dialog
        open={!!historyDialog}
        onOpenChange={(o) => !o && setHistoryDialog(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="size-5" />
              Call-Off History
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-slate-400">PO Ref: </span>
                  <span className="font-medium text-slate-200">
                    {historyDialog?.poRef}
                  </span>
                  <span className="mx-2 text-slate-600">·</span>
                  <span className="text-slate-400">Call Off Ref: </span>
                  <span className="font-medium text-slate-200">
                    {historyDialog?.callOffRef}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Product: </span>
                  <span className="font-medium text-slate-200">
                    {historyDialog?.productDescription}
                  </span>
                </div>
                <div className="flex gap-4">
                  <span>
                    <span className="text-slate-400">Total QTY: </span>
                    <span className="text-slate-200">
                      {historyDialog?.totalQty} {historyDialog?.unit}
                    </span>
                  </span>
                  <span>
                    <span className="text-slate-400">Unit Price: </span>
                    <span className="text-slate-200">
                      {historyDialog?.unitPrice}
                    </span>
                  </span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 overflow-x-auto">
            {historyDialog && historyDialog.history.length > 0 ? (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-xs tracking-wide text-slate-400 uppercase">
                    {[
                      "Call Off Ref",
                      "Date",
                      "QTY",
                      "Price",
                      "Called Off By",
                      "Approved By",
                      "Expected Delivery",
                    ].map((h) => (
                      <th
                        key={h}
                        className="border-r border-white/10 px-3 py-2 text-left last:border-r-0"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyDialog.history.map((entry, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/10 last:border-b-0 odd:bg-white/[0.02]"
                    >
                      <td className="border-r border-white/10 px-3 py-2 font-medium text-blue-300">
                        {entry.callOffRef}
                      </td>
                      <td className="border-r border-white/10 px-3 py-2 text-slate-300">
                        {entry.callOffDate}
                      </td>
                      <td className="border-r border-white/10 px-3 py-2 text-right text-slate-200">
                        {entry.callOffQty}
                      </td>
                      <td className="border-r border-white/10 px-3 py-2 text-right text-slate-200">
                        {entry.callOffPrice}
                      </td>
                      <td className="border-r border-white/10 px-3 py-2 text-slate-300">
                        {entry.callOffBy}
                      </td>
                      <td className="border-r border-white/10 px-3 py-2 text-slate-300">
                        {entry.approveBy}
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        {entry.expectedDeliveryDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/20 bg-white/5">
                    <td
                      colSpan={2}
                      className="px-3 py-2 text-xs font-semibold tracking-wide text-slate-400 uppercase"
                    >
                      Total Called Off
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-bold text-slate-100">
                      {historyDialog.history.reduce(
                        (s, e) => s + e.callOffQty,
                        0
                      )}{" "}
                      {historyDialog.unit}
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-bold text-slate-100">
                      {formatGBP(
                        historyDialog.history.reduce((s, e) => {
                          const n = parseFloat(
                            e.callOffPrice.replace(/[^0-9.]/g, "")
                          )
                          return s + (isNaN(n) ? 0 : n)
                        }, 0)
                      )}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                No call-offs have been made against this line yet.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
            <Button variant="outline" onClick={() => setHistoryDialog(null)}>
              Close
            </Button>
            {historyDialog && historyDialog.history.length > 0 && (
              <Button
                onClick={() =>
                  downloadCSV(
                    `call-off-history-${historyDialog.callOffRef}.csv`,
                    historyDialog.history,
                    historyDialog
                  )
                }
              >
                <Download className="mr-2 size-4" />
                Download CSV
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* PO Order Dialog */}
      <Dialog open={!!poDialog} onOpenChange={(o) => !o && setPoDialog(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{poDialog?.poRef} — Call-Off Order</DialogTitle>
            <DialogDescription>
              Supplier:{" "}
              <span className="font-medium text-slate-200">
                {poDialog?.supplierName}
              </span>{" "}
              &lt;{poDialog?.supplierEmail}&gt;
              <br />
              Enter the quantity to order for each line, then submit to send
              directly to the supplier.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs tracking-wide text-slate-400 uppercase">
                  {[
                    "Call Off Ref",
                    "Description",
                    "Unit",
                    "Unit Price",
                    "QTY Remaining",
                    "Order QTY",
                    "Line Total",
                  ].map((h) => (
                    <th
                      key={h}
                      className="border-r border-white/10 px-3 py-2 text-left last:border-r-0"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {poDialog?.lines.map((line) => {
                  const isFocused = line.callOffRef === poDialog.focusRef
                  const lineTotal = line.orderQty * line.unitPriceNum
                  return (
                    <tr
                      key={line.callOffRef}
                      className={[
                        "border-b border-white/10 last:border-b-0",
                        isFocused
                          ? "bg-blue-500/10 ring-1 ring-blue-500/30 ring-inset"
                          : "odd:bg-white/[0.02]",
                      ].join(" ")}
                    >
                      <td className="border-r border-white/10 px-3 py-2 font-medium text-blue-300">
                        {line.callOffRef}
                      </td>
                      <td className="border-r border-white/10 px-3 py-2 text-slate-200">
                        {line.productDescription}
                      </td>
                      <td className="border-r border-white/10 px-3 py-2 text-center text-slate-300">
                        {line.unit}
                      </td>
                      <td className="border-r border-white/10 px-3 py-2 text-right text-slate-300">
                        {line.unitPrice}
                      </td>
                      <td className="border-r border-white/10 px-3 py-2 text-right text-slate-300">
                        {line.qtyRemaining}
                      </td>
                      <td className="border-r border-white/10 px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          max={line.qtyRemaining}
                          value={line.orderQty === 0 ? "" : line.orderQty}
                          placeholder="0"
                          className="h-8 w-24 text-center text-sm"
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10)
                            updateOrderQty(
                              line.callOffRef,
                              isNaN(v) ? 0 : Math.min(v, line.qtyRemaining)
                            )
                          }}
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-slate-100">
                        {lineTotal > 0 ? formatGBP(lineTotal) : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/20 bg-white/5">
                  <td
                    colSpan={6}
                    className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-slate-400 uppercase"
                  >
                    Order Total
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-bold text-slate-100">
                    {orderTotal > 0 ? formatGBP(orderTotal) : "—"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
            <Button variant="outline" onClick={() => setPoDialog(null)}>
              Cancel
            </Button>
            <Button disabled={!hasOrder} onClick={() => setConfirmOpen(true)}>
              <Send className="mr-2 size-4" />
              Send to Supplier
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send order to supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the call-off order for{" "}
              <strong>{poDialog?.poRef}</strong> ({formatGBP(orderTotal)}) to{" "}
              <strong>{poDialog?.supplierName}</strong> at{" "}
              <strong>{poDialog?.supplierEmail}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSendToSupplier}>
              <Send className="mr-2 size-4" />
              Confirm &amp; Send
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
