"use client"

import { useCallback, useMemo, useState, useEffect, useRef } from "react"
import Box from "@mui/material/Box"

import {
  DataGrid,
  type GridColDef,
  type GridColumnGroupingModel,
} from "@mui/x-data-grid"

import { Eye, Download, FileSpreadsheet, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { agTableDataGridSx } from "@/lib/agtable-datagrid-sx"
import { colors } from "@/constants/colors"

import { SubfolderModal } from "@/app/(dashboard)/labour-target/subfolder-modal"
import type {
  FolderType,
  ModalState,
  Row,
} from "@/app/(dashboard)/labour-target/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import PdfViewerDialog from "@/components/common/pdf-viewer-dialog"
import { generateSimplePdf } from "@/lib/generate-pdf"
import { getWhiteCard, getMonthlyApplications, MonthlyApplicationApi } from "@/lib/api/monthly-application"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

const ROWS_PER_FOLDER = 5
const ROW_HEIGHT = 42
const HEADER_FALLBACK = 98

const parseFloatSafe = (val: any) => {
  if (typeof val === "number") return val
  if (!val) return 0
  const parsed = parseFloat(val.toString().replace(/[^0-9.-]+/g, ""))
  return isNaN(parsed) ? 0 : parsed
}

function SummaryGrid({
  folder,
  isLocked,
  sx,
  rowCount = ROWS_PER_FOLDER,
}: {
  folder: FolderType
  isLocked: boolean
  sx?: object
  rowCount?: number
}) {
  const rows = useMemo(
    () =>
      Array.from({ length: rowCount }, (_, i) => {
        let pv_total = 0
        let total_claim = 0

        folder.subfolders.forEach((sub: any) => {
          const subRow = sub.rows?.[i]

          const pvStr = subRow?.projectValue || (i === 0 ? sub.project_value?.toFixed(2) || "" : "")
          const pv = parseFloatSafe(pvStr)
          pv_total += pv

          const ltStr = subRow?.labourTarget || (i === 0 ? sub.labour_target?.toFixed(2) || "" : "")
          const rowLt = parseFloatSafe(ltStr)

          // Actual booked amount submitted by mobile app users (default 0)
          const bookedLt = parseFloatSafe(subRow?.bookedLabour ?? (i === 0 ? sub.booked_labour : 0))

          if (rowLt > 0 && bookedLt > 0) {
            total_claim += (bookedLt / rowLt) * pv
          }
        })

        const percent_claim = pv_total > 0 ? (total_claim / pv_total) * 100 : 0

        return {
          id: i + 1,
          pv_total: pv_total !== 0 ? `£${pv_total.toFixed(2)}` : "",
          total_claim: total_claim !== 0 ? `£${total_claim.toFixed(2)}` : "",
          percent_claim: percent_claim !== 0 ? `${percent_claim.toFixed(1)}%` : "",
        }
      }),
    [folder, rowCount]
  )

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "pv_total",
        headerName: "PV Total",
        width: 100,
        editable: false,
        hideable: false,
      },
      {
        field: "total_claim",
        headerName: "Total Claim",
        width: 110,
        editable: false,
        hideable: false,
      },
      {
        field: "percent_claim",
        headerName: "% Claim",
        width: 90,
        editable: false,
        hideable: false,
      },
    ],
    []
  )

  const columnGroupingModel: GridColumnGroupingModel = useMemo(
    () => [
      {
        groupId: "summary-group",
        headerName: "",
        children: [
          { field: "pv_total" },
          { field: "total_claim" },
          { field: "percent_claim" },
        ],
      },
    ],
    []
  )

  const fg = colors.foreground ?? "#e2e8f0"

  return (
    <DataGrid
      autoHeight
      rows={rows}
      columns={columns}
      columnGroupingModel={columnGroupingModel}
      hideFooter
      disableRowSelectionOnClick
      showCellVerticalBorder
      showColumnVerticalBorder
      disableColumnResize
      disableColumnSorting
      disableColumnMenu
      rowHeight={ROW_HEIGHT}
      isCellEditable={() => false}
      sx={{
        ...agTableDataGridSx,
        ...sx,
        "& .MuiDataGrid-columnHeaderTitleContainer": {
          justifyContent: "center",
        },
        "& .MuiDataGrid-columnHeaderTitle": {
          textAlign: "center",
          width: "100%",
        },
      }}
    />
  )
}

