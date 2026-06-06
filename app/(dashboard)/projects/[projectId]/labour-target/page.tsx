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

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createStep, setCreateStep] = useState<"folder" | "subfolder">("folder")
  const [newFolderName, setNewFolderName] = useState("")
  const [newSubfolderName, setNewSubfolderName] = useState("")

  const [subfolderDialogTarget, setSubfolderDialogTarget] = useState<{
    folderId: string
    folderName: string
  } | null>(null)
  const [newSubfolderNameCtx, setNewSubfolderNameCtx] = useState("")

  // Measure the DataGrid column-header height so the sidebar top-offset aligns
  const gridWrapperRef = useRef<HTMLDivElement>(null)
  const [headerH, setHeaderH] = useState(98) // fallback: ~56 group row + 42 col row

  useEffect(() => {
    const measure = () => {
      const el = gridWrapperRef.current?.querySelector(
        ".MuiDataGrid-columnHeaders"
      ) as HTMLElement | null
      if (el) setHeaderH(el.offsetHeight)
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (gridWrapperRef.current) observer.observe(gridWrapperRef.current)
    return () => observer.disconnect()
  }, [folders])

  const resetCreateDialog = useCallback(() => {
    setCreateDialogOpen(false)
    setCreateStep("folder")
    setNewFolderName("")
    setNewSubfolderName("")
  }, [])

  const handleSaveProgress = useCallback(() => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(folders)) } catch { /* ignore */ }
  }, [folders, storageKey])

  const handleToggleLock = useCallback(() => {
    setIsLocked((prev) => {
      const next = !prev
      try { window.localStorage.setItem(lockKey, String(next)) } catch { /* ignore */ }
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
          subfolders: [{ id: subfolderId, name: subfolderName, rows: defaultRows() }],
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
        prev.map((folder) =>
          folder.id === folderId
            ? {
                ...folder,
                subfolders: [
                  ...folder.subfolders,
                  { id: subfolderId, name: subfolderName, rows: defaultRows() },
                ],
              }
            : folder
        )
      )
      setModal({ folderId, subfolderId })
    },
    []
  )

  const saveSubfolder = useCallback(
    (folderId: string, subfolderId: string, rows: Row[]) => {
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? {
                ...folder,
                subfolders: folder.subfolders.map((sf) =>
                  sf.id === subfolderId ? { ...sf, rows } : sf
                ),
              }
            : folder
        )
      )
      setModal(null)
    },
    []
  )

  const activeFolder = modal ? folders.find((f) => f.id === modal.folderId) : null
  const activeSubfolder = activeFolder?.subfolders.find((sf) => sf.id === modal?.subfolderId)

  // Rows — no section field needed, sidebar handles labels
  const rows = useMemo(() => {
    let rowId = 1
    return folders.flatMap((folder) =>
      Array.from({ length: ROWS_PER_FOLDER }, () => {
        const row: Record<string, unknown> = { id: rowId++ }
        folder.subfolders.forEach((sub) => {
          row[`${folder.id}_${sub.id}_ws`] = ""
          row[`${folder.id}_${sub.id}_wa`] = ""
          row[`${folder.id}_${sub.id}_pv`] = ""
          row[`${folder.id}_${sub.id}_lt`] = ""
        })
        return row
      })
    )
  }, [folders])

  const columns: GridColDef[] = useMemo(
    () =>
      folders.flatMap((folder) =>
        folder.subfolders.flatMap((sub) => [
          { field: `${folder.id}_${sub.id}_ws`, headerName: "Work Section", flex: 1, minWidth: 150, editable: true },
          { field: `${folder.id}_${sub.id}_wa`, headerName: "Work Area",    flex: 1, minWidth: 150, editable: true },
          { field: `${folder.id}_${sub.id}_pv`, headerName: "Project Value",flex: 1, minWidth: 140, editable: true },
          { field: `${folder.id}_${sub.id}_lt`, headerName: "Labour Target",flex: 1, minWidth: 140, editable: true },
        ])
      ),
    [folders]
  )

  const columnGroupingModel: GridColumnGroupingModel = useMemo(
    () =>
      folders.flatMap((folder) =>
        folder.subfolders.map((sub) => ({
          groupId: `${folder.id}_${sub.id}`,
          headerName: `${folder.name} / ${sub.name}`,
          children: [
            { field: `${folder.id}_${sub.id}_ws` },
            { field: `${folder.id}_${sub.id}_wa` },
            { field: `${folder.id}_${sub.id}_pv` },
            { field: `${folder.id}_${sub.id}_lt` },
          ],
        }))
      ),
    [folders]
  )

  const borderColor = colors.border ?? "rgba(255,255,255,0.12)"
  const sectionBg   = colors.oddRowBackground ?? "rgba(255,255,255,0.04)"
  const fg          = colors.foreground ?? "#e2e8f0"

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>

        {/* Toolbar */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 1 }}>
          <Button variant="outlined" onClick={handleSaveProgress} startIcon={<Save size={16} />}>
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

        {/* Sidebar + Grid  */}
        <Box sx={{ display: "flex", alignItems: "flex-start", minWidth: 1200 }}>

          {/* Detached section sidebar */}
          <Box
            sx={{
              flexShrink: 0,
              width: 48,
              display: "flex",
              flexDirection: "column",
              // top spacer = measured header height, so labels align with data rows
              paddingTop: `${headerH}px`,
              backgroundColor: sectionBg,
            }}
          >
            {folders.map((folder) => {
              const sectionH = ROWS_PER_FOLDER * ROW_HEIGHT

              return (
                <ContextMenu key={folder.id}>
                  <ContextMenuTrigger disabled={isLocked} asChild>
                    <Box
                      title={isLocked ? undefined : "Right-click to add subfolder"}
                      sx={{
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
                        borderTop: `1px solid ${borderColor}`,
                        borderLeft: `1px solid ${borderColor}`,
                        borderRight: `1px solid ${borderColor}`,
                        borderBottom: `1px solid ${borderColor}`,
                        transition: "background-color 140ms",
                        "&:hover": isLocked ? {} : {
                          backgroundColor: "rgba(251,191,36,0.07)",
                        },
                      }}
                    >
                      {folder.name}
                    </Box>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-52 border-white/10 bg-slate-900">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      {folder.name}
                    </div>
                    <ContextMenuItem
                      className="gap-2.5 text-slate-200 focus:bg-white/8 focus:text-white"
                      onSelect={() => {
                        setSubfolderDialogTarget({ folderId: folder.id, folderName: folder.name })
                        setNewSubfolderNameCtx("")
                      }}
                    >
                      <FolderPlus size={14} className="shrink-0 text-amber-400" />
                      Add subfolder
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              )
            })}
          </Box>

          {/* DataGrid */}
          <Box ref={gridWrapperRef} sx={{ flex: 1, minWidth: 0 }}>
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
                "& .MuiDataGrid-columnHeaderTitleContainer": { justifyContent: "center" },
                "& .MuiDataGrid-columnHeaderTitle": { textAlign: "center", width: "100%" },
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
          </Box>
        </Box>
      </Box>

      {/* Subfolder edit modal  */}
      {modal && activeSubfolder && activeFolder && (
        <SubfolderModal
          subfolder={activeSubfolder}
          folderName={activeFolder.name}
          copiedValue={copiedValue}
          onCopy={setCopiedValue}
          onSave={(rows) => saveSubfolder(modal.folderId, modal.subfolderId, rows)}
          onClose={() => setModal(null)}
        />
      )}

      {/* Add folder wizard  */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) =>
          open && !isLocked ? setCreateDialogOpen(true) : resetCreateDialog()
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{createStep === "folder" ? "Create folder" : "Create subfolder"}</DialogTitle>
            <DialogDescription>
              {createStep === "folder"
                ? "Enter a folder name"
                : `Enter a subfolder name for ${newFolderName.toUpperCase()}`}
            </DialogDescription>
          </DialogHeader>
          {createStep === "folder" ? (
            <Input autoFocus value={newFolderName} placeholder="e.g. Apartments"
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") resetCreateDialog()
                if (e.key === "Enter") { const t = newFolderName.trim(); if (!t) return; setNewFolderName(t); setCreateStep("subfolder") }
              }}
            />
          ) : (
            <Input autoFocus value={newSubfolderName} placeholder="e.g. Electrical"
              onChange={(e) => setNewSubfolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") resetCreateDialog()
                if (e.key === "Enter") { const f = newFolderName.trim(), s = newSubfolderName.trim(); if (!f || !s) return; createFolderWithSubfolder(f, s) }
              }}
            />
          )}
          <DialogFooter>
            <UiButton type="button" variant="outline" onClick={resetCreateDialog}>Cancel</UiButton>
            {createStep === "folder" ? (
              <UiButton type="button" className="bg-amber-400 text-[#111] hover:bg-amber-300"
                onClick={() => { const t = newFolderName.trim(); if (!t) return; setNewFolderName(t); setCreateStep("subfolder") }}>
                Next
              </UiButton>
            ) : (
              <UiButton type="button" className="bg-amber-400 text-[#111] hover:bg-amber-300"
                onClick={() => { const f = newFolderName.trim(), s = newSubfolderName.trim(); if (!f || !s) return; createFolderWithSubfolder(f, s) }}>
                Create
              </UiButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add subfolder to existing folder  */}
      <Dialog
        open={!!subfolderDialogTarget}
        onOpenChange={(open) => { if (!open) { setSubfolderDialogTarget(null); setNewSubfolderNameCtx("") } }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add subfolder</DialogTitle>
            <DialogDescription>
              Adding a subfolder to{" "}
              <span className="font-semibold text-slate-200">{subfolderDialogTarget?.folderName}</span>
            </DialogDescription>
          </DialogHeader>
          <Input autoFocus value={newSubfolderNameCtx} placeholder="e.g. Mechanical"
            onChange={(e) => setNewSubfolderNameCtx(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setSubfolderDialogTarget(null); setNewSubfolderNameCtx("") }
              if (e.key === "Enter") {
                const t = newSubfolderNameCtx.trim()
                if (!t || !subfolderDialogTarget) return
                addSubfolderToFolder(subfolderDialogTarget.folderId, t)
                setSubfolderDialogTarget(null); setNewSubfolderNameCtx("")
              }
            }}
          />
          <DialogFooter>
            <UiButton type="button" variant="outline"
              onClick={() => { setSubfolderDialogTarget(null); setNewSubfolderNameCtx("") }}>
              Cancel
            </UiButton>
            <UiButton type="button" className="bg-amber-400 text-[#111] hover:bg-amber-300"
              onClick={() => {
                const t = newSubfolderNameCtx.trim()
                if (!t || !subfolderDialogTarget) return
                addSubfolderToFolder(subfolderDialogTarget.folderId, t)
                setSubfolderDialogTarget(null); setNewSubfolderNameCtx("")
              }}>
              Add Subfolder
            </UiButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
