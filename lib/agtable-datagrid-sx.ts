import { colors } from "@/constants/colors"

const bg = colors.background.trim()

/**
 * MUI DataGrid `sx` preset to match the AG Grid (AgTable) dark Quartz theme.
 */
export const agTableDataGridSx = {
  "& .MuiDataGrid-columnHeaders *": {
    backgroundColor: `${colors.oddRowBackground} !important`,
  },
  backgroundColor: bg,
  color: colors.foreground,
  border: `1px solid ${colors.border}`,
  borderRadius: 0,

  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: colors.oddRowBackground,
    borderBottom: `1px solid ${colors.border}`,
  },

  "& .MuiDataGrid-columnHeader": {
    backgroundColor: colors.oddRowBackground,
    //  color: colors.headerText,
    borderColor: colors.border,
  },

  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 600,
    color: colors.headerText,
  },

  "& .MuiDataGrid-cell": {
    color: colors.foreground,
    borderColor: colors.border,
  },

  "& .MuiDataGrid-row": {
    backgroundColor: bg,
  },

  "& .MuiDataGrid-row:nth-of-type(odd)": {
    backgroundColor: colors.oddRowBackground,
  },

  "& .MuiDataGrid-row:hover": {
    backgroundColor: "transparent",
  },

  "& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row.Mui-selected:hover": {
    backgroundColor: colors.secondary,
  },

  "& .MuiDataGrid-withBorderColor": {
    borderColor: colors.border,
  },

  "& .MuiDataGrid-columnSeparator": {
    color: colors.border,
  },
} as const
