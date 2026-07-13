"use client"

import { useCallback, useMemo, useState, useEffect, useRef } from "react"
import Box from "@mui/material/Box"

import {
  DataGrid,
  type GridColDef,
  type GridColumnGroupingModel,
} from "@mui/x-data-grid"

import { FolderPlus, UserPlus } from "lucide-react"
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
import { AssignFolderModal } from "./assign-folder-modal"
import { SubfolderAssignment } from "@/lib/api/project-admin"
import { getContractsManagerProjects, updateSubfolderRows, CMProject } from "@/lib/api/contracts-manager"
import { Save } from "lucide-react"
import { Button as UiButton } from "@/components/ui/button"
import { toast } from "sonner"
import SelectSearch from "@/components/select-search"
import { ExportCsvButton } from "@/components/common/export-csv-button"

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

// Per-folder DataGrid
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
  const rows = useMemo(
    () =>
      folder.subfolders.flatMap((sub) => sub.rows).length > 0
        ? folder.subfolders[0].rows.map((item, i) => {
          const row: Record<string, unknown> = { id: i + 1 }
          folder.subfolders.forEach((sub) => {
            const subRow = sub.rows[i] || {}
            row[`${sub.id}_ws`] = subRow.workSection || ""
            row[`${sub.id}_wa`] = subRow.workArea || ""
            row[`${sub.id}_pv`] = subRow.projectValue || ""
            row[`${sub.id}_lt`] = subRow.labourTarget || ""
          })
          row["lt_total"] = ""
          row["total_claim"] = ""
          row["percent_claim"] = ""
          return row
        })
        : Array.from({ length: ROWS_PER_FOLDER }, (_, i) => {
          const row: Record<string, unknown> = { id: i + 1 }
          folder.subfolders.forEach((sub) => {
            row[`${sub.id}_ws`] = ""
            row[`${sub.id}_wa`] = ""
            row[`${sub.id}_pv`] = ""
            row[`${sub.id}_lt`] = ""
          })
          row["lt_total"] = ""
          row["total_claim"] = ""
          row["percent_claim"] = ""
          return row
        }),
    [folder]
  )

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
          projectValue: newRow[`${sub.id}_pv`] || "",
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
      ...folder.subfolders.flatMap((sub) => {
        const wsField = `${sub.id}_ws`
        return [
          {
            field: wsField,
            headerName: "Work Section",
            width: 145,
            editable: true,
            renderHeader: (params: any) => (
              <div className="flex w-full items-center justify-center gap-1.5">
                <span className="truncate text-[12px] text-[#94a3b8] font-semibold">Work Section</span>
                <button
                  type="button"
                  title={`Assign user to ${sub.name}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onAssignSubfolder?.(sub.id)
                  }}
                  className="flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <UserPlus size={14} className="text-amber-500" />
                </button>
              </div>
            ),
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
            width: 140,
            editable: true,
          },
          {
            field: `${sub.id}_lt`,
            headerName: "Labour Target",
            width: 140,
            editable: true,
          },
        ]
      }),
      // Summary columns (always on the right side)
      {
        field: "lt_total",
        headerName: "LT TOTAL",
        width: 100,
        editable: true,
      },
      {
        field: "total_claim",
        headerName: "TOTAL CLAIM",
        width: 110,
        editable: true,
      },
      {
        field: "percent_claim",
        headerName: "% CLAIM",
        width: 90,
        editable: true,
      },
    ],
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
      processRowUpdate={handleProcessRowUpdate}
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

export default function DynamicFolderTable() {
  const [projects, setProjects] = useState<CMProject[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [assignModal, setAssignModal] = useState<{ folderId: string; subfolderId: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getContractsManagerProjects()
      .then((data) => {
        setProjects(data)
        if (data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data[0].id)
        }
      })
      .catch((err) => {
        toast.error("Failed to load projects")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleAssignSubfolder = async (folderId: string, subfolderId: string, assignments: SubfolderAssignment[]) => {
    try {
      const project = projects.find(p => p.id === selectedProjectId);
      const folder = project?.folders.find(f => f.id === folderId);
      const subfolder = folder?.subfolders.find(s => s.id === subfolderId);
      if (!subfolder) return;
      
      await updateSubfolderRows(subfolderId, subfolder.rows, undefined, undefined, assignments);
      toast.success("Assignments updated successfully");
      
      setProjects(prev => prev.map(p => {
        if (p.id !== selectedProjectId) return p;
        return {
          ...p,
          folders: p.folders.map(f => {
            if (f.id !== folderId) return f;
            return {
              ...f,
              subfolders: f.subfolders.map(sf => sf.id === subfolderId ? { ...sf, assignments } : sf)
            };
          })
        };
      }));
    } catch (err) {
      toast.error("Failed to update assignments");
    }
  }

  const activeProject = projects.find((p) => p.id === selectedProjectId)
  const folders = activeProject?.folders || []

  // Ensure rows exist for all subfolders (using defaultRows if empty)
  const processedFolders = useMemo(() => {
    return folders.map(f => ({
      ...f,
      subfolders: f.subfolders.map(sf => ({
        ...sf,
        rows: sf.rows && sf.rows.length > 0 ? sf.rows : defaultRows()
      }))
    }))
  }, [folders])

  const [isLocked, setIsLocked] = useState(false)

  const [modal, setModal] = useState<ModalState>(null)
  const [copiedValue, setCopiedValue] = useState("")



  // ── Per-folder header height measurement
  // We need each folder's DataGrid header height so the sidebar label is
  // offset correctly for every grid independently.
  const gridRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [headerHeights, setHeaderHeights] = useState<Record<string, number>>({})

  useEffect(() => {
    const observers: ResizeObserver[] = []
    processedFolders.forEach((folder) => {
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
  }, [processedFolders])

  const saveSubfolder = useCallback(
    async (folderId: string, subfolderId: string | null, rows: Row[]) => {
      if (!subfolderId) return;
      try {
        await updateSubfolderRows(subfolderId, rows);
        toast.success("Subfolder updated successfully.");

        // Update local state by re-fetching or updating memory
        setProjects(prev => prev.map(p => {
          if (p.id !== selectedProjectId) return p;
          return {
            ...p,
            folders: p.folders.map(f => {
              if (f.id !== folderId) return f;
              return {
                ...f,
                subfolders: f.subfolders.map(sf => sf.id === subfolderId ? { ...sf, rows } : sf)
              };
            })
          };
        }));
      } catch (err) {
        toast.error("Failed to save subfolder.");
      }
      setModal(null)
    },
    [selectedProjectId]
  )

  const activeModalFolder = modal
    ? processedFolders.find((f) => f.id === modal.folderId)
    : null
  const activeSubfolder = activeModalFolder?.subfolders.find(
    (sf) => sf.id === modal?.subfolderId
  )

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
              const activeProject = projects.find(p => p.id === selectedProjectId)
              if (!activeProject) return
              
              try {
                const promises = activeProject.folders.flatMap(f => 
                  f.subfolders.map(sub => 
                    updateSubfolderRows(sub.id, sub.rows)
                  )
                )
                await Promise.all(promises)
                toast.success("Progress saved successfully")
              } catch (e) {
                toast.error("Failed to save progress")
              }
            }}
            className="border-[#31425f] bg-transparent text-[#cbd5e1] hover:bg-white/5 hover:text-white"
          >
            <Save size={16} className="mr-2" />
            Save progress
          </UiButton>
          <ExportCsvButton
            rows={[]}
            columns={[]}
            className="border-[#31425f] bg-transparent text-[#cbd5e1] hover:bg-white/5 hover:text-white"
          />
        </div>
      </div>

      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {/* ── One row per folder: sidebar label + its own DataGrid  */}
          <Box sx={{ minWidth: 1200 }}>
            {processedFolders.map((folder, index) => {
              const hh = headerHeights[folder.id] ?? HEADER_FALLBACK
              const sectionH = hh + ROWS_PER_FOLDER * ROW_HEIGHT

              return (
                <Box
                  key={folder.id}
                  sx={{ display: "flex", alignItems: "stretch" }}
                >
                  {/* Sidebar label — full height of header + data rows */}
                  <ContextMenu>
                    <ContextMenuTrigger disabled={isLocked} asChild>
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
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-52 border-white/10 bg-slate-900">
                      <div className="px-2 py-1 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                        {folder.name}
                      </div>
                      <ContextMenuItem
                        className="gap-2.5 text-slate-200 focus:bg-white/[0.08] focus:text-white"
                        onSelect={() => {
                          const firstSub = folder.subfolders[0]
                          if(firstSub) setAssignModal({ folderId: folder.id, subfolderId: firstSub.id })
                        }}
                      >
                        <FolderPlus
                          size={14}
                          className="shrink-0 text-amber-400"
                        />
                        Assign User to Subfolder
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>

                  {/* This folder's own DataGrid */}
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
                        setProjects(prev => prev.map(p => {
                          if (p.id !== selectedProjectId) return p;
                          return {
                            ...p,
                            folders: p.folders.map(f => f.id === updatedFolder.id ? updatedFolder : f)
                          }
                        }))
                      }}
                      onAssignSubfolder={(subId) => setAssignModal({ folderId: folder.id, subfolderId: subId })}
                      // Remove top border on grids after the first to avoid double borders
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
              )
            })}
          </Box>
        </Box>

        {/* ── Subfolder edit modal  */}
        {modal && activeSubfolder && activeModalFolder && (
          <SubfolderModal
            subfolder={activeSubfolder}
            folderName={activeModalFolder.name}
            copiedValue={copiedValue}
            onCopy={setCopiedValue}
            onSave={(rows) =>
              saveSubfolder(modal.folderId, modal.subfolderId, rows)
            }
            onClose={() => setModal(null)}
          />
        )}

        {(() => {
          const activeAssignFolder = assignModal ? processedFolders.find(f => f.id === assignModal.folderId) : null;
          const activeAssignSubfolder = activeAssignFolder?.subfolders.find(sf => sf.id === assignModal?.subfolderId);

          return assignModal && activeAssignFolder && activeAssignSubfolder ? (
            <AssignFolderModal
              open={!!assignModal}
              onOpenChange={(open) => !open && setAssignModal(null)}
              projectId={selectedProjectId}
              targetName={`${activeAssignFolder.name} > ${activeAssignSubfolder.name}`}
              assignments={activeAssignSubfolder.assignments || []}
              onAssign={(assignments) => handleAssignSubfolder(assignModal.folderId, assignModal.subfolderId!, assignments)}
            />
          ) : null;
        })()}
      </Box>
    </div>
  )
}
