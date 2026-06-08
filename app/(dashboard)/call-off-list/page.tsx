"use client"

import { useState, useMemo, useCallback } from "react"
import type { ColDef } from "ag-grid-community"
import { AgGridProvider, AgGridReact } from "ag-grid-react"
import { AllCommunityModule } from "ag-grid-community"
import TableStat from "@/components/common/table-stat"
import { Button } from "@/components/ui/button"
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
import {
  Send,
  PackageCheck,
  History,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import SelectProject from "@/components/shared/select-project"
import { colors } from "@/constants/colors"
import { cn } from "@/lib/utils"
import { useRoleStore } from "@/lib/role-store"

import type { CallOffRow, PODialogState, HistoryDialogState } from "./types"
import { formatGBP, initialData, summaryMetrics, baseTheme } from "./utils"
import HistoryDialog from "./_components/HistoryDialog"
import PODialog from "./_components/PODialog"
import { Switch } from "@/components/ui/switch"

type GroupHeaderRow = {
  _kind: "group"
  poRef: string
  supplierName: string
  supplierEmail: string
  linesCount: number
  totalValue: number
  // filler fields so ColDef<VirtualRow> doesn't complain
  callOffRef: ""
  project: ""
  mainFolder: ""
  subFolder: ""
  variationRef: ""
  productDescription: ""
  totalQty: 0
  unit: ""
  unitPrice: ""
  unitPriceNum: 0
  qtyRemaining: 0
  callOffQty: 0
  callOffPrice: ""
  callOffDate: ""
  expectedDeliveryDate: ""
  callOffBy: ""
  approveBy: ""
  managementApproved: false
  managementApprovedDate: null
  history: []
  no: ""
}

type ChildRow = CallOffRow & { _kind: "child" }

type VirtualRow = GroupHeaderRow | ChildRow

export default function Page() {
  const [data, setData] = useState<CallOffRow[]>(initialData)
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(Array.from(new Set(initialData.map((r) => r.poRef))))
  )
  const [poDialog, setPoDialog] = useState<PODialogState | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sentPO, setSentPO] = useState<string | null>(null)
  const [historyDialog, setHistoryDialog] = useState<HistoryDialogState | null>(
    null
  )

  const role = useRoleStore((s) => s.role)
  const isProcurement = role === "procurement_department"

  const toggleExpanded = useCallback((poRef: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(poRef)) next.delete(poRef)
      else next.add(poRef)
      return next
    })
  }, [])

  const toggleManagementApproval = useCallback((callOffRef: string) => {
    const today = new Date().toISOString().slice(0, 10)
    setData((prev) =>
      prev.map((r) =>
        r.callOffRef === callOffRef
          ? {
              ...r,
              managementApproved: !r.managementApproved,
              managementApprovedDate: !r.managementApproved ? today : null,
            }
          : r
      )
    )
  }, [])

  const isApproved = (row?: CallOffRow) => {
    const v = row?.approveBy?.trim()
    return !!v && v !== "-" && v.toLowerCase() !== "pending"
  }

  const openPODialog = useCallback(
    (poRef: string, focusRef?: string) => {
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
          expectedDelivery: r.expectedDeliveryDate,
          orderQty: 0,
        })),
      })
      setSentPO(null)
    },
    [data]
  )

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

  const orderTotal = useMemo(
    () =>
      (poDialog?.lines ?? []).reduce(
        (s, l) => s + l.orderQty * l.unitPriceNum,
        0
      ),
    [poDialog]
  )
  const hasOrder = (poDialog?.lines ?? []).some((l) => l.orderQty > 0)

  const handleSendToSupplier = () => {
    setSentPO(poDialog?.poRef ?? null)
    setConfirmOpen(false)
    setPoDialog(null)
  }

  const openHistoryDialog = useCallback((row: CallOffRow) => {
    setHistoryDialog({
      poRef: row.poRef,
      callOffRef: row.callOffRef,
      productDescription: row.productDescription,
      totalQty: row.totalQty,
      unit: row.unit,
      unitPrice: row.unitPrice,
      history: row.history,
    })
  }, [])

  const rowData = useMemo<VirtualRow[]>(() => {
    // Preserve insertion order of PO refs
    const poRefs = Array.from(new Set(data.map((r) => r.poRef)))
    const rows: VirtualRow[] = []

    poRefs.forEach((poRef) => {
      const children = data.filter((r) => r.poRef === poRef)
      const totalValue = children.reduce(
        (s, r) => s + r.unitPriceNum * r.totalQty,
        0
      )

      // Group header row
      rows.push({
        _kind: "group",
        poRef,
        supplierName: children[0].supplierName,
        supplierEmail: children[0].supplierEmail,
        linesCount: children.length,
        totalValue,
        callOffRef: "",
        project: "",
        mainFolder: "",
        subFolder: "",
        variationRef: "",
        productDescription: "",
        totalQty: 0,
        unit: "",
        unitPrice: "",
        unitPriceNum: 0,
        qtyRemaining: 0,
        callOffQty: 0,
        callOffPrice: "",
        callOffDate: "",
        expectedDeliveryDate: "",
        callOffBy: "",
        approveBy: "",
        managementApproved: false,
        managementApprovedDate: null,
        history: [],
        no: "",
      })

      if (expanded.has(poRef)) {
        children.forEach((r) => rows.push({ ...r, _kind: "child" }))
      }
    })

    return rows
  }, [data, expanded])

  const columnDefs = useMemo<ColDef<VirtualRow>[]>(() => {
    const cols: ColDef<VirtualRow>[] = [
      // PO Ref / expand-collapse column
      {
        headerName: "PO Ref",
        field: "poRef",
        minWidth: 260,
        pinned: "left" as const,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          overflow: "visible",
        },
        cellRenderer: (params: { data?: VirtualRow }) => {
          const row = params.data
          if (!row) return null

          if (row._kind === "group") {
            const isOpen = expanded.has(row.poRef)
            return (
              <div
                className="flex w-full cursor-pointer items-center gap-2"
                style={{ height: "100%" }}
                onClick={() => toggleExpanded(row.poRef)}
              >
                {isOpen ? (
                  <ChevronDown className="size-4 shrink-0 text-slate-400" />
                ) : (
                  <ChevronRight className="size-4 shrink-0 text-slate-400" />
                )}
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <span className="text-[13px] font-semibold text-emerald-400">
                    {row.poRef}
                  </span>
                  {/* <span className="text-[11px] text-slate-400">
                    {row.supplierName} &middot; {row.linesCount} line{row.linesCount !== 1 ? "s" : ""} &middot; {formatGBP(row.totalValue)}
                  </span> */}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 shrink-0 px-3 text-[11px]"
                  onClick={(e) => {
                    e.stopPropagation()
                    openPODialog(row.poRef)
                  }}
                >
                  <Send className="mr-1 h-3 w-3" />
                  Call Off
                </Button>
              </div>
            )
          }

          // Child row — show the call-off ref indented
          return (
            <div className="flex items-center pl-8">
              <button
                className="text-[12px] font-medium text-blue-400 underline-offset-2 hover:underline"
                onClick={() => openPODialog(row.poRef, row.callOffRef)}
              >
                {row.callOffRef}
              </button>
            </div>
          )
        },
      },

      // All child-only columns — blank on group rows
      {
        headerName: "Project",
        field: "project",
        minWidth: 130,
        cellRenderer: (p: { data?: VirtualRow; value: string }) =>
          p.data?._kind === "group" ? null : p.value,
      },
      {
        headerName: "Main Folder",
        field: "mainFolder",
        minWidth: 120,
        cellRenderer: (p: { data?: VirtualRow; value: string }) =>
          p.data?._kind === "group" ? null : p.value,
      },
      {
        headerName: "Sub Folder",
        field: "subFolder",
        minWidth: 120,
        cellRenderer: (p: { data?: VirtualRow; value: string }) =>
          p.data?._kind === "group" ? null : p.value,
      },
      {
        headerName: "Variation Ref",
        field: "variationRef",
        minWidth: 120,
        cellRenderer: (p: { data?: VirtualRow; value: string }) =>
          p.data?._kind === "group" ? null : p.value,
      },
      {
        headerName: "Supplier",
        field: "supplierName",
        minWidth: 150,
        cellRenderer: (p: { data?: VirtualRow; value: string }) =>
          p.data?._kind === "group" ? null : p.value,
      },
      {
        headerName: "Product Description",
        field: "productDescription",
        minWidth: 220,
        cellRenderer: (params: { data?: VirtualRow; value: string }) => {
          if (params.data?._kind !== "child") return null
          const row = params.data as ChildRow
          return (
            <button
              className="flex w-full items-center justify-between gap-1 text-left underline-offset-2 hover:underline"
              onClick={() => openHistoryDialog(row)}
              title="View call-off history"
            >
              <span>{params.value}</span>
              <History className="size-3 shrink-0 text-slate-500" />
            </button>
          )
        },
      },
      {
        headerName: "Total QTY",
        field: "totalQty",
        minWidth: 100,
        cellRenderer: (p: { data?: VirtualRow; value: number }) =>
          p.data?._kind === "group" ? null : p.value,
      },
      {
        headerName: "Unit",
        field: "unit",
        minWidth: 80,
        cellRenderer: (p: { data?: VirtualRow; value: string }) =>
          p.data?._kind === "group" ? null : p.value,
      },
      {
        headerName: "Unit Price",
        field: "unitPrice",
        minWidth: 110,
        cellRenderer: (p: { data?: VirtualRow; value: string }) =>
          p.data?._kind === "group" ? null : p.value,
      },
      {
        headerName: "QTY Remaining",
        field: "qtyRemaining",
        minWidth: 120,
        cellRenderer: (p: { data?: VirtualRow; value: number }) =>
          p.data?._kind === "group" ? null : p.value,
      },
      {
        headerName: "Call Off QTY",
        field: "callOffQty",
        minWidth: 110,
        cellRenderer: (p: { data?: VirtualRow; value: number }) =>
          p.data?._kind === "group" ? null : p.value,
      },
      {
        headerName: "Call Off Price",
        field: "callOffPrice",
        minWidth: 120,
        cellRenderer: (p: { data?: VirtualRow; value: string }) =>
          p.data?._kind === "group" ? null : p.value,
      },
      {
        headerName: "Call Off Date",
        field: "callOffDate",
        minWidth: 120,
        cellRenderer: (p: { data?: VirtualRow; value: string }) =>
          p.data?._kind === "group" ? null : p.value,
      },
      {
        headerName: "Exp. Delivery",
        field: "expectedDeliveryDate",
        minWidth: 130,
        cellRenderer: (p: { data?: VirtualRow; value: string }) =>
          p.data?._kind === "group" ? null : p.value,
      },
      {
        headerName: "Call-off By",
        field: "callOffBy",
        minWidth: 130,
        cellRenderer: (p: { data?: VirtualRow; value: string }) =>
          p.data?._kind === "group" ? null : p.value,
      },

      // ── Procurement-only ──────────────────────────────────────────────
      {
        headerName: "Approve",
        field: "managementApproved",
        minWidth: 210,
        hide: !isProcurement,
        cellRenderer: (params: { data?: VirtualRow; value: boolean }) => {
          if (params.data?._kind !== "child") return null
          const row = params.data as ChildRow
          const approved = params.value
          return (
            // <button
            //   onClick={() => isProcurement && toggleManagementApproval(row.callOffRef)}
            //   title={isProcurement ? (approved ? "Click to revoke" : "Click to approve") : undefined}
            //   className={cn(
            //     "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-opacity",
            //     approved
            //       ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
            //       : "bg-slate-700/60 text-slate-400 hover:bg-slate-700",
            //     !isProcurement && "cursor-default pointer-events-none"
            //   )}
            // >
            //   {approved ? (
            //     <><CheckCircle2 className="size-3" /> Approved</>
            //   ) : (
            //     <><XCircle className="size-3" /> Pending</>
            //   )}
            // </button>
            <Switch
              checked={approved}
              onCheckedChange={() =>
                isProcurement && toggleManagementApproval(row.callOffRef)
              }
              disabled={!isProcurement}
              className={cn(
                "hover:bg-slate-700/30 data-[state=checked]:bg-emerald-500/20 data-[state=checked]:text-emerald-300",
                !isProcurement && "pointer-events-none cursor-default"
              )}
              title={
                isProcurement
                  ? approved
                    ? "Click to revoke"
                    : "Click to approve"
                  : undefined
              }
            />
          )
        },
      },
      {
        headerName: "Approval Date",
        field: "managementApprovedDate",
        minWidth: 220,
        hide: !isProcurement,
        cellRenderer: (params: { data?: VirtualRow; value: string | null }) => {
          if (params.data?._kind !== "child") return null
          if (!params.value)
            return (
              <span className="text-xs text-slate-500 italic">
                Not yet approved
              </span>
            )
          return (
            <span className="text-xs text-emerald-300">{params.value}</span>
          )
        },
      },

      {
        headerName: "Approved By",
        field: "approveBy",
        minWidth: 130,
        cellRenderer: (params: { data?: VirtualRow; value: string }) => {
          if (params.data?._kind !== "child") return null
          const row = params.data as ChildRow
          const approved = isApproved(row)
          return (
            <span
              className={cn(
                "text-[12px] font-medium",
                approved ? "text-emerald-400" : "text-amber-400"
              )}
            >
              {params.value}
            </span>
          )
        },
      },
    ]

    return cols
  }, [
    expanded,
    toggleExpanded,
    openPODialog,
    openHistoryDialog,
    isProcurement,
    toggleManagementApproval,
  ])

  const getRowStyle = useCallback((params: { data?: VirtualRow }) => {
    if (params.data?._kind === "group") {
      return {
        background: colors.oddRowBackground,
        borderBottom: `2px solid ${colors.border}`,
        cursor: "pointer",
      }
    }
    return undefined
  }, [])

  return (
    <div className="w-full space-y-6 p-6">
      <h2 className="text-2xl font-semibold">Call Off List</h2>

      <SelectProject />
      <TableStat summaryRows={summaryMetrics} />

      {sentPO && (
        <div className="flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <PackageCheck className="size-4 shrink-0" />
          Order for <strong>{sentPO}</strong> sent to supplier successfully.
        </div>
      )}

      <AgGridProvider modules={[AllCommunityModule]}>
        <div style={{ width: "100%", minHeight: 520 }}>
          <AgGridReact<VirtualRow>
            rowData={rowData}
            columnDefs={columnDefs}
            theme={baseTheme}
            defaultColDef={{
              flex: 1,
              minWidth: 120,
              resizable: true,
              sortable: false,
              filter: false,
            }}
            getRowStyle={getRowStyle}
            getRowHeight={(params) => {
              return params.data?._kind === "group" ? 56 : 44
            }}
            suppressCellFocus
            animateRows
            rowHeight={44}
            enableCellTextSelection
            domLayout="autoHeight"
            getRowId={(p) =>
              p.data._kind === "group"
                ? `group__${p.data.poRef}`
                : `child__${(p.data as ChildRow).callOffRef}`
            }
          />
        </div>
      </AgGridProvider>

      <HistoryDialog
        dialogState={historyDialog}
        onOpenChange={(open) => !open && setHistoryDialog(null)}
      />

      <PODialog
        dialogState={poDialog}
        onOpenChange={(open) => !open && setPoDialog(null)}
        onUpdateOrderQty={updateOrderQty}
        onSendClick={() => setConfirmOpen(true)}
        hasOrder={hasOrder}
        orderTotal={orderTotal}
      />

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
              <Send className="mr-2 size-4" /> Confirm &amp; Send
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