// Per-folder DataGrid — displays Work Section, Work Area, Project Value (NO Labour Target)
function FolderGrid({
  folder,
  isLocked,
  sx,
  rowCount = ROWS_PER_FOLDER,
}: {
  folder: FolderType
  isLocked: boolean
  sx?: object
  rowCount?: number
}) {
  const rows = useMemo(
    () =>
      Array.from({ length: rowCount }, (_, i) => {
        const row: Record<string, unknown> = { id: i + 1 }
        folder.subfolders.forEach((sub: any) => {
          const subRow = sub.rows?.[i]
          row[`${sub.id}_ws`] = subRow?.workSection || ""
          row[`${sub.id}_wa`] = subRow?.workArea || ""
          const pvStr = subRow?.projectValue || (i === 0 ? sub.project_value?.toFixed(2) || "" : "")
          row[`${sub.id}_pv`] = pvStr ? (pvStr.toString().startsWith("£") ? pvStr : `£${parseFloatSafe(pvStr).toFixed(2)}`) : ""
        })
        return row
      }),
    [folder, rowCount]
  )

  // Only Work Section, Work Area, and Project Value are shown (Labour Target is omitted per specification)
  const columns: GridColDef[] = useMemo(
    () =>
      folder.subfolders.flatMap((sub) => [
        {
          field: `${sub.id}_ws`,
          headerName: "Work Section",
          width: 130,
          editable: false,
        },
        {
          field: `${sub.id}_wa`,
          headerName: "Work Area",
          width: 130,
          editable: false,
        },
        {
          field: `${sub.id}_pv`,
          headerName: "Project Value",
          width: 120,
          editable: false,
        },
      ]),
    [folder]
  )

  const columnGroupingModel: GridColumnGroupingModel = useMemo(
    () =>
      folder.subfolders.map((sub) => ({
        groupId: sub.id,
        headerName: sub.name.toUpperCase(),
        children: [
          { field: `${sub.id}_ws` },
          { field: `${sub.id}_wa` },
          { field: `${sub.id}_pv` },
        ],
      })),
    [folder]
  )

  return (
    <DataGrid
      autoHeight
      rows={rows}
      columns={columns}
      columnGroupingModel={columnGroupingModel}
      hideFooter
      disableRowSelectionOnClick
      showCellVerticalBorder
      showColumnVerticalBorder
      disableColumnResize
      disableColumnSorting
      disableColumnMenu
      rowHeight={ROW_HEIGHT}
      isCellEditable={() => false}
      sx={{
        ...agTableDataGridSx,
        ...sx,
        "& .MuiDataGrid-columnHeaderTitleContainer": {
          justifyContent: "center",
        },
        "& .MuiDataGrid-columnHeaderTitle": {
          textAlign: "center",
          width: "100%",
        },
      }}
    />
  )
}

