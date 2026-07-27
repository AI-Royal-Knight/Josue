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
  Loader2,
} from "lucide-react"
import SelectProject from "@/components/shared/select-project"
import { colors } from "@/constants/colors"
import { cn } from "@/lib/utils"
import { useRoleStore } from "@/lib/role-store"

import type { CallOffRow, PODialogState, HistoryDialogState, CallOffHistoryEntry } from "./types"
import { formatGBP, initialData, summaryMetrics, baseTheme } from "./utils"
import HistoryDialog from "./_components/HistoryDialog"
import PODialog from "./_components/PODialog"
import { getCallOffList, toggleCallOffManagementApproval, createCallOff, approveCallOff, approveAllCallOffs } from "@/lib/api/call-off"
import { useEffect } from "react"
import { toast } from "sonner"

type GroupHeaderRow = {
  _kind: "group"
  poRef: string
  supplierName: string
  supplierEmail: string
  linesCount: number
  totalValue: number
  // filler fields so ColDef<VirtualRow> doesn't complain
  callOffRef: ""
  project: string
  mainFolder: string
  subFolder: string
  variationRef: string
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

type ChildRow = CallOffRow & { _kind: "child"; lineItemRef?: string }

type VirtualRow = GroupHeaderRow | ChildRow

export default function Page() {
  const [data, setData] = useState<CallOffRow[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getCallOffList()
      const mapped = res.map((r) => {
        // Last call off is usually first in history if sorted descending by date
        const lastCO = r.history.length > 0 ? r.history[0] : null
        return {
          id: r.id,
          poRef: r.po_ref || "",
          callOffRef: `LI-${r.id}`, // Using line item ID as the call off ref for tracking
          project: r.project_name || "",
          mainFolder: r.main_folder_name || "-",
          subFolder: r.sub_folder_name || "-",
          variationRef: r.variation_ref || "-",
          supplierName: r.supplier_name || "",
          supplierEmail: r.supplier_email || "",
          no: String(r.id),
          productDescription: r.description || "",
          totalQty: Number(r.qty),
          unit: r.per || "EA",
          unitPrice: `£${r.each}`,
          unitPriceNum: Number(r.each),
          qtyRemaining: Number(r.qty_remaining),
          callOffQty: lastCO ? Number(lastCO.qty) : 0,
          callOffPrice: lastCO ? `£${lastCO.price}` : "-",
          callOffDate: lastCO ? lastCO.date : "-",
          expectedDeliveryDate: lastCO ? (lastCO.expected_delivery_date || "-") : "-",
          callOffBy: lastCO ? (lastCO.call_off_by_name || "-") : "-",
          approveBy: lastCO ? (lastCO.approve_by_name || "Pending") : "-",
          history: r.history.map(h => ({
            id: h.id,
            callOffRef: h.call_off_ref,
            callOffDate: h.date,
            callOffQty: Number(h.qty),
            callOffPrice: `£${h.price}`,
            callOffBy: h.call_off_by_name || "-",
            approveBy: h.approve_by_name || "-",
            expectedDeliveryDate: h.expected_delivery_date || "-"
          })) as CallOffHistoryEntry[],
          managementApproved: r.management_approved,
          managementApprovedDate: r.management_approved_date,
          latestCallOffId: lastCO ? lastCO.id : null,
        }
      })
      setData(mapped)
      setExpanded(new Set(Array.from(new Set(mapped.map((m) => m.poRef)))))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])
  const [poDialog, setPoDialog] = useState<PODialogState | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sentPO, setSentPO] = useState<string | null>(null)
  const [historyDialog, setHistoryDialog] = useState<HistoryDialogState | null>(null)
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false)
  const [approveTargetId, setApproveTargetId] = useState<string | null>(null)
  const [approveAllConfirmOpen, setApproveAllConfirmOpen] = useState(false)
  const [approveAllTargetRef, setApproveAllTargetRef] = useState<string | null>(null)

  const role = useRoleStore((s) => s.role)
  const isProcurement = role === "procurement_department"

  const handleApproveCallOff = useCallback(async () => {
    if (approveTargetId === null) return
    try {
      setLoading(true)
      await approveCallOff(approveTargetId)
      setApproveConfirmOpen(false)
      setApproveTargetId(null)
      toast.success("Call-off approved and sent to supplier successfully.")
      await fetchData()
    } catch (err) {
      toast.error("Failed to approve call-off.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [approveTargetId, fetchData])

  const handleApproveAllCallOffs = useCallback(async () => {
    if (approveAllTargetRef === null) return
    try {
      setLoading(true)
      await approveAllCallOffs(approveAllTargetRef)
      setApproveAllConfirmOpen(false)
      setApproveAllTargetRef(null)
      toast.success("All pending call-offs approved and sent to supplier successfully.")
      await fetchData()
    } catch (err) {
      toast.error("Failed to approve call-offs.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [approveAllTargetRef, fetchData])

  const toggleExpanded = useCallback((poRef: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(poRef)) next.delete(poRef)
      else next.add(poRef)
      return next
    })
  }, [])

  const toggleManagementApproval = useCallback(async (callOffRef: string) => {
    const row = data.find(r => r.callOffRef === callOffRef)
    if (!row) return
    try {
      const idStr = callOffRef.replace('LI-', '')
      await toggleCallOffManagementApproval(idStr, !row.managementApproved)
      await fetchData()
    } catch (err) {
      console.error(err)
    }
  }, [data, fetchData])

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
    () => (poDialog?.lines ?? []).reduce((s, l) => s + l.orderQty * l.unitPriceNum, 0),
    [poDialog]
  )
  const hasOrder = (poDialog?.lines ?? []).some((l) => l.orderQty > 0)

  const handleSendToSupplier = async () => {
    if (!poDialog) return
    try {
      setLoading(true)
      // Generate a shared call_off_ref for this batch
      const sharedRef = `CO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

      // Send a call off creation request for each line item that has an orderQty > 0
      for (const line of poDialog.lines) {
        if (line.orderQty > 0) {
          const idStr = line.callOffRef.replace('LI-', '')
          await createCallOff(idStr, {
            qty: line.orderQty,
            price: line.orderQty * line.unitPriceNum,
            expected_delivery_date: undefined, // could add UI field later
            call_off_ref: sharedRef
          })
        }
      }
      setSentPO(poDialog.poRef)
      setConfirmOpen(false)
      toast.success("Call-offs created successfully.")
      // We don't close poDialog yet so user sees success state, but we fetch latest data
      await fetchData()
    } catch (err) {
      toast.error("Failed to create call-offs.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openHistoryDialog = useCallback((row: CallOffRow | ChildRow) => {
    setHistoryDialog({
      poRef: row.poRef,
      callOffRef: ('lineItemRef' in row && row.lineItemRef) ? row.lineItemRef : row.callOffRef,
      productDescription: row.productDescription,
      totalQty: row.totalQty,
      unit: row.unit,
      unitPrice: row.unitPrice,
      history: row.history,
      supplierName: row.supplierName,
      supplierEmail: row.supplierEmail,
    })
  }, [])

  // ── Build flat virtual rows: one group header per PO + child lines ──────────
  const rowData = useMemo<VirtualRow[]>(() => {
    // Preserve insertion order of PO refs
    const poRefs = Array.from(new Set(data.map((r) => r.poRef)))
    const rows: VirtualRow[] = []

    poRefs.forEach((poRef) => {
      const children = data.filter((r) => r.poRef === poRef)
      const totalValue = children.reduce((s, r) => s + r.unitPriceNum * r.totalQty, 0)

      // Group header row
      rows.push({
        _kind: "group",
        poRef,
        supplierName: children[0].supplierName,
        supplierEmail: children[0].supplierEmail,
        linesCount: children.length,
        totalValue,
        callOffRef: "",
        project: children[0].project,
        mainFolder: children[0].mainFolder,
        subFolder: children[0].subFolder,
        variationRef: children[0].variationRef,
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

      // Child rows — only include when this PO is expanded
      if (expanded.has(poRef)) {
        children.forEach((r) => {
          if (r.history.length > 0) {
            r.history.forEach((h) => {
              rows.push({
                ...r,
                _kind: "child",
                lineItemRef: r.callOffRef,
                // Override with specific call-off data
                callOffRef: h.callOffRef,
                callOffQty: h.callOffQty,
                callOffPrice: h.callOffPrice,
                callOffDate: h.callOffDate,
                expectedDeliveryDate: h.expectedDeliveryDate,
                callOffBy: h.callOffBy,
                approveBy: h.approveBy,
                latestCallOffId: h.id, // Ensure action button uses THIS call off's ID
              })
            })
          }
        })
      }
    })

    return rows
  }, [data, expanded])

  // ── Column definitions ──────────────────────────────────────────────────────
  const columnDefs = useMemo<ColDef<VirtualRow>[]>(() => {
    const cols: ColDef<VirtualRow>[] = [
      // PO Ref / expand-collapse column
      {
        headerName: "PO Ref",
        field: "poRef",
        minWidth: 320,
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
                <div className="flex min-w-0 flex-1 flex-col justify-center pr-2">
                  <span className="text-[13px] font-semibold text-emerald-400 truncate">
                    {row.poRef}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 shrink-0 px-3 text-[11px] bg-blue-600 hover:bg-blue-700 text-white ml-auto"
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

          return (
            <div className="flex items-center pl-8">
              <button
                className="text-[12px] font-medium text-blue-400 underline-offset-2 hover:underline"
                onClick={() => openHistoryDialog(row)}
                title="View call-off history for this line item"
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
      },
      {
        headerName: "Main Folder",
        field: "mainFolder",
        minWidth: 120,
      },
      {
        headerName: "Sub Folder",
        field: "subFolder",
        minWidth: 120,
      },
      {
        headerName: "Variation Ref",
        field: "variationRef",
        minWidth: 120,
      },
      {
        headerName: "Supplier",
        field: "supplierName",
        minWidth: 150,
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
              title="View call-off history for this line item"
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

      {
        headerName: "Action",
        minWidth: 150,
        cellRenderer: (params: { data?: VirtualRow }) => {
          if (params.data?._kind === "group") {
            const group = params.data as GroupHeaderRow
            const hasPending = data.some(r => r.poRef === group.poRef && r.latestCallOffId && !isApproved(r))
            const isApprovingAll = loading && approveAllTargetRef === group.poRef
            if (hasPending && isProcurement) {
              return (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setApproveAllTargetRef(group.poRef)
                    setApproveAllConfirmOpen(true)
                  }}
                  disabled={loading}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-opacity",
                    "bg-blue-600/80 text-blue-100 hover:bg-blue-600",
                    isApprovingAll && "cursor-default opacity-50 pointer-events-none"
                  )}
                >
                  {isApprovingAll ? (
                    <><Loader2 className="size-3 animate-spin" /> Approving All</>
                  ) : (
                    <><CheckCircle2 className="size-3" /> Approve All</>
                  )}
                </button>
              )
            }
            return (
              <span className="text-xs italic text-slate-500">
                Expand to view
              </span>
            )
          }
          const row = params.data as ChildRow
          // Only show approve button if there's a latest call off to approve
          if (!row.latestCallOffId) {
            return (
              <span className="text-[11px] italic text-slate-500">
                No Call-Off
              </span>
            )
          }

          const approved = isApproved(row)
          const isApprovingThis = loading && approveTargetId === row.latestCallOffId

          return (
            <button
              onClick={() => {
                if (isProcurement && !approved && row.latestCallOffId && !isApprovingThis) {
                  setApproveTargetId(row.latestCallOffId)
                  setApproveConfirmOpen(true)
                }
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-opacity",
                approved
                  ? "bg-emerald-500/20 text-emerald-300 pointer-events-none"
                  : "bg-blue-600/80 text-blue-100 hover:bg-blue-600",
                (!isProcurement || approved || isApprovingThis) && "cursor-default opacity-50 pointer-events-none"
              )}
            >
              {isApprovingThis ? (
                <><Loader2 className="size-3 animate-spin" /> Approving</>
              ) : approved ? (
                <><CheckCircle2 className="size-3" /> Approved</>
              ) : (
                <><CheckCircle2 className="size-3" /> Approve</>
              )}
            </button>
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
    loading,
    approveTargetId,
    approveAllTargetRef,
    data,
  ])

  const getRowStyle = useCallback(
    (params: { data?: VirtualRow }) => {
      if (params.data?._kind === "group") {
        return {
          background: colors.oddRowBackground,
          borderBottom: `2px solid ${colors.border}`,
          cursor: "pointer",
        }
      }
      return undefined
    },
    []
  )

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
                : `child__${(p.data as ChildRow).lineItemRef}_${(p.data as ChildRow).latestCallOffId}`
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
            <AlertDialogAction disabled={loading} onClick={handleSendToSupplier}>
              {loading ? (
                <><Loader2 className="mr-2 size-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="mr-2 size-4" /> Confirm &amp; Send</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={approveConfirmOpen} onOpenChange={setApproveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Call-Off?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve the call-off and send an automatic email to the supplier with the call-off details.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setApproveConfirmOpen(false)
              setApproveTargetId(null)
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction disabled={loading} onClick={handleApproveCallOff}>
              {loading ? (
                <><Loader2 className="mr-2 size-4 animate-spin" /> Approving...</>
              ) : (
                <><CheckCircle2 className="mr-2 size-4" /> Approve &amp; Send</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={approveAllConfirmOpen} onOpenChange={setApproveAllConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve All Call-Offs?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve all pending call-offs for PO <strong>{approveAllTargetRef}</strong> and send a single combined email to the supplier with the PDF attached.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setApproveAllConfirmOpen(false)
              setApproveAllTargetRef(null)
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction disabled={loading} onClick={handleApproveAllCallOffs}>
              {loading ? (
                <><Loader2 className="mr-2 size-4 animate-spin" /> Approving...</>
              ) : (
                <><CheckCircle2 className="mr-2 size-4" /> Approve All &amp; Send</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
