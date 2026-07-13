"use client"

import { useEffect, useState, useMemo } from "react"
import Box from "@mui/material/Box"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { colors } from "@/constants/colors"
import { agTableDataGridSx } from "@/lib/agtable-datagrid-sx"
import { getWhiteCard, WhiteCardGroup } from "@/lib/api/monthly-application"
import { formatGBP } from "../../variations/utils"

export default function WhiteCardView({ projectId }: { projectId: string }) {
  const [groups, setGroups] = useState<WhiteCardGroup[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!projectId || projectId === "none") {
      setGroups([])
      return
    }

    async function load() {
      setLoading(true)
      try {
        const data = await getWhiteCard(projectId)
        setGroups(data.groups)
      } catch (e) {
        console.error("Failed to load white card", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId])

  const { rows, columns, columnGroupingModel } = useMemo(() => {
    if (!groups.length) return { rows: [], columns: [], columnGroupingModel: [] }

    const subfolderNames = Array.from(new Set(groups.flatMap(g => g.subfolders.map(s => s.name))))

    const cols: GridColDef[] = [
      {
        field: "section",
        headerName: "",
        width: 130,
        cellClassName: "cell-section",
        renderCell: ({ value }) => (
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
              color: colors.headerText,
            }}
          >
            {value}
          </Box>
        ),
      }
    ]
    const colGroupModel: any[] = []

    groups.forEach(g => {
      colGroupModel.push({
        groupId: g.groupId,
        headerName: g.headerName,
        children: [{ field: `${g.groupId}_ws` }, { field: `${g.groupId}_wa` }],
      })

      cols.push(
        { field: `${g.groupId}_ws`, headerName: "Work section", flex: 1, minWidth: 130 },
        { field: `${g.groupId}_wa`, headerName: "Work area", flex: 1, minWidth: 130 },
        { field: `${g.groupId}_pv`, headerName: "Project Value", flex: 1, minWidth: 120, cellClassName: "cell-pv" }
      )
    })

    const generatedRows = subfolderNames.map((subName, i) => {
      const row: any = { id: i + 1, section: "ALL AREAS" }
      groups.forEach(g => {
        const sub = g.subfolders.find(s => s.name === subName)
        row[`${g.groupId}_ws`] = g.headerName
        row[`${g.groupId}_wa`] = subName
        row[`${g.groupId}_pv`] = sub ? formatGBP(sub.project_value) : ""
      })
      return row
    })

    return { rows: generatedRows, columns: cols, columnGroupingModel: colGroupModel }
  }, [groups])
  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <Box sx={{ minWidth: 1200 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          columnGroupingModel={columnGroupingModel}
          rowSpanning // auto-merges consecutive equal values per column
          showCellVerticalBorder
          showColumnVerticalBorder
          disableRowSelectionOnClick
          hideFooter
          rowHeight={40}
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
          }}
        />
      </Box>
    </Box>
  )
}