export default function WhiteCardView({ projectId }: { projectId: string }) {
  const [folders, setFolders] = useState<FolderType[]>([])
  const [loading, setLoading] = useState(false)
  const [applications, setApplications] = useState<MonthlyApplicationApi[]>([])
  const [selectedApp, setSelectedApp] = useState<MonthlyApplicationApi | null>(null)
  const [appDialogOpen, setAppDialogOpen] = useState(false)
  const [appPdfOpen, setAppPdfOpen] = useState(false)

  const [modal, setModal] = useState<ModalState>(null)
  const [copiedValue, setCopiedValue] = useState("")

  const gridRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [headerHeights, setHeaderHeights] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!projectId) {
      setFolders([])
      setApplications([])
      return
    }
    setLoading(true)

    Promise.all([
      getWhiteCard(projectId),
      getMonthlyApplications(projectId),
    ])
      .then(([whiteCardData, appData]) => {
        if (whiteCardData.groups) {
          const mappedFolders: FolderType[] = whiteCardData.groups.map((g: any) => ({
            id: g.groupId,
            name: g.headerName,
            subfolders: g.subfolders.map((sub: any) => ({
              id: sub.id,
              name: sub.name,
              rows: Array.isArray(sub.rows) ? sub.rows : [],
              project_value: sub.project_value,
              labour_target: sub.labour_target,
              booked_labour: sub.booked_labour,
            })),
          }))
          setFolders(mappedFolders)
        }
        setApplications(appData.monthly_applications || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    const observers: ResizeObserver[] = []
    folders.forEach((folder) => {
      const el = gridRefs.current.get(folder.id)
      if (!el) return
      const measure = () => {
        const header = el.querySelector(".MuiDataGrid-columnHeaders") as HTMLElement | null
        if (header) {
          setHeaderHeights((prev) =>
            prev[folder.id] === header.offsetHeight
              ? prev
              : { ...prev, [folder.id]: header.offsetHeight }
          )
        }
      }
      measure()
      const obs = new ResizeObserver(measure)
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [folders])

  const saveSubfolder = useCallback(
    (folderId: string, subfolderId: string | null, rows: Row[]) => {
      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId
            ? {
                ...f,
                subfolders: f.subfolders.map((sf) =>
                  sf.id === subfolderId ? { ...sf, rows } : sf
                ),
              }
            : f
        )
      )
      setModal(null)
    },
    []
  )

  const activeFolder = modal
    ? folders.find((f) => f.id === modal.folderId)
    : null
  const activeSubfolder = activeFolder?.subfolders.find(
    (sf) => sf.id === modal?.subfolderId
  )

  const handleOpenAppDetails = (app: MonthlyApplicationApi) => {
    setSelectedApp(app)
    setAppDialogOpen(true)
  }

  const getWhiteCardPdf = useCallback(() => {
    if (!selectedApp) return new Blob([])
    const gross =
      (parseFloat(selectedApp.contract_works_total) || 0) +
      (parseFloat(selectedApp.variations_total) || 0)

    return generateSimplePdf({
      title: "WHITE CARD",
      subtitle: `Application #${selectedApp.application_number} – Date: ${selectedApp.date}`,
      headerFields: [
        { label: "Application No.", value: String(selectedApp.application_number) },
        { label: "Date", value: String(selectedApp.date) },
        { label: "Gross Total", value: formatCurrency(gross) },
      ],
      detailFields: [
        {
          label: "Contract Works Total",
          value: formatCurrency(parseFloat(selectedApp.contract_works_total) || 0),
        },
        {
          label: "Variations Total",
          value: formatCurrency(parseFloat(selectedApp.variations_total) || 0),
        },
        {
          label: "Amount Claimed",
          value: formatCurrency(parseFloat(selectedApp.amount_claimed) || gross),
        },
      ],
      totalLabel: "Total Claim",
      totalValue: formatCurrency(parseFloat(selectedApp.amount_claimed) || gross),
      footer: "Monthly application white card summary.",
    })
  }, [selectedApp])

  const downloadWhiteCardDoc = useCallback(() => {
    if (!selectedApp) return
    const gross =
      (parseFloat(selectedApp.contract_works_total) || 0) +
      (parseFloat(selectedApp.variations_total) || 0)

    const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>White Card #${selectedApp.application_number}</title></head>
  <body style="font-family: Arial, sans-serif; color: #111; padding: 24px;">
    <h1>WHITE CARD</h1>
    <p><strong>Application:</strong> #${selectedApp.application_number}</p>
    <p><strong>Date:</strong> ${selectedApp.date}</p>
    <hr style="border: none; border-top: 1px solid #ddd;" />
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px;">
      <thead>
        <tr>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px 4px;">Description</th>
          <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px 4px;">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0;">Contract Works</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${formatCurrency(parseFloat(selectedApp.contract_works_total) || 0)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0;">Variations</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${formatCurrency(parseFloat(selectedApp.variations_total) || 0)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td style="padding: 12px 4px; text-align: right;"><strong>Total Gross Claim</strong></td>
          <td style="padding: 12px 4px; text-align: right;"><strong>${formatCurrency(gross)}</strong></td>
        </tr>
      </tfoot>
    </table>
  </body>
</html>`
    const blob = new Blob([html], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `white-card-app-${selectedApp.application_number}.doc`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [selectedApp])

  // Full table workbook export (Work Section, Work Area, Project Value, PV Total, Total Claim, % Claim)
  const exportWorkbook = useCallback(() => {
    if (!folders.length) {
      toast.error("No folder data to export")
      return
    }

    const rowsData: string[][] = [
      ["Main Folder", "Subfolder", "Work Section", "Work Area", "Project Value", "PV Total", "Total Claim", "% Claim"],
    ]

    let grandPv = 0
    let grandClaim = 0

    folders.forEach((folder) => {
      const maxRows = Math.max(ROWS_PER_FOLDER, ...folder.subfolders.map((sub: any) => sub.rows?.length || 0))

      for (let i = 0; i < maxRows; i++) {
        let pv_total = 0
        let total_claim = 0

        folder.subfolders.forEach((sub: any) => {
          const subRow = sub.rows?.[i]
          const pvStr = subRow?.projectValue || (i === 0 ? sub.project_value?.toFixed(2) || "" : "")
          const pv = parseFloatSafe(pvStr)
          pv_total += pv

          const ltStr = subRow?.labourTarget || (i === 0 ? sub.labour_target?.toFixed(2) || "" : "")
          const rowLt = parseFloatSafe(ltStr)
          const bookedLt = parseFloatSafe(subRow?.bookedLabour ?? (i === 0 ? sub.booked_labour : 0))

          if (rowLt > 0 && bookedLt > 0) {
            total_claim += (bookedLt / rowLt) * pv
          }
        })

        const percent_claim = pv_total > 0 ? (total_claim / pv_total) * 100 : 0
        grandPv += pv_total
        grandClaim += total_claim

        folder.subfolders.forEach((sub: any, subIndex: number) => {
          const subRow = sub.rows?.[i]
          const ws = subRow?.workSection || ""
          const wa = subRow?.workArea || ""
          const pvStr = subRow?.projectValue || (i === 0 ? sub.project_value?.toFixed(2) || "" : "")
          const pv = parseFloatSafe(pvStr)

          rowsData.push([
            folder.name,
            sub.name,
            ws,
            wa,
            pv ? `£${pv.toFixed(2)}` : "£0.00",
            subIndex === 0 && pv_total > 0 ? `£${pv_total.toFixed(2)}` : "",
            subIndex === 0 && total_claim > 0 ? `£${total_claim.toFixed(2)}` : "",
            subIndex === 0 && pv_total > 0 ? `${percent_claim.toFixed(1)}%` : "",
          ])
        })
      }
    })

    const grandPercent = grandPv > 0 ? (grandClaim / grandPv) * 100 : 0
    rowsData.push([])
    rowsData.push(["GRAND TOTAL", "", "", "", `£${grandPv.toFixed(2)}`, `£${grandPv.toFixed(2)}`, `£${grandClaim.toFixed(2)}`, `${grandPercent.toFixed(1)}%`])

    const csvContent = rowsData
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `white-card-workbook-${projectId}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Workbook exported successfully")
  }, [folders, projectId])

  const borderColor = colors.border ?? "rgba(255,255,255,0.12)"
  const sectionBg = colors.oddRowBackground ?? "rgba(255,255,255,0.04)"
  const fg = colors.foreground ?? "#e2e8f0"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="w-1/3 min-w-[320px] overflow-hidden rounded-lg border border-white/10 bg-[#0a1730]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#070f1e]/60">
                <th className="px-4 py-2.5 text-left font-medium text-slate-300">
                  No.
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-slate-300">
                  Application Date
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-slate-300">
                  Value Claimed
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-slate-400">
                    No previous applications for this project
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const gross =
                    (parseFloat(app.contract_works_total) || 0) +
                    (parseFloat(app.variations_total) || 0)
                  return (
                    <tr
                      key={app.id}
                      className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/[0.06]"
                      onClick={() => handleOpenAppDetails(app)}
                    >
                      <td className="px-4 py-3 text-slate-200 font-medium">
                        #{app.application_number}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {app.date}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                        {formatCurrency(parseFloat(app.amount_claimed) || gross)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dedicated Export Button for the full white card table workbook */}
        <Button
          onClick={exportWorkbook}
          variant="outline"
          className="gap-2 bg-[#1d2c46] hover:bg-[#25395a] text-slate-200 border-white/10"
        >
          <FileSpreadsheet className="size-4 text-emerald-400" />
          Export White Card Workbook
        </Button>
      </div>

      {/* ── Previous Application Details Dialog ── */}
      <Dialog open={appDialogOpen} onOpenChange={setAppDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="rounded border border-white/10 bg-slate-900 p-4 text-sm text-slate-200">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-white">
                      APPLICATION #{selectedApp.application_number}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Date: {selectedApp.date}
                    </p>
                  </div>
                </div>
                <div className="mb-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Contract Works</span>
                    <p className="font-medium text-slate-200">
                      {formatCurrency(parseFloat(selectedApp.contract_works_total) || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Variations</span>
                    <p className="font-medium text-slate-200">
                      {formatCurrency(parseFloat(selectedApp.variations_total) || 0)}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-xs text-slate-500">Total Claimed Value</span>
                  <p className="mt-0.5 text-lg font-semibold text-emerald-400">
                    {formatCurrency(
                      parseFloat(selectedApp.amount_claimed) ||
                        (parseFloat(selectedApp.contract_works_total) || 0) +
                          (parseFloat(selectedApp.variations_total) || 0)
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setAppPdfOpen(true)}
                  className="gap-2"
                >
                  <Eye className="size-4" />
                  View PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadWhiteCardDoc}
                  className="gap-2"
                >
                  <Download className="size-4" />
                  Download Document
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PdfViewerDialog
        open={appPdfOpen}
        onOpenChange={setAppPdfOpen}
        title={selectedApp ? `White Card #${selectedApp.application_number}` : "White Card"}
        getPdf={getWhiteCardPdf}
      />

      {/* ── Main White Card Folders and Grids ── */}
      <Box sx={{ display: "flex", overflow: "hidden" }}>
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Box sx={{ minWidth: 1200 }}>
            {folders.map((folder) => {
              const maxRows = Math.max(
                ROWS_PER_FOLDER,
                ...folder.subfolders.map((sub: any) => sub.rows?.length || 0)
              )
              const hh = headerHeights[folder.id] ?? HEADER_FALLBACK
              const sectionH = hh + maxRows * ROW_HEIGHT
              const isNotFirst = folders.indexOf(folder) > 0
              const borderTopNone = {
                "& .MuiDataGrid-root, & .MuiDataGrid-main": {
                  borderTop: "none",
                },
              }

              return (
                <div key={folder.id} className="mb-6 rounded-lg border border-white/10 overflow-hidden bg-[#0a1730]">
                  {/* Prominent Main Folder Name Header Banner */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#172544] border-b border-white/10 text-sm font-bold text-slate-100 tracking-wide">
                    <div className="flex items-center gap-2">
                      <Folder className="size-4 text-blue-400" />
                      <span className="text-xs uppercase px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold">
                        Folder
                      </span>
                      <span className="text-base text-white">{folder.name.toUpperCase()}</span>
                    </div>
                  </div>

                  <Box sx={{ display: "flex", alignItems: "stretch" }}>
                    {/* Folder's DataGrid (subfolder columns: Work Section, Work Area, Project Value) */}
                    <Box
                      ref={(el: HTMLDivElement | null) => {
                        if (el) gridRefs.current.set(folder.id, el)
                        else gridRefs.current.delete(folder.id)
                      }}
                      sx={{ flex: 1, minWidth: 0 }}
                    >
                      <FolderGrid
                        folder={folder}
                        isLocked={false}
                        sx={isNotFirst ? borderTopNone : undefined}
                        rowCount={maxRows}
                      />
                    </Box>

                    {/* Summary columns (PV Total, Total Claim, % Claim) */}
                    <Box sx={{ flexShrink: 0, width: 302 }}>
                      <SummaryGrid
                        folder={folder}
                        isLocked={false}
                        sx={isNotFirst ? borderTopNone : undefined}
                        rowCount={maxRows}
                      />
                    </Box>
                  </Box>
                </div>
              )
            })}
          </Box>
        </Box>

        {modal && activeSubfolder && activeFolder && (
          <SubfolderModal
            subfolder={activeSubfolder}
            folderName={activeFolder.name}
            copiedValue={copiedValue}
            onCopy={setCopiedValue}
            onSave={(rows) =>
              saveSubfolder(modal.folderId, modal.subfolderId, rows)
            }
            onClose={() => setModal(null)}
          />
        )}
      </Box>
    </div>
  )
}
