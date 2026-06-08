"use client"

import { useCallback, useMemo, useState, useEffect, useRef } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"

import {
  DataGrid,
  type GridColDef,
  type GridColumnGroupingModel,
} from "@mui/x-data-grid"

import { Plus, Save, Lock, Unlock, FolderPlus } from "lucide-react"
import { agTableDataGridSx } from "@/lib/agtable-datagrid-sx"
import { colors } from "@/constants/colors"

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

export default function DynamicFolderTable() {
  const storageKey = "tresta:labour-target"
  const lockKey = `${storageKey}:locked`

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

  const handleSaveProgress = useCallback(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(folders))
    } catch {
      /* ignore */
    }
  }, [folders, storageKey])

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
      setModal({ folderId, subfolderId })
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
      setModal({ folderId, subfolderId })
    },
    []
  )

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
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {/* Toolbar */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 1 }}
        >
          <Button
            variant="outlined"
            onClick={handleSaveProgress}
            startIcon={<Save size={16} />}
          >
            Save progress
          </Button>
          <Button
            variant="outlined"
            onClick={handleToggleLock}
            startIcon={isLocked ? <Unlock size={16} /> : <Lock size={16} />}
          >
            {isLocked ? "Unlock Project Folder" : "Lock Project Folder"}
          </Button>
          <Button
            variant="contained"
            disabled={isLocked}
            onClick={() => setCreateDialogOpen(true)}
            startIcon={<Plus size={16} />}
          >
            Add folder
          </Button>
        </Box>

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

      {/* ── Subfolder edit modal ─────────────────────────────────────────────── */}
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
    </Box>
  )
}
