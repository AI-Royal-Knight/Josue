"use client"

import { useCallback, useMemo, useState, useEffect, useRef } from "react"
import Box from "@mui/material/Box"

import {
  DataGrid,
  type GridColDef,
  type GridColumnGroupingModel,
} from "@mui/x-data-grid"

import { Eye, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { agTableDataGridSx } from "@/lib/agtable-datagrid-sx"
import { colors } from "@/constants/colors"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

import { SubfolderModal } from "@/app/(dashboard)/labour-target/subfolder-modal"
import type {
  FolderType,
  ModalState,
  Row,
} from "@/app/(dashboard)/labour-target/types"
import { defaultRows, uid } from "@/app/(dashboard)/labour-target/utils"
import SelectSearch from "@/components/select-search"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import PdfViewerDialog from "@/components/common/pdf-viewer-dialog"
import { generateSimplePdf } from "@/lib/generate-pdf"
import { getWhiteCard } from "@/lib/api/monthly-application"

const ROWS_PER_FOLDER = 5
const ROW_HEIGHT = 42
// Each DataGrid has: column-group header row + column-name header row + data rows
// We measure this per-grid with a ResizeObserver; this is just the initial fallback.
const HEADER_FALLBACK = 98

const DEFAULT_FOLDERS: FolderType[] = [
  {
    id: "apartments",
    name: "APARTMENTS",
    subfolders: [
      { id: "electrical", name: "Electrical", rows: defaultRows() },
      { id: "plumbing", name: "Plumbing", rows: defaultRows() },
    ],
  },
  {
    id: "corridors",
    name: "CORRIDORS",
    subfolders: [{ id: "electrical", name: "Electrical", rows: defaultRows() }],
  },
]

function SummaryGrid({
  isLocked,
  sx,
  rowCount = ROWS_PER_FOLDER,
}: {
  isLocked: boolean
  sx?: object
  rowCount?: number
}) {
  const rows = useMemo(
    () =>
      Array.from({ length: rowCount }, (_, i) => ({
        id: i + 1,
        pj_total: "",
        total_claim: "",
        percent_claim: "",
      })),
    [rowCount]
  )

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "pj_total",
        headerName: "PJ Total",
        width: 100,
        editable: true,
        hideable: false,
      },
      {
        field: "total_claim",
        headerName: "Total Claim",
        width: 110,
        editable: true,
        hideable: false,
      },
      {
        field: "percent_claim",
        headerName: "% Claim",
        width: 90,
        editable: true,
        hideable: false,
      },
    ],
    []
  )

  // Dummy column group so SummaryGrid matches FolderGrid's 2-header-row height
  const columnGroupingModel: GridColumnGroupingModel = useMemo(
    () => [
      {
        groupId: "summary-group",
        headerName: "",
        children: [
          { field: "pj_total" },
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
      isCellEditable={() => !isLocked}
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
        "& .MuiDataGrid-cell--editing": {
          backgroundColor: "transparent !important",
          boxShadow: "none",
          padding: 0,
        },
        "& .MuiDataGrid-cell--editing .MuiInputBase-root": {
          backgroundColor: "transparent",
          color: fg,
          fontSize: "0.875rem",
          padding: "0 8px",
        },
        "& .MuiDataGrid-cell--editing .MuiInputBase-input": {
          color: fg,
          padding: 0,
        },
      }}
    />
  )
}

// Per-folder DataGrid (subfolder columns only — summary columns are in SummaryGrid)
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
          row[`${sub.id}_pv`] = subRow?.projectValue || (i === 0 ? sub.project_value?.toFixed(2) || "" : "")
          row[`${sub.id}_lt`] = subRow?.labourTarget || (i === 0 ? sub.labour_target?.toFixed(2) || "" : "")
        })
        return row
      }),
    [folder, rowCount]
  )

  const columns: GridColDef[] = useMemo(
    () =>
      folder.subfolders.flatMap((sub) => [
        {
          field: `${sub.id}_ws`,
          headerName: "Work Section",
          width: 120,
          editable: true,
        },
        {
          field: `${sub.id}_wa`,
          headerName: "Work Area",
          width: 120,
          editable: true,
        },
        {
          field: `${sub.id}_pv`,
          headerName: "Project Value",
          width: 120,
          editable: true,
        },
        {
          field: `${sub.id}_lt`,
          headerName: "Labour Target",
          width: 120,
          editable: true,
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
          { field: `${sub.id}_lt` },
        ],
      })),
    [folder]
  )

  const fg = colors.foreground ?? "#e2e8f0"

  return (
    <DataGrid
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
      isCellEditable={() => !isLocked}
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
        "& .MuiDataGrid-cell--editing": {
          backgroundColor: "transparent !important",
          boxShadow: "none",
          padding: 0,
        },
        "& .MuiDataGrid-cell--editing .MuiInputBase-root": {
          backgroundColor: "transparent",
          color: fg,
          fontSize: "0.875rem",
          padding: "0 8px",
        },
        "& .MuiDataGrid-cell--editing .MuiInputBase-input": {
          color: fg,
          padding: 0,
        },
      }}
    />
  )
}

