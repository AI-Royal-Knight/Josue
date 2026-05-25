"use client"

import Box from "@mui/material/Box"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { colors } from "@/constants/colors"
import { agTableDataGridSx } from "@/lib/agtable-datagrid-sx"

const DATA_ROWS = 5

const rows = [
  ...Array.from({ length: DATA_ROWS }, (_, i) => ({
    id: i + 1,
    section: "APARTMENTS",
    el_ws: "",
    el_wa: "",
    el_pv: "",
    eff_ws: "",
    eff_wa: "",
    eff_pv: "",
    pl_ws: "",
    pl_wa: "",
    pl_pv: "",
  })),
  ...Array.from({ length: DATA_ROWS }, (_, i) => ({
    id: i + DATA_ROWS + 1,
    section: "CORRIDORS",
    el_ws: "",
    el_wa: "",
    el_pv: "",
    eff_ws: "",
    eff_wa: "",
    eff_pv: "",
    pl_ws: "",
    pl_wa: "",
    pl_pv: "", // empty — no Plumbing for Corridors
  })),
]

const columns: GridColDef[] = [
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
  },

  // electrical group
  { field: "el_ws", headerName: "Work section", flex: 1, minWidth: 130 },
  { field: "el_wa", headerName: "Work area", flex: 1, minWidth: 130 },
  // standalone → spans both header rows automatically
  {
    field: "el_pv",
    headerName: "Project Value",
    flex: 1,
    minWidth: 120,
    cellClassName: "cell-pv",
  },

  // Electrical First Fix group
  { field: "eff_ws", headerName: "Work section", flex: 1, minWidth: 130 },
  { field: "eff_wa", headerName: "Work area", flex: 1, minWidth: 130 },
  {
    field: "eff_pv",
    headerName: "Project Value",
    flex: 1,
    minWidth: 120,
    cellClassName: "cell-pv",
  },

  // Plumbing group
  { field: "pl_ws", headerName: "Work section", flex: 1, minWidth: 130 },
  { field: "pl_wa", headerName: "Work area", flex: 1, minWidth: 130 },
  {
    field: "pl_pv",
    headerName: "Project Value",
    flex: 1,
    minWidth: 120,
    cellClassName: "cell-pv",
  },
]

const columnGroupingModel = [
  {
    groupId: "electrical",
    headerName: "electrical",
    children: [{ field: "el_ws" }, { field: "el_wa" }],
  },
  {
    groupId: "eff",
    headerName: "Electrical First Fix",
    children: [{ field: "eff_ws" }, { field: "eff_wa" }],
  },
  {
    groupId: "plumbing",
    headerName: "Plumbing",
    children: [{ field: "pl_ws" }, { field: "pl_wa" }],
  },
]

export default function WhiteCardView() {
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
