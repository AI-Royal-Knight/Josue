"use client"

import { useCallback, useMemo, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"

import {
  DataGrid,
  type GridColDef,
  type GridColumnGroupingModel,
} from "@mui/x-data-grid"

import { Plus } from "lucide-react"
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

import { SubfolderModal } from "@/app/(dashboard)/labour-target/subfolder-modal"
import type {
  FolderType,
  ModalState,
  Row,
} from "@/app/(dashboard)/labour-target/types"
import { defaultRows, uid } from "@/app/(dashboard)/labour-target/utils"

const ROWS_PER_FOLDER = 5
const SECTION_LABEL_ROW_INDEX = Math.floor(ROWS_PER_FOLDER / 2)

export default function DynamicFolderTable() {
  // folders + subfolders
  const [folders, setFolders] = useState<FolderType[]>([
    {
      id: "apartments",
      name: "APARTMENTS",
      subfolders: [
        {
          id: "electrical",
          name: "Electrical",
          rows: defaultRows(),
        },
        {
          id: "plumbing",
          name: "Plumbing",
          rows: defaultRows(),
        },
      ],
    },

    {
      id: "corridors",
      name: "CORRIDORS",
      subfolders: [
        {
          id: "electrical",
          name: "Electrical",
          rows: defaultRows(),
        },
      ],
    },
  ])

  const [modal, setModal] = useState<ModalState>(null)
  const [copiedValue, setCopiedValue] = useState("")

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createStep, setCreateStep] = useState<"folder" | "subfolder">("folder")
  const [newFolderName, setNewFolderName] = useState("")
  const [newSubfolderName, setNewSubfolderName] = useState("")

  const resetCreateDialog = useCallback(() => {
    setCreateDialogOpen(false)
    setCreateStep("folder")
    setNewFolderName("")
    setNewSubfolderName("")
  }, [])

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

  const saveSubfolder = useCallback(
    (folderId: string, subfolderId: string, rows: Row[]) => {
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? {
                ...folder,
                subfolders: folder.subfolders.map((subfolder) =>
                  subfolder.id === subfolderId
                    ? { ...subfolder, rows }
                    : subfolder
                ),
              }
            : folder
        )
      )
      setModal(null)
    },
    []
  )

  const activeFolder = modal
    ? folders.find((folder) => folder.id === modal.folderId)
    : null
  const activeSubfolder = activeFolder?.subfolders.find(
    (subfolder) => subfolder.id === modal?.subfolderId
  )

  // rows
  const rows = useMemo(() => {
    let rowId = 1

    return folders.flatMap((folder) =>
      Array.from({ length: ROWS_PER_FOLDER }, (_, sectionRowIndex) => {
        const row: Record<string, unknown> = {
          id: rowId++,
          section: folder.name,
          __sectionRowIndex: sectionRowIndex,
        }

        folder.subfolders.forEach((sub) => {
          row[`${folder.id}_${sub.id}_ws`] = ""
          row[`${folder.id}_${sub.id}_wa`] = ""
          row[`${folder.id}_${sub.id}_pv`] = ""
        })

        return row
      })
    )
  }, [folders])

  // columns
  const columns: GridColDef[] = useMemo(() => {
    const baseColumn: GridColDef[] = [
      {
        field: "section",
        headerName: "",
        width: 120,

        cellClassName: (params) => {
          const i = (params.row as Record<string, unknown>).__sectionRowIndex
          const sectionRowIndex = typeof i === "number" ? i : -1

          if (sectionRowIndex === 0) return "cell-section cell-section-first"
          if (sectionRowIndex === ROWS_PER_FOLDER - 1)
            return "cell-section cell-section-last"
          return "cell-section cell-section-mid"
        },

        renderCell: (params) => {
          const i = (params.row as Record<string, unknown>).__sectionRowIndex
          const sectionRowIndex = typeof i === "number" ? i : -1

          if (sectionRowIndex !== SECTION_LABEL_ROW_INDEX) return null

          return (
            <Box
              sx={{
                writingMode: "vertical-lr",
                transform: "rotate(180deg)",
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.1em",
              }}
            >
              {params.value}
            </Box>
          )
        },
      },
    ]

    const dynamicColumns = folders.flatMap((folder) =>
      folder.subfolders.flatMap((sub) => [
        {
          field: `${folder.id}_${sub.id}_ws`,
          headerName: "Work Section",
          flex: 1,
          minWidth: 150,
          editable: true,
        },

        {
          field: `${folder.id}_${sub.id}_wa`,
          headerName: "Work Area",
          flex: 1,
          minWidth: 150,
          editable: true,
        },

        {
          field: `${folder.id}_${sub.id}_pv`,
          headerName: "Project Value",
          flex: 1,
          minWidth: 140,
          editable: true,
        },
      ])
    )

    return [...baseColumn, ...dynamicColumns]
  }, [folders])

  // column grouping
  const columnGroupingModel: GridColumnGroupingModel = useMemo(() => {
    return folders.flatMap((folder) =>
      folder.subfolders.map((sub) => ({
        groupId: `${folder.id}_${sub.id}`,
        headerName: `${folder.name} / ${sub.name}`,

        children: [
          {
            field: `${folder.id}_${sub.id}_ws`,
          },

          {
            field: `${folder.id}_${sub.id}_wa`,
          },

          {
            field: `${folder.id}_${sub.id}_pv`,
          },
        ],
      }))
    )
  }, [folders])

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* TABLE */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <Button
            variant="contained"
            onClick={() => setCreateDialogOpen(true)}
            startIcon={<Plus size={16} />}
          >
            Add folder
          </Button>
        </Box>

        <Box
          sx={{
            minWidth: 1200,
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            columnGroupingModel={columnGroupingModel}
            hideFooter
            disableRowSelectionOnClick
            showCellVerticalBorder
            showColumnVerticalBorder
            rowHeight={42}
            sx={{
              ...agTableDataGridSx,

              // Center all column header titles (normal + group headers)
              "& .MuiDataGrid-columnHeaderTitleContainer": {
                justifyContent: "center",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                textAlign: "center",
                width: "100%",
              },

              // Section column header is blank; match grid background.
              '& .MuiDataGrid-columnHeader[data-field="section"]': {
                backgroundColor: colors.background.trim(),
              },

              // Section cells: keep consistent with AG Grid header tone.
              "& .cell-section": {
                backgroundColor: `${colors.oddRowBackground} !important`,
                padding: "0 !important",
              },

              // Simulated rowspan: remove internal horizontal borders in section column.
              "& .cell-section-mid": {
                borderTop: "none !important",
                borderBottom: "none !important",
              },
              "& .cell-section-first": {
                borderBottom: "none !important",
              },
              "& .cell-section-last": {
                borderTop: "none !important",
              },
            }}
          />
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

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) =>
          open ? setCreateDialogOpen(true) : resetCreateDialog()
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
                  const trimmed = newFolderName.trim()
                  if (!trimmed) return
                  setNewFolderName(trimmed)
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
                  const folderTrimmed = newFolderName.trim()
                  const subTrimmed = newSubfolderName.trim()
                  if (!folderTrimmed || !subTrimmed) return
                  createFolderWithSubfolder(folderTrimmed, subTrimmed)
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
                  const trimmed = newFolderName.trim()
                  if (!trimmed) return
                  setNewFolderName(trimmed)
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
                  const folderTrimmed = newFolderName.trim()
                  const subTrimmed = newSubfolderName.trim()
                  if (!folderTrimmed || !subTrimmed) return
                  createFolderWithSubfolder(folderTrimmed, subTrimmed)
                }}
              >
                Create
              </UiButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