export default function DynamicFolderTable({ projectId }: { projectId: string }) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleOpenModal = useCallback((role: string) => {
    setSelectedRole(role)
    setModalOpen(true)
  }, [])

  const [folders, setFolders] = useState<FolderType[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!projectId) {
      setFolders([])
      return
    }
    setLoading(true)
    getWhiteCard(projectId).then(data => {
      if (data.groups) {
        const mappedFolders: FolderType[] = data.groups.map((g: any) => ({
          id: g.groupId,
          name: g.headerName,
          subfolders: g.subfolders.map((sub: any) => ({
            id: sub.id,
            name: sub.name,
            rows: Array.isArray(sub.rows) ? sub.rows : [],
            project_value: sub.project_value,
            labour_target: sub.labour_target
          }))
        }))
        setFolders(mappedFolders)
      }
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [projectId])

  const [isLocked, setIsLocked] = useState(false)

  const [modal, setModal] = useState<ModalState>(null)
  const [copiedValue, setCopiedValue] = useState("")
  const [whiteCardDialogOpen, setWhiteCardDialogOpen] = useState(false)
  const [whiteCardPdfOpen, setWhiteCardPdfOpen] = useState(false)

  // ── Per-folder header height measurement
  const gridRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [headerHeights, setHeaderHeights] = useState<Record<string, number>>({})

  useEffect(() => {
    const observers: ResizeObserver[] = []
    folders.forEach((folder) => {
      const el = gridRefs.current.get(folder.id)
      if (!el) return
      const measure = () => {
        const header = el.querySelector(
          ".MuiDataGrid-columnHeaders"
        ) as HTMLElement | null
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

  const previousWhiteCard = {
    no: 1,
    dateRange: "15/03/2026 to 15/04/2026",
    value: "$34,000",
  }

  const getWhiteCardPdf = useCallback(() => {
    return generateSimplePdf({
      title: "WHITE CARD",
      subtitle: `Period ${previousWhiteCard.dateRange}`,
      headerFields: [
        { label: "No.", value: String(previousWhiteCard.no) },
        { label: "Date Range", value: previousWhiteCard.dateRange },
        { label: "Value", value: previousWhiteCard.value },
      ],
      detailFields: [
        { label: "Work Completed", value: previousWhiteCard.value },
      ],
      totalLabel: "Total",
      totalValue: previousWhiteCard.value,
      footer: "Previous month white card summary.",
    })
  }, [])

  const downloadWhiteCardDoc = useCallback(() => {
    const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>White Card</title></head>
  <body style="font-family: Arial, sans-serif; color: #111; padding: 24px;">
    <h1>WHITE CARD</h1>
    <p><strong>Period:</strong> ${previousWhiteCard.dateRange}</p>
    <hr style="border: none; border-top: 1px solid #ddd;" />
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px;">
      <thead>
        <tr>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px 4px;">No.</th>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px 4px;">Date Range</th>
          <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px 4px;">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0;">${previousWhiteCard.no}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0;">${previousWhiteCard.dateRange}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${previousWhiteCard.value}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding: 12px 4px; text-align: right;"><strong>Total</strong></td>
          <td style="padding: 12px 4px; text-align: right;"><strong>${previousWhiteCard.value}</strong></td>
        </tr>
      </tfoot>
    </table>
  </body>
</html>`
    const blob = new Blob([html], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `white-card-${previousWhiteCard.no}.doc`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [])

  const borderColor = colors.border ?? "rgba(255,255,255,0.12)"
  const sectionBg = colors.oddRowBackground ?? "rgba(255,255,255,0.04)"
  const fg = colors.foreground ?? "#e2e8f0"

  return (
    <div className="space-y-6">
      <div className="w-1/5 overflow-hidden rounded-lg border border-white/10 bg-[#0a1730]">
        <table className="text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-[#070f1e]/40">
              <th className="px-4 py-2.5 text-left font-medium text-slate-400">
                No.
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-slate-400">
                Date Range
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-slate-400">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/[0.04]"
              onClick={() => setWhiteCardDialogOpen(true)}
            >
              <td className="px-4 py-3 text-slate-200">
                {previousWhiteCard.no}
              </td>
              <td className="px-4 py-3 text-slate-200">
                {previousWhiteCard.dateRange}
              </td>
              <td className="px-4 py-3 text-right font-medium text-emerald-400">
                {previousWhiteCard.value}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Previous White Card Dialog ── */}
      <Dialog open={whiteCardDialogOpen} onOpenChange={setWhiteCardDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Previous White Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded border border-white/10 bg-slate-900 p-4 text-sm text-slate-200">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h4 className="text-base font-semibold text-white">
                    WHITE CARD
                  </h4>
                  <p className="text-xs text-slate-400">
                    Period {previousWhiteCard.dateRange}
                  </p>
                </div>
              </div>
              <div className="mb-3 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">No.</span>
                  <p className="font-medium text-slate-200">
                    {previousWhiteCard.no}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Date Range</span>
                  <p className="font-medium text-slate-200">
                    {previousWhiteCard.dateRange}
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-xs text-slate-500">Value</span>
                <p className="mt-0.5 text-lg font-semibold text-emerald-400">
                  {previousWhiteCard.value}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setWhiteCardPdfOpen(true)
                }}
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
        </DialogContent>
      </Dialog>

      <PdfViewerDialog
        open={whiteCardPdfOpen}
        onOpenChange={setWhiteCardPdfOpen}
        title={`White Card ${previousWhiteCard.dateRange}`}
        getPdf={getWhiteCardPdf}
      />

      <Box sx={{ display: "flex", overflow: "hidden" }}>
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Box sx={{ minWidth: 1200 }}>
            {folders.map((folder) => {
              const maxRows = Math.max(ROWS_PER_FOLDER, ...folder.subfolders.map((sub: any) => sub.rows?.length || 0))
              const hh = headerHeights[folder.id] ?? HEADER_FALLBACK
              const sectionH = hh + maxRows * ROW_HEIGHT
              const isNotFirst = folders.indexOf(folder) > 0
              const borderTopNone = {
                "& .MuiDataGrid-root, & .MuiDataGrid-main": {
                  borderTop: "none",
                },
              }

              return (
                <Box
                  key={folder.id}
                  sx={{ display: "flex", alignItems: "stretch" }}
                >
                  {/* Sidebar label — full height of header + data rows */}
                  <Box
                    title={
                      isLocked ? undefined : "Right-click to add subfolder"
                    }
                    sx={{
                      flexShrink: 0,
                      width: 48,
                      height: sectionH,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      writingMode: "vertical-lr",
                      transform: "rotate(180deg)",
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      userSelect: "none",
                      cursor: isLocked ? "default" : "context-menu",
                      color: fg,
                      backgroundColor: sectionBg,
                      border: `1px solid ${borderColor}`,
                      transition: "background-color 140ms",
                      "&:hover": isLocked
                        ? {}
                        : {
                          backgroundColor: "rgba(251,191,36,0.07)",
                        },
                    }}
                  >
                    {folder.name}
                  </Box>
                  {/* This folder's own DataGrid (subfolder columns) */}
                  <Box
                    ref={(el: HTMLDivElement | null) => {
                      if (el) gridRefs.current.set(folder.id, el)
                      else gridRefs.current.delete(folder.id)
                    }}
                    sx={{ flex: 1, minWidth: 0 }}
                  >
                    <FolderGrid
                      folder={folder}
                      isLocked={isLocked}
                      sx={isNotFirst ? borderTopNone : undefined}
                      rowCount={maxRows}
                    />
                  </Box>
                  {/* Summary columns (PJ Total, Total Claim, % Claim) — always right-aligned */}
                  <Box sx={{ flexShrink: 0, width: 302 }}>
                    <SummaryGrid
                      isLocked={isLocked}
                      sx={isNotFirst ? borderTopNone : undefined}
                      rowCount={maxRows}
                    />
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>

        {/* ── Subfolder edit modal  */}
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
