"use client"

import { useCallback, useMemo, useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"

import {
  DataGrid,
  type GridColDef,
  type GridColumnGroupingModel,
} from "@mui/x-data-grid"

import { Plus, Save, Lock, Unlock, FolderPlus, Briefcase, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { agTableDataGridSx } from "@/lib/agtable-datagrid-sx"
import { colors } from "@/constants/colors"
import { useAuthStore } from "@/lib/auth-store"

import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button as UiButton } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

import { SubfolderModal } from "@/app/(dashboard)/labour-target/subfolder-modal"
import { AssignFolderModal } from "@/app/(dashboard)/labour-target/assign-folder-modal"
import type { SubfolderAssignment } from "@/lib/api/project-admin"
import type {
  FolderType,
  ModalState,
  Row,
} from "@/app/(dashboard)/labour-target/types"
import { defaultRows, uid } from "@/app/(dashboard)/labour-target/utils"

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

// Custom column group header for subfolders — uses Radix ContextMenu (same as folder)
// so right-click behaviour is identical and reliable inside MUI DataGrid.
function SubfolderGroupHeader(props: any) {
  const { headerName, groupId, onSubfolderAssign, isManagement, isLocked } = props
  const { user } = useAuthStore()
  const isProjectAdmin = user?.role === "project_admin"

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            cursor: 'context-menu',
            userSelect: 'none',
            padding: '0 4px',
          }}
          title="Right-click to assign employee"
        >
          {headerName}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-52 border-white/10 bg-slate-900">
        {/* Section label */}
        <div className="px-2 py-1 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
          {headerName}
        </div>

        {/* Assign Employee */}
        {!isProjectAdmin && (
          <ContextMenuItem
            className="gap-2.5 text-slate-200 focus:bg-white/[0.08] focus:text-white"
            disabled={isManagement || isLocked}
            onSelect={() => onSubfolderAssign?.(groupId)}
          >
            <UserPlus size={14} className="shrink-0 text-indigo-400" />
            Assign Employee
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}



// Per-folder DataGrid
function FolderGrid({
  folder,
  isLocked,
  sx,
  onChange,
  onSubfolderAssign,
}: {
  folder: FolderType
  isLocked: boolean
  sx?: object
  onChange?: (newFolder: FolderType) => void
  onSubfolderAssign?: (subfolderId: string) => void
  onAddSubfolder?: (folderId: string) => void
}) {
  const rows = useMemo(
    () =>
      Array.from({ length: Math.max(ROWS_PER_FOLDER, ...folder.subfolders.map(s => s.rows?.length || 0)) }, (_, i) => {
        const row: Record<string, unknown> = { id: i + 1 }
        folder.subfolders.forEach((sub) => {
          row[`${sub.id}_ws`] = sub.rows[i]?.workSection || ""
          row[`${sub.id}_wa`] = sub.rows[i]?.workArea || ""
          row[`${sub.id}_pv`] = sub.rows[i]?.projectValue || ""
          row[`${sub.id}_lt`] = sub.rows[i]?.labourTarget || ""
        })
        return row
      }),
    [folder]
  )

  const columns: GridColDef[] = useMemo(
    () =>
      folder.subfolders.flatMap((sub) => {
        const cols: GridColDef[] = [
          {
            field: `${sub.id}_ws`,
            headerName: "Work Section",
            flex: 1,
            minWidth: 150,
            editable: true,
          },
          {
            field: `${sub.id}_wa`,
            headerName: "Work Area",
            flex: 1,
            minWidth: 150,
            editable: true,
          },
          {
            field: `${sub.id}_pv`,
            headerName: "Project Value",
            flex: 1,
            minWidth: 140,
            editable: true,
          },
          {
            field: `${sub.id}_lt`,
            headerName: "Labour Target",
            flex: 1,
            minWidth: 140,
            editable: true,
          }
        ]
        return cols
      }),
    [folder]
  )

  const columnGroupingModel: GridColumnGroupingModel = useMemo(
    () =>
      folder.subfolders.map((sub) => {
        const children = [
          { field: `${sub.id}_ws` },
          { field: `${sub.id}_wa` },
          { field: `${sub.id}_pv` },
          { field: `${sub.id}_lt` }
        ]
        return {
          groupId: sub.id,
          headerName: sub.name.toUpperCase(),
          children,
          renderHeaderGroup: () => (
            <SubfolderGroupHeader
              headerName={sub.name.toUpperCase()}
              groupId={sub.id}
              onSubfolderAssign={onSubfolderAssign}
              isManagement={folder.is_management}
              isLocked={isLocked}
            />
          ),
        }
      }),
    [folder, onSubfolderAssign]
  )

  const handleProcessRowUpdate = useCallback(
    (newRow: Record<string, any>) => {
      const updatedFolder = { ...folder }
      updatedFolder.subfolders = folder.subfolders.map((sub) => {
        const newSubRows = [...(sub.rows || [])]
        const rowIndex = newRow.id - 1
        // Make sure we have enough rows up to this index
        while (newSubRows.length <= rowIndex) {
          newSubRows.push({ id: uid(), workSection: "", workArea: "", projectValue: "", labourTarget: "" })
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

  const handleAddRow = useCallback(() => {
    if (isLocked) return
    const updatedFolder = { ...folder }
    // determine current max rows
    const currentRowCount = Math.max(
      ROWS_PER_FOLDER,
      ...folder.subfolders.map((s) => (s.rows || []).length)
    )
    updatedFolder.subfolders = folder.subfolders.map((sub) => {
      const newSubRows = [...(sub.rows || [])]
      // ensure we pad up to the max rows across subfolders
      while (newSubRows.length < currentRowCount) {
        newSubRows.push({ id: uid(), workSection: "", workArea: "", projectValue: "", labourTarget: "" })
      }
      // append the new row
      newSubRows.push({ id: uid(), workSection: "", workArea: "", projectValue: "", labourTarget: "" })
      return { ...sub, rows: newSubRows }
    })
    onChange?.(updatedFolder)
  }, [folder, isLocked, onChange])

  const fg = colors.foreground ?? "#e2e8f0"

  return (
    <div className="flex flex-col h-full bg-[#111827]">
      <DataGrid
        rows={rows}
        columns={columns}
        columnGroupingModel={columnGroupingModel}
        slots={undefined}
        processRowUpdate={handleProcessRowUpdate}
        initialState={{
          pagination: { paginationModel: { pageSize: 100 } },
        }}
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick
        showCellVerticalBorder
        showColumnVerticalBorder
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
      {!isLocked && (
        <button
          onClick={handleAddRow}
          className="group flex h-8 w-full items-center justify-center gap-2 border-t border-white/10 bg-[rgba(255,255,255,0.04)] text-xs font-semibold uppercase tracking-widest text-slate-400 hover:bg-amber-400/10 hover:text-amber-400 transition-colors shrink-0"
        >
          <Plus size={14} className="opacity-60 group-hover:opacity-100 transition-opacity" /> Add Row
        </button>
      )}
    </div>
  )
}

export default function DynamicFolderTable() {
  const { projectId } = useParams<{ projectId: string }>()
  const storageKey = "tresta:labour-target"
  const lockKey = `${storageKey}:locked`
  
  const { user } = useAuthStore()
  const isProjectAdmin = user?.role === "project_admin"

  const [folders, setFolders] = useState<FolderType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    import("@/lib/api/project-admin").then(({ getProjectFolders }) => {
      getProjectFolders(projectId)
        .then((data) => {
          if (data && data.length > 0) {
            setFolders(data as unknown as FolderType[])
          } else {
            setFolders([])
          }
        })
        .catch(() => {
          setFolders([])
        })
        .finally(() => setLoading(false))
    })
  }, [projectId])

  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    try {
      if (window.localStorage.getItem(lockKey) === "true") {
        setIsLocked(true)
      }
    } catch {
      // ignore
    }
  }, [lockKey])

  const [modalState, setModalState] = useState<ModalState>(null)

  // State for Assign Folder Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<{ folderId: string, subfolderId?: string, targetName: string } | null>(null)
  const [copiedValue, setCopiedValue] = useState("")

  // ── Add-folder wizard ────────────────────────────────────────────────────
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createStep, setCreateStep] = useState<"folder" | "subfolder">("folder")
  const [newFolderName, setNewFolderName] = useState("")
  const [newSubfolderName, setNewSubfolderName] = useState("")

  // ── Add-subfolder (from context menu) ───────────────────────────────────
  const [subfolderTarget, setSubfolderTarget] = useState<{
    folderId: string
    folderName: string
  } | null>(null)
  const [newSubfolderNameCtx, setNewSubfolderNameCtx] = useState("")

  // ── Per-folder header height measurement ────────────────────────────────
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

  // Helpers
  const resetCreateDialog = useCallback(() => {
    setCreateDialogOpen(false)
    setCreateStep("folder")
    setNewFolderName("")
    setNewSubfolderName("")
  }, [])

  const handleSaveProgress = useCallback(async () => {
    if (!projectId) return
    try {
      const { updateProjectFolders } = await import("@/lib/api/project-admin")
      await updateProjectFolders(projectId, folders as any)
      toast.success("Progress saved successfully!")
    } catch (err) {
      toast.error("Failed to save progress")
    }
  }, [folders, projectId])

  const handleToggleLock = useCallback(() => {
    setIsLocked((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(lockKey, String(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [lockKey])

  const createFolderWithSubfolder = useCallback(
    (folderName: string, subfolderName: string) => {
      const folderId = uid()
      const subfolderId = uid()
      setFolders((prev) => [
        ...prev,
        {
          id: folderId,
          name: folderName.toUpperCase(),
          subfolders: [
            { id: subfolderId, name: subfolderName, rows: defaultRows() },
          ],
        },
      ])
      setModalState({ folderId, subfolderId })
      resetCreateDialog()
    },
    [resetCreateDialog]
  )

  const addSubfolderToFolder = useCallback(
    (folderId: string, subfolderName: string) => {
      const subfolderId = uid()
      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId
            ? {
              ...f,
              subfolders: [
                ...f.subfolders,
                { id: subfolderId, name: subfolderName, rows: defaultRows() },
              ],
            }
            : f
        )
      )
      setModalState({ folderId, subfolderId })
    },
    []
  )

  const handleDeleteSubfolder = useCallback((folderId: string, subId: string) => {
    setFolders((prev) =>
      prev.map((f) => {
        if (f.id === folderId) {
          return {
            ...f,
            subfolders: f.subfolders.filter((s) => s.id !== subId),
          }
        }
        return f
      })
    )
  }, [])

  const handleAssignSubfolder = useCallback((folderId: string, subId?: string) => {
    const folder = folders.find(f => f.id === folderId)
    const targetName = subId
      ? folder?.subfolders.find(s => s.id === subId)?.name ?? 'Subfolder'
      : folder?.name ?? 'Folder'
    setAssignTarget({ folderId, subfolderId: subId, targetName })
    setAssignModalOpen(true)
  }, [folders])

  const onAssignConfirm = useCallback((newAssignments: SubfolderAssignment[]) => {
    if (!assignTarget) return

    setFolders((prev) =>
      prev.map((f) => {
        if (f.id === assignTarget.folderId) {
          if (assignTarget.subfolderId) {
            // Assign to single subfolder
            return {
              ...f,
              subfolders: f.subfolders.map((s) =>
                s.id === assignTarget.subfolderId
                  ? { ...s, assignments: newAssignments }
                  : s
              ),
            }
          } else {
            // Assign to ALL subfolders
            return {
              ...f,
              subfolders: f.subfolders.map((s) => ({
                ...s,
                assignments: newAssignments,
              })),
            }
          }
        }
        return f
      })
    )
  }, [assignTarget])

  const saveSubfolder = useCallback(
    (folderId: string, subfolderId: string, rows: Row[], assignments?: any[]) => {
      // Calculate new folders state first to avoid side effects inside setFolders updater
      const newFolders = folders.map((f) =>
        f.id === folderId
          ? {
            ...f,
            subfolders: f.subfolders.map((sf) =>
              sf.id === subfolderId ? { ...sf, rows, assignments: assignments || sf.assignments || [] } : sf
            ),
          }
          : f
      )
      setFolders(newFolders)
      setModalState(null)
    },
    [folders, projectId]
  )

  const toggleManagementFolder = useCallback((folderId: string) => {
    const newFolders = folders.map((f) => {
      if (f.id === folderId) {
        const isNowManagement = !f.is_management
        return {
          ...f,
          is_management: isNowManagement,
          subfolders: isNowManagement
            ? f.subfolders.map(sf => ({ ...sf, assignments: [] }))
            : f.subfolders
        }
      }
      return { ...f, is_management: false }
    })
    setFolders(newFolders)
  }, [folders])

  const activeFolder = modalState
    ? folders.find((f) => f.id === modalState.folderId)
    : null
  const activeSubfolder = activeFolder?.subfolders.find(
    (sf) => sf.id === modalState?.subfolderId
  )

  const borderColor = colors.border ?? "rgba(255,255,255,0.12)"
  const sectionBg = colors.oddRowBackground ?? "rgba(255,255,255,0.04)"
  const fg = colors.foreground ?? "#e2e8f0"

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        {/* Toolbar */}
        <div className="flex justify-end gap-2 mb-2">
          <UiButton
            variant="outline"
            onClick={handleSaveProgress}
          >
            <Save size={16} className="mr-2" />
            Save progress
          </UiButton>
          <UiButton
            variant="outline"
            onClick={handleToggleLock}
          >
            {isLocked ? <Unlock size={16} className="mr-2" /> : <Lock size={16} className="mr-2" />}
            {isLocked ? "Unlock Project Folder" : "Lock Project Folder"}
          </UiButton>
          <UiButton
            disabled={isLocked}
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus size={16} className="mr-2" />
            Add folder
          </UiButton>
        </div>

        {/* ── One row per folder: sidebar label + its own DataGrid  */}
        <div className="flex flex-col gap-8 w-full min-w-0">
          {folders.map((folder) => {
            const hh = headerHeights[folder.id] ?? HEADER_FALLBACK

            // Constrain the table container to the viewport height so internal scrollbars work perfectly
            const sectionH = "calc(100vh - 250px)"

            return (
              <div
                key={folder.id}
                className="flex items-stretch w-full min-w-0"
              >
                {/* Sidebar label — full height of header + data rows */}
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <div
                      style={{
                        flexShrink: 0,
                        width: 48,
                        height: sectionH,
                        position: "relative",
                        border: `1px solid ${borderColor}`,
                        backgroundColor: sectionBg,
                        transition: "background-color 140ms",
                      }}
                      className={!isLocked ? "group hover:bg-amber-400/10" : ""}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
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
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          {folder.is_management && <Briefcase size={12} className="text-blue-400" />}
                          <span>{folder.name}</span>
                        </div>
                      </div>

                      {!isLocked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            setSubfolderTarget({
                              folderId: folder.id,
                              folderName: folder.name,
                            })
                            setNewSubfolderNameCtx("")
                          }}
                          className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center justify-center rounded-md p-1.5 text-slate-400 hover:bg-black/20 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          title="Add Subfolder"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-52 border-white/10 bg-slate-900">
                    <div className="px-2 py-1 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                      {folder.name}
                    </div>
                    <ContextMenuItem
                      className="gap-2.5 text-slate-200 focus:bg-white/[0.08] focus:text-white"
                      disabled={isLocked}
                      onSelect={() => {
                        setSubfolderTarget({
                          folderId: folder.id,
                          folderName: folder.name,
                        })
                        setNewSubfolderNameCtx("")
                      }}
                    >
                      <FolderPlus
                        size={14}
                        className="shrink-0 text-amber-400"
                      />
                      Add subfolder
                    </ContextMenuItem>
                    
                    {!isProjectAdmin && (
                      <>
                        <ContextMenuItem
                          className="gap-2.5 text-slate-200 focus:bg-white/[0.08] focus:text-white"
                          disabled={folder.is_management || isLocked}
                          onSelect={() => handleAssignSubfolder(folder.id)}
                        >
                          <UserPlus size={14} className="shrink-0 text-indigo-400" />
                          Assign Folder
                        </ContextMenuItem>
                        <ContextMenuItem
                          className="gap-2.5 text-slate-200 focus:bg-white/[0.08] focus:text-white"
                          disabled={isLocked}
                          onSelect={() => toggleManagementFolder(folder.id)}
                        >
                          <Briefcase
                            size={14}
                            className={`shrink-0 ${folder.is_management ? "text-red-400" : "text-blue-400"}`}
                          />
                          {folder.is_management ? "Remove from Management" : "Assign to Management"}
                        </ContextMenuItem>
                      </>
                    )}
                  </ContextMenuContent>
                </ContextMenu>

                {/* This folder's own DataGrid */}
                <div
                  ref={(el: HTMLDivElement | null) => {
                    if (el) gridRefs.current.set(folder.id, el)
                    else gridRefs.current.delete(folder.id)
                  }}
                  className="flex-1 min-w-0"
                >
                  <FolderGrid
                    folder={folder}
                    isLocked={isLocked}
                    onChange={(newFolder) => {
                      setFolders((prev) => prev.map((f) => (f.id === newFolder.id ? newFolder : f)))
                    }}
                    onSubfolderAssign={(subId) => handleAssignSubfolder(folder.id, subId)}
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
                </div>

                {/* Right sidebar for Add Subfolder */}
                {!isLocked && (
                  <button
                    onClick={() => {
                      setSubfolderTarget({
                        folderId: folder.id,
                        folderName: folder.name,
                      })
                      setNewSubfolderNameCtx("")
                    }}
                    className="flex-shrink-0 flex items-center justify-center w-12 border border-l-0 border-white/10 bg-[rgba(255,255,255,0.04)] text-slate-400 hover:bg-amber-400/10 hover:text-amber-400 transition-colors group"
                    title="Add Subfolder"
                    style={{
                      height: sectionH,
                      borderTop: folders.indexOf(folder) > 0 ? "none" : undefined,
                    }}
                  >
                    <FolderPlus size={18} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Subfolder edit modal ─────────────────────────────────────────────── */}
      {modalState && activeSubfolder && activeFolder && (
        <SubfolderModal
          subfolder={activeSubfolder}
          folderName={activeFolder.name}
          copiedValue={copiedValue}
          onCopy={setCopiedValue}
          isManagement={activeFolder.is_management}
          onSave={(rows) =>
            saveSubfolder(activeFolder.id, activeSubfolder.id, rows)
          }
          onClose={() => setModalState(null)}
        />
      )}

      {/* ── Assign Folder/Subfolder Modal ─────────────────────────────────────── */}
      <AssignFolderModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        projectId={projectId as string}
        targetName={assignTarget?.targetName ?? ''}
        assignments={
          assignTarget?.subfolderId
            ? (folders.find(f => f.id === assignTarget.folderId)?.subfolders.find(s => s.id === assignTarget.subfolderId)?.assignments || [])
            : (folders.find(f => f.id === assignTarget?.folderId)?.subfolders[0]?.assignments || [])
        }
        onAssign={onAssignConfirm}
      />

      {/* ── Add folder wizard ────────────────────────────────────────────────── */}

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) =>
          open && !isLocked ? setCreateDialogOpen(true) : resetCreateDialog()
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {createStep === "folder" ? "Create folder" : "Create subfolder"}
            </DialogTitle>
            <DialogDescription>
              {createStep === "folder"
                ? "Enter a folder name"
                : `Enter a subfolder name for ${newFolderName.toUpperCase()}`}
            </DialogDescription>
          </DialogHeader>
          {createStep === "folder" ? (
            <Input
              autoFocus
              value={newFolderName}
              placeholder="e.g. Apartments"
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") resetCreateDialog()
                if (e.key === "Enter") {
                  e.preventDefault()
                  const t = newFolderName.trim()
                  if (!t) return
                  setNewFolderName(t)
                  setCreateStep("subfolder")
                }
              }}
            />
          ) : (
            <Input
              autoFocus
              value={newSubfolderName}
              placeholder="e.g. Electrical"
              onChange={(e) => setNewSubfolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") resetCreateDialog()
                if (e.key === "Enter") {
                  e.preventDefault()
                  const f = newFolderName.trim(),
                    s = newSubfolderName.trim()
                  if (!f || !s) return
                  createFolderWithSubfolder(f, s)
                }
              }}
            />
          )}
          <DialogFooter>
            <UiButton
              type="button"
              variant="outline"
              onClick={resetCreateDialog}
            >
              Cancel
            </UiButton>
            {createStep === "folder" ? (
              <UiButton
                type="button"
                className="bg-amber-400 text-[#111] hover:bg-amber-300"
                onClick={() => {
                  const t = newFolderName.trim()
                  if (!t) return
                  setNewFolderName(t)
                  setCreateStep("subfolder")
                }}
              >
                Next
              </UiButton>
            ) : (
              <UiButton
                type="button"
                className="bg-amber-400 text-[#111] hover:bg-amber-300"
                onClick={() => {
                  const f = newFolderName.trim(),
                    s = newSubfolderName.trim()
                  if (!f || !s) return
                  createFolderWithSubfolder(f, s)
                }}
              >
                Create
              </UiButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add subfolder to existing folder (context menu) ───────────────────── */}
      <Dialog
        open={!!subfolderTarget}
        onOpenChange={(open) => {
          if (!open) {
            setSubfolderTarget(null)
            setNewSubfolderNameCtx("")
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add subfolder</DialogTitle>
            <DialogDescription>
              Adding a subfolder to{" "}
              <span className="font-semibold text-slate-200">
                {subfolderTarget?.folderName}
              </span>
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={newSubfolderNameCtx}
            placeholder="e.g. Mechanical"
            onChange={(e) => setNewSubfolderNameCtx(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSubfolderTarget(null)
                setNewSubfolderNameCtx("")
              }
              if (e.key === "Enter") {
                const t = newSubfolderNameCtx.trim()
                if (!t || !subfolderTarget) return
                addSubfolderToFolder(subfolderTarget.folderId, t)
                setSubfolderTarget(null)
                setNewSubfolderNameCtx("")
              }
            }}
          />
          <DialogFooter>
            <UiButton
              type="button"
              variant="outline"
              onClick={() => {
                setSubfolderTarget(null)
                setNewSubfolderNameCtx("")
              }}
            >
              Cancel
            </UiButton>
            <UiButton
              type="button"
              className="bg-amber-400 text-[#111] hover:bg-amber-300"
              onClick={() => {
                const t = newSubfolderNameCtx.trim()
                if (!t || !subfolderTarget) return
                addSubfolderToFolder(subfolderTarget.folderId, t)
                setSubfolderTarget(null)
                setNewSubfolderNameCtx("")
              }}
            >
              Add Subfolder
            </UiButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
