"use client"

import { useCallback, useMemo, useState, useEffect, useRef } from "react"
import Box from "@mui/material/Box"

import {
  DataGrid,
  type GridColDef,
  type GridColumnGroupingModel,
} from "@mui/x-data-grid"

import { FolderPlus } from "lucide-react"
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
import { AssignUserModal } from "../assign-management/_components/assign-user-modal"
import AssignUsersDialog from "../variations/_components/AssignUsersDialog"
import { initialAssignments } from "../assign-management/page"
import SelectSearch from "@/components/select-search"

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
  sx,
}: {
  folder: FolderType
  isLocked: boolean
  sx?: object
}) {
  const rows = useMemo(
    () =>
      Array.from({ length: ROWS_PER_FOLDER }, (_, i) => {
        const row: Record<string, unknown> = { id: i + 1 }
        folder.subfolders.forEach((sub) => {
          row[`${sub.id}_ws`] = ""
          row[`${sub.id}_wa`] = ""
          row[`${sub.id}_pv`] = ""
          row[`${sub.id}_lt`] = ""
        })
        return row
      }),
    [folder]
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

export default function DynamicFolderTable() {
  const storageKey = "tresta:labour-target"
  const lockKey = `${storageKey}:locked`

  const [assignments, setAssignments] = useState(initialAssignments)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleOpenModal = useCallback((role: string) => {
    setSelectedRole(role)
    setModalOpen(true)
  }, [])

  const [folders, setFolders] = useState<FolderType[]>(() => {
    if (typeof window === "undefined") return DEFAULT_FOLDERS
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) return DEFAULT_FOLDERS
      const parsed = JSON.parse(raw) as unknown
      return Array.isArray(parsed) ? (parsed as FolderType[]) : DEFAULT_FOLDERS
    } catch {
      return DEFAULT_FOLDERS
    }
  })

  const [isLocked, setIsLocked] = useState(() => {
    if (typeof window === "undefined") return false
    try {
      return window.localStorage.getItem(lockKey) === "true"
    } catch {
      return false
    }
  })

  const [modal, setModal] = useState<ModalState>(null)
  const [copiedValue, setCopiedValue] = useState("")

  const handleUpdateUsers = (
    updatedUsers: Array<{ id: string; name: string; checked: boolean }>
  ) => {
    if (selectedRole) {
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.role === selectedRole
            ? { ...assignment, users: updatedUsers }
            : assignment
        )
      )
    }
  }

  const currentAssignment = assignments.find((a) => a.role === selectedRole)

  // ── Per-folder header height measurement
  // We need each folder's DataGrid header height so the sidebar label is
  // offset correctly for every grid independently.
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

  const borderColor = colors.border ?? "rgba(255,255,255,0.12)"
  const sectionBg = colors.oddRowBackground ?? "rgba(255,255,255,0.04)"
  const fg = colors.foreground ?? "#e2e8f0"

  return (
    <div className="space-y-6 p-4">
      <h1>Labour Target</h1>

      <div className="w-full max-w-sm">
        <SelectSearch
          options={folders.map((f) => ({ label: f.name, value: f.id }))}
          //   value={selectedFolder}
          //   onChange={setSelectedFolder}
          placeholder="Select a folder"
          label="Folder"
          searchPlaceholder="Search folders..."
          emptyMessage="No folders found."
        />
      </div>

      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {/* ── One row per folder: sidebar label + its own DataGrid  */}
          <Box sx={{ minWidth: 1200 }}>
            {folders.map((folder) => {
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
                        onSelect={() =>
                          setModal({
                            folderId: folder.id,
                            subfolderId: null,
                          })
                        }
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
                      // Remove top border on grids after the first to avoid double borders
                      sx={
                        folders.indexOf(folder) > 0
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

        <AssignUserModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          role={selectedRole || ""}
          users={currentAssignment?.users || []}
          onUsersChange={handleUpdateUsers}
        />
      </Box>
    </div>
  )
}
