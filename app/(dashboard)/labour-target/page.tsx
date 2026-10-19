"use client"

import { useCallback, useMemo, useState, useEffect, useRef } from "react"
import Box from "@mui/material/Box"

import {
  DataGrid,
  type GridColDef,
  type GridColumnGroupingModel,
} from "@mui/x-data-grid"

import { FolderPlus, UserPlus, Lock, Download, Loader2, Save, Users } from "lucide-react"
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
import { defaultRows } from "@/app/(dashboard)/labour-target/utils"
import { AssignFolderModal } from "./assign-folder-modal"
import { SubfolderAssignment } from "@/lib/api/project-admin"
import { getContractsManagerProjects, updateSubfolderRows, CMProject } from "@/lib/api/contracts-manager"
import { Button as UiButton } from "@/components/ui/button"
import { toast } from "sonner"
import SelectSearch from "@/components/select-search"

const ROWS_PER_FOLDER = 5
const ROW_HEIGHT = 42
const HEADER_FALLBACK = 98

// Per-folder DataGrid without Project Value (Requirement 1 & 6)
function FolderGrid({
  folder,
  isLocked,
  onAssignSubfolder,
  onChange,
  sx,
}: {
  folder: FolderType
  isLocked: boolean
  onAssignSubfolder?: (subfolderId: string) => void
  onChange?: (updatedFolder: FolderType) => void
  sx?: object
}) {
  const rows = useMemo(() => {
    const maxRows = Math.max(
      ROWS_PER_FOLDER,
      ...folder.subfolders.map((sub) => sub.rows?.length || 0)
    )

    return Array.from({ length: maxRows }, (_, i) => {
      const row: Record<string, unknown> = { id: i + 1 }
      let rowLtTotal = 0
      let hasLt = false

      folder.subfolders.forEach((sub) => {
        const subRow = sub.rows[i] || { workSection: "", workArea: "", labourTarget: "" }
        row[`${sub.id}_ws`] = subRow.workSection || ""
        row[`${sub.id}_wa`] = subRow.workArea || ""
        row[`${sub.id}_lt`] = subRow.labourTarget || ""

        // Calculate Labour Target Total across all subfolders on this row (Requirement 6)
        if (subRow.labourTarget !== undefined && subRow.labourTarget !== null && subRow.labourTarget !== "") {
          const parsed = parseFloat(String(subRow.labourTarget).replace(/[^0-9.-]/g, ""))
          if (!isNaN(parsed)) {
            rowLtTotal += parsed
            hasLt = true
          }
        }
      })

      // Row LT Total
      row["lt_total"] = hasLt
        ? `£${rowLtTotal.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "£0.00"

      return row
    })
  }, [folder])

  const handleProcessRowUpdate = useCallback(
    (newRow: Record<string, any>) => {
      const updatedFolder = { ...folder }
      updatedFolder.subfolders = folder.subfolders.map((sub) => {
        const rowIndex = (newRow.id as number) - 1
        const newSubRows = [...sub.rows]

        // Ensure newSubRows is large enough
        while (newSubRows.length <= rowIndex) {
          newSubRows.push({
            id: String(newSubRows.length + 1),
            workSection: "",
            workArea: "",
            projectValue: "",
            labourTarget: "",
          })
        }

        newSubRows[rowIndex] = {
          ...newSubRows[rowIndex],
          workSection: newRow[`${sub.id}_ws`] || "",
          workArea: newRow[`${sub.id}_wa`] || "",
          labourTarget: newRow[`${sub.id}_lt`] || "",
        }
        return { ...sub, rows: newSubRows }
      })
      onChange?.(updatedFolder)
      return newRow
    },
    [folder, onChange]
  )

  const columns: GridColDef[] = useMemo(
    () => [
      // Subfolder columns: Strictly Work Section, Work Area, Labour Target (No Project Value - Requirement 1)
      ...folder.subfolders.flatMap((sub) => {
        const wsField = `${sub.id}_ws`
        return [
          {
            field: wsField,
            headerName: "Work Section",
            width: 150,
            editable: !folder.is_management,
            renderHeader: () => (
              <div className="flex w-full items-center justify-center gap-1.5">
                <span className="truncate text-[12px] text-[#94a3b8] font-semibold">Work Section</span>
                {/* No option to assign employees for management folders (Requirement 2 & 4) */}
                {!folder.is_management && (
                  <button
                    type="button"
                    title={`Assign app user to ${sub.name}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onAssignSubfolder?.(sub.id)
                    }}
                    className="flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <UserPlus size={14} className="text-amber-500" />
                  </button>
                )}
              </div>
            ),
          },
          {
            field: `${sub.id}_wa`,
            headerName: "Work Area",
            width: 130,
            editable: !folder.is_management,
          },
          {
            field: `${sub.id}_lt`,
            headerName: "Labour Target",
            width: 140,
            editable: !folder.is_management,
          },
        ]
      }),
      // Summary column: LT TOTAL on that row across all subfolders (Requirement 6)
      {
        field: "lt_total",
        headerName: "LT TOTAL",
        width: 130,
        editable: false,
        headerAlign: "center",
        align: "center",
        renderCell: (params: any) => (
          <span className="font-semibold text-emerald-400">
            {params.value || "£0.00"}
          </span>
        ),
      },
    ],
    [folder, onAssignSubfolder]
  )

  const columnGroupingModel: GridColumnGroupingModel = useMemo(
    () =>
      folder.subfolders.map((sub) => ({
        groupId: sub.id,
        headerName: sub.name.toUpperCase(),
        children: [
          { field: `${sub.id}_ws` },
          { field: `${sub.id}_wa` },
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
      processRowUpdate={handleProcessRowUpdate}
      isCellEditable={() => !isLocked && !folder.is_management}
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

export default function DynamicFolderTable() {
  const [projects, setProjects] = useState<CMProject[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [assignModal, setAssignModal] = useState<{ folderId: string; subfolderId: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    getContractsManagerProjects()
      .then((data) => {
        setProjects(data)
        if (data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data[0].id)
        }
      })
      .catch(() => {
        toast.error("Failed to load projects")
      })
      .finally(() => setLoading(false))
  }, [])

  // Assignment handler supporting both Main Folder and Subfolder assignment (Requirement 4)
  const handleAssignSubfolder = async (
    folderId: string,
    subfolderId: string | null,
    assignments: SubfolderAssignment[]
  ) => {
    try {
      const project = projects.find((p) => p.id === selectedProjectId)
      const folder = project?.folders.find((f) => f.id === folderId)
      if (!folder) return

      if (folder.is_management) {
        toast.error("Management folders cannot be assigned. They are locked for project management users.")
        return
      }

      if (subfolderId === null) {
        // Main folder assignment: Applies assignments to all subfolders in this folder
        const updatePromises = folder.subfolders.map((sub) =>
          updateSubfolderRows(sub.id, sub.rows, undefined, undefined, assignments)
        )
        await Promise.all(updatePromises)
        toast.success(`Assigned app users to entire folder "${folder.name}" (all subfolders)`)

        setProjects((prev) =>
          prev.map((p) => {
            if (p.id !== selectedProjectId) return p
            return {
              ...p,
              folders: p.folders.map((f) => {
                if (f.id !== folderId) return f
                return {
                  ...f,
                  subfolders: f.subfolders.map((sf) => ({ ...sf, assignments })),
                }
              }),
            }
          })
        )
      } else {
        // Subfolder assignment: Applies only to this specific subfolder
        const subfolder = folder.subfolders.find((s) => s.id === subfolderId)
        if (!subfolder) return

        await updateSubfolderRows(subfolderId, subfolder.rows, undefined, undefined, assignments)
        toast.success(`Assigned app users to subfolder "${subfolder.name}"`)

        setProjects((prev) =>
          prev.map((p) => {
            if (p.id !== selectedProjectId) return p
            return {
              ...p,
              folders: p.folders.map((f) => {
                if (f.id !== folderId) return f
                return {
                  ...f,
                  subfolders: f.subfolders.map((sf) => (sf.id === subfolderId ? { ...sf, assignments } : sf)),
                }
              }),
            }
          })
        )
      }
    } catch {
      toast.error("Failed to update assignments")
    }
  }

  const activeProject = projects.find((p) => p.id === selectedProjectId)
  const folders = activeProject?.folders || []

  // Ensure rows exist for all subfolders (using defaultRows if empty)
  const processedFolders = useMemo(() => {
    return folders.map((f) => ({
      ...f,
      subfolders: f.subfolders.map((sf) => ({
        ...sf,
        rows: sf.rows && sf.rows.length > 0 ? sf.rows : defaultRows(),
      })),
    }))
  }, [folders])

  const [isLocked] = useState(false)
  const [modal, setModal] = useState<ModalState>(null)
  const [copiedValue, setCopiedValue] = useState("")

  // Header height measurement for sticky vertical sidebar
  const gridRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [headerHeights, setHeaderHeights] = useState<Record<string, number>>({})

  useEffect(() => {
    const observers: ResizeObserver[] = []
    processedFolders.forEach((folder) => {
      const el = gridRefs.current.get(folder.id)
      if (!el) return
      const measure = () => {
        const header = el.querySelector(".MuiDataGrid-columnHeaders") as HTMLElement | null
        if (header) {
          setHeaderHeights((prev) =>
            prev[folder.id] === header.offsetHeight ? prev : { ...prev, [folder.id]: header.offsetHeight }
          )
        }
      }
      measure()
      const obs = new ResizeObserver(measure)
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [processedFolders])

  const saveSubfolder = useCallback(
    async (folderId: string, subfolderId: string | null, rows: Row[]) => {
      if (!subfolderId) return
      try {
        await updateSubfolderRows(subfolderId, rows)
        toast.success("Subfolder updated successfully.")

        setProjects((prev) =>
          prev.map((p) => {
            if (p.id !== selectedProjectId) return p
            return {
              ...p,
              folders: p.folders.map((f) => {
                if (f.id !== folderId) return f
                return {
                  ...f,
                  subfolders: f.subfolders.map((sf) => (sf.id === subfolderId ? { ...sf, rows } : sf)),
                }
              }),
            }
          })
        )
      } catch {
        toast.error("Failed to save subfolder.")
      }
      setModal(null)
    },
    [selectedProjectId]
  )

  // Export Labour Target table to Excel (.xlsx) (Requirement 7)
  const handleExportTable = async () => {
    if (!activeProject || processedFolders.length === 0) {
      toast.error("No project data available to export")
      return
    }

    try {
      setIsExporting(true)
      const ExcelJS = (await import("exceljs")).default
      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet("Labour Target")

      // Title Banner
      const titleRow = sheet.addRow([`${activeProject.project_name} - Labour Target`])
      titleRow.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } }
      titleRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" },
      }
      titleRow.height = 30
      sheet.mergeCells("A1:F1")
      titleRow.alignment = { vertical: "middle", horizontal: "left" }

      // Subtitle
      const dateRow = sheet.addRow([`Exported on: ${new Date().toLocaleDateString("en-GB")}`])
      dateRow.font = { italic: true, size: 10, color: { argb: "FF94A3B8" } }
      sheet.mergeCells("A2:F2")
      dateRow.height = 20

      sheet.addRow([]) // Spacer

      // Column Headers (No Project Value - Requirement 1)
      const headers = [
        "Folder",
        "Subfolder",
        "Work Section",
        "Work Area",
        "Labour Target",
        "LT Total (Row)",
      ]
      const headerRow = sheet.addRow(headers)
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 }
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E293B" },
      }
      headerRow.alignment = { vertical: "middle", horizontal: "center" }
      headerRow.height = 24

      let grandLtTotal = 0

      // Rows for each folder and subfolder
      processedFolders.forEach((folder) => {
        const maxRows = folder.subfolders.reduce((max, s) => Math.max(max, s.rows?.length || 0), 0)
        for (let i = 0; i < maxRows; i++) {
          let rowLtTotal = 0
          folder.subfolders.forEach((sub) => {
            const subRow = sub.rows[i]
            if (subRow?.labourTarget) {
              const val = parseFloat(String(subRow.labourTarget).replace(/[^0-9.-]/g, ""))
              if (!isNaN(val)) rowLtTotal += val
            }
          })
          grandLtTotal += rowLtTotal

          folder.subfolders.forEach((sub, subIdx) => {
            const subRow = sub.rows[i] || { workSection: "", workArea: "", labourTarget: "" }
            const targetVal = subRow.labourTarget
              ? parseFloat(String(subRow.labourTarget).replace(/[^0-9.-]/g, ""))
              : 0

            const r = sheet.addRow([
              subIdx === 0 ? folder.name : "",
              sub.name,
              subRow.workSection || "",
              subRow.workArea || "",
              targetVal || "",
              subIdx === 0 && rowLtTotal > 0 ? rowLtTotal : "",
            ])
            r.height = 20
          })
        }
      })

      // Grand Total Row
      sheet.addRow([])
      const totalRow = sheet.addRow(["GRAND TOTAL", "", "", "", "", grandLtTotal])
      totalRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } }
      totalRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF059669" },
      }
      totalRow.height = 26

      // Set widths & styles
      sheet.columns.forEach((col, idx) => {
        col.width = idx === 0 ? 22 : idx === 1 ? 18 : idx === 2 ? 26 : idx === 3 ? 18 : 16
      })
      sheet.getColumn(5).numFmt = "£#,##0.00"
      sheet.getColumn(6).numFmt = "£#,##0.00"

      // Cell borders
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 3) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin", color: { argb: "FFE2E8F0" } },
              left: { style: "thin", color: { argb: "FFE2E8F0" } },
              bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
              right: { style: "thin", color: { argb: "FFE2E8F0" } },
            }
          })
        }
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      const dateStr = new Date().toISOString().slice(0, 10)
      const safeProjectName = activeProject.project_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

      anchor.href = url
      anchor.download = `labour-target-${safeProjectName}-${dateStr}.xlsx`
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success("Labour Target exported successfully")
    } catch (err) {
      console.error(err)
      toast.error("Failed to export Labour Target")
    } finally {
      setIsExporting(false)
    }
  }

  const activeModalFolder = modal ? processedFolders.find((f) => f.id === modal.folderId) : null
  const activeSubfolder = activeModalFolder?.subfolders.find((sf) => sf.id === modal?.subfolderId)

  const borderColor = colors.border ?? "rgba(255,255,255,0.12)"
  const sectionBg = colors.oddRowBackground ?? "rgba(255,255,255,0.04)"
  const fg = colors.foreground ?? "#e2e8f0"

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Labour Target</h1>

      <div className="flex w-full items-end justify-between">
        <SelectSearch
          options={projects.map((p) => ({ label: p.project_name, value: p.id }))}
          value={selectedProjectId}
          onChange={setSelectedProjectId}
          placeholder="Select a project"
          label="Project"
          searchPlaceholder="Search projects..."
          emptyMessage="No projects found."
          className="w-[240px]"
        />
        <div className="flex gap-2">
          <UiButton
            variant="outline"
            onClick={async () => {
              const activeProj = projects.find((p) => p.id === selectedProjectId)
              if (!activeProj) return

              try {
                const promises = activeProj.folders.flatMap((f) =>
                  f.subfolders.map((sub) => updateSubfolderRows(sub.id, sub.rows))
                )
                await Promise.all(promises)
                toast.success("Progress saved successfully")
              } catch {
                toast.error("Failed to save progress")
              }
            }}
            className="border-[#31425f] bg-transparent text-[#cbd5e1] hover:bg-white/5 hover:text-white"
          >
            <Save size={16} className="mr-2" />
            Save progress
          </UiButton>

          {/* Working Export Table Button (Requirement 7) */}
          <UiButton
            variant="outline"
            onClick={handleExportTable}
            disabled={isExporting || loading || processedFolders.length === 0}
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
          >
            {isExporting ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Download size={16} className="mr-2 text-emerald-400" />
            )}
            Export Table
          </UiButton>
        </div>
      </div>

      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Box sx={{ minWidth: 1200, display: "flex", flexDirection: "column", gap: 3 }}>
            {processedFolders.map((folder, index) => {
              const hh = headerHeights[folder.id] ?? HEADER_FALLBACK
              const sectionH = hh + ROWS_PER_FOLDER * ROW_HEIGHT

              return (
                <div key={folder.id} className="flex flex-col rounded-lg border border-white/10 overflow-hidden bg-slate-900/40">
                  {/* ── Main Folder Header Banner (Requirement 2 & 4) ── */}
                  <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white tracking-wide uppercase">
                        {folder.name}
                      </span>
                      {folder.is_management ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          <Lock size={12} /> Management Folder (Locked for Management Users)
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          {folder.subfolders.length} Subfolder{folder.subfolders.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Main Folder Assignment Button for Non-Management Folders (Requirement 2 & 4) */}
                    {!folder.is_management ? (
                      <UiButton
                        size="sm"
                        variant="outline"
                        onClick={() => setAssignModal({ folderId: folder.id, subfolderId: null })}
                        className="h-7 text-xs border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200"
                      >
                        <Users size={13} className="mr-1.5 text-amber-400" />
                        Assign App Users to Folder (All Subfolders)
                      </UiButton>
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        Assignments locked
                      </span>
                    )}
                  </div>

                  {/* ── Folder Body: Sidebar Label + DataGrid ── */}
                  <Box sx={{ display: "flex", alignItems: "stretch" }}>
                    {/* Sidebar label */}
                    <ContextMenu>
                      <ContextMenuTrigger disabled={isLocked || folder.is_management} asChild>
                        <Box
                          title={
                            folder.is_management
                              ? "Management folder is locked"
                              : "Right-click to assign app users"
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
                            cursor: folder.is_management ? "default" : "context-menu",
                            color: fg,
                            backgroundColor: sectionBg,
                            borderRight: `1px solid ${borderColor}`,
                            transition: "background-color 140ms",
                            "&:hover": folder.is_management
                              ? {}
                              : {
                                  backgroundColor: "rgba(251,191,36,0.07)",
                                },
                          }}
                        >
                          {folder.name}
                        </Box>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-64 border-white/10 bg-slate-900">
                        <div className="px-2 py-1 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                          {folder.name}
                        </div>
                        {folder.is_management ? (
                          <ContextMenuItem disabled className="text-slate-400 text-xs">
                            <Lock size={13} className="mr-2 text-blue-400" />
                            Locked for Management Users
                          </ContextMenuItem>
                        ) : (
                          <>
                            <ContextMenuItem
                              className="gap-2.5 text-slate-200 focus:bg-white/[0.08] focus:text-white"
                              onSelect={() => setAssignModal({ folderId: folder.id, subfolderId: null })}
                            >
                              <Users size={14} className="shrink-0 text-amber-400" />
                              Assign App Users to Entire Folder
                            </ContextMenuItem>
                            {folder.subfolders.map((sub) => (
                              <ContextMenuItem
                                key={sub.id}
                                className="gap-2.5 text-slate-300 pl-6 text-xs focus:bg-white/[0.08] focus:text-white"
                                onSelect={() => setAssignModal({ folderId: folder.id, subfolderId: sub.id })}
                              >
                                <FolderPlus size={12} className="shrink-0 text-amber-400/80" />
                                Assign to {sub.name}
                              </ContextMenuItem>
                            ))}
                          </>
                        )}
                      </ContextMenuContent>
                    </ContextMenu>

                    {/* DataGrid */}
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
                        onChange={(updatedFolder) => {
                          setProjects((prev) =>
                            prev.map((p) => {
                              if (p.id !== selectedProjectId) return p
                              return {
                                ...p,
                                folders: p.folders.map((f) => (f.id === updatedFolder.id ? updatedFolder : f)),
                              }
                            })
                          )
                        }}
                        onAssignSubfolder={(subId) => setAssignModal({ folderId: folder.id, subfolderId: subId })}
                        sx={
                          index > 0
                            ? {
                                "& .MuiDataGrid-root, & .MuiDataGrid-main": {
                                  borderTop: "none",
                                },
                              }
                            : undefined
                        }
                      />
                    </Box>
                  </Box>
                </div>
              )
            })}
          </Box>
        </Box>

        {/* ── Subfolder edit modal ── */}
        {modal && activeSubfolder && activeModalFolder && (
          <SubfolderModal
            subfolder={activeSubfolder}
            folderName={activeModalFolder.name}
            copiedValue={copiedValue}
            onCopy={setCopiedValue}
            onSave={(rows) => saveSubfolder(modal.folderId, modal.subfolderId, rows)}
            onClose={() => setModal(null)}
          />
        )}

        {/* ── Assign Folder / Subfolder Modal (Requirements 3, 4, 5) ── */}
        {(() => {
          if (!assignModal) return null
          const activeAssignFolder = processedFolders.find((f) => f.id === assignModal.folderId)
          if (!activeAssignFolder || activeAssignFolder.is_management) return null

          if (assignModal.subfolderId === null) {
            // Main Folder Assignment
            const existingAssignments = activeAssignFolder.subfolders[0]?.assignments || []
            return (
              <AssignFolderModal
                open={true}
                onOpenChange={(open) => !open && setAssignModal(null)}
                projectId={selectedProjectId}
                targetName={`${activeAssignFolder.name} (Entire Folder - All Subfolders)`}
                assignments={existingAssignments}
                onAssign={(assignments) => handleAssignSubfolder(assignModal.folderId, null, assignments)}
              />
            )
          } else {
            // Specific Subfolder Assignment
            const activeAssignSubfolder = activeAssignFolder.subfolders.find((sf) => sf.id === assignModal.subfolderId)
            if (!activeAssignSubfolder) return null

            return (
              <AssignFolderModal
                open={true}
                onOpenChange={(open) => !open && setAssignModal(null)}
                projectId={selectedProjectId}
                targetName={`${activeAssignFolder.name} > ${activeAssignSubfolder.name}`}
                assignments={activeAssignSubfolder.assignments || []}
                onAssign={(assignments) =>
                  handleAssignSubfolder(assignModal.folderId, assignModal.subfolderId, assignments)
                }
              />
            )
          }
        })()}
      </Box>
    </div>
  )
}
