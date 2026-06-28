"use client"

import { useMemo, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import Chip from "@mui/material/Chip"

import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridRenderEditCellParams,
  useGridApiContext,
} from "@mui/x-data-grid"

import { Save } from "lucide-react"
import { agTableDataGridSx } from "@/lib/agtable-datagrid-sx"
import { colors } from "@/constants/colors"

// ─── Types ───────────────────────────────────────────────────────────────────

const ACTION_TYPES = [
  "User Invoices",
  "Proforma Nr Invoices",
  "User Variations Invoices",
  "Supplier Invoices",
  "Purchase orders",
  "Variations",
] as const

type ActionType = (typeof ACTION_TYPES)[number]

const CAUSE_OPTIONS = [
  ">£2000",
  ">£5000",
  ">£10,000.00",
  ">£50,000.00",
  "ALL",
] as const

const SIGNATURE_OPTIONS = [
  "Supervisor/Contracts Manager",
  "Supervisor/Contracts Manager/Project Director/Managing Director",
  "Procurement/Managing director",
  "Procurement/Managing Director",
  "Commercial Manager/Project Director",
] as const

type ApprovalRule = {
  cause: string
  signatures: string
  toggles: number
}

type ActionsConfig = Record<ActionType, ApprovalRule>

const DEFAULT_ACTIONS_CONFIG: ActionsConfig = {
  "User Invoices": {
    cause: ">£2000",
    signatures: "Supervisor/Contracts Manager",
    toggles: 2,
  },
  "Proforma Nr Invoices": {
    cause: "ALL",
    signatures: "Supervisor/Contracts Manager/Project Director/Managing Director",
    toggles: 4,
  },
  "User Variations Invoices": {
    cause: "ALL",
    signatures: "Supervisor/Contracts Manager/Project Director/Managing Director",
    toggles: 2,
  },
  "Supplier Invoices": {
    cause: ">£50,000.00",
    signatures: "Procurement/Managing director",
    toggles: 2,
  },
  "Purchase orders": {
    cause: ">£50,000.00",
    signatures: "Procurement/Managing Director",
    toggles: 2,
  },
  Variations: {
    cause: ">£2000",
    signatures: "Commercial Manager/Project Director",
    toggles: 2,
  },
}

// ─── Inline select editor: Cause ─────────────────────────────────────────────

function CauseEditCell(params: GridRenderEditCellParams) {
  const { id, value, field } = params
  const api = useGridApiContext()

  return (
    <Select
      value={value as string}
      onChange={(e) => {
        void api.current.setEditCellValue({ id, field, value: e.target.value })
        api.current.stopCellEditMode({ id, field })
      }}
      size="small"
      autoFocus
      open
      sx={{
        width: "100%",
        fontSize: 12,
        color: colors.foreground,
        "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.border },
        "& .MuiSvgIcon-root": { color: colors.foreground },
        "& .MuiSelect-select": { py: 0.5 },
      }}
      MenuProps={{
        slotProps: {
          paper: {
            sx: {
              bgcolor: colors.accent,
              color: colors.foreground,
              border: `1px solid ${colors.border}`,
              fontSize: 12,
            },
          },
        },
      }}
    >
      {CAUSE_OPTIONS.map((opt) => (
        <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>
          {opt}
        </MenuItem>
      ))}
    </Select>
  )
}

// ─── Inline select editor: Signatures ────────────────────────────────────────

function SignaturesEditCell(params: GridRenderEditCellParams) {
  const { id, value, field } = params
  const api = useGridApiContext()

  return (
    <Select
      value={value as string}
      onChange={(e) => {
        void api.current.setEditCellValue({ id, field, value: e.target.value })
        api.current.stopCellEditMode({ id, field })
      }}
      size="small"
      autoFocus
      open
      sx={{
        width: "100%",
        fontSize: 12,
        color: colors.foreground,
        "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.border },
        "& .MuiSvgIcon-root": { color: colors.foreground },
        "& .MuiSelect-select": { py: 0.5 },
      }}
      MenuProps={{
        slotProps: {
          paper: {
            sx: {
              bgcolor: colors.accent,
              color: colors.foreground,
              border: `1px solid ${colors.border}`,
              fontSize: 12,
              maxWidth: 420,
            },
          },
        },
      }}
    >
      {SIGNATURE_OPTIONS.map((opt) => (
        <MenuItem key={opt} value={opt} sx={{ fontSize: 12, whiteSpace: "normal" }}>
          {opt}
        </MenuItem>
      ))}
    </Select>
  )
}

import { useParams } from "next/navigation"
import { useEffect } from "react"

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ActionsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  
  const [config, setConfig] = useState<ActionsConfig>(DEFAULT_ACTIONS_CONFIG)
  const [loading, setLoading] = useState(true)

  // Load from API
  useEffect(() => {
    if (!projectId) return
    import("@/lib/api/project-admin").then(({ getApprovalConfigs }) => {
      getApprovalConfigs(projectId)
        .then((data) => {
          if (data && data.length > 0) {
            const newConfig = { ...DEFAULT_ACTIONS_CONFIG }
            data.forEach((item) => {
              const actionType = item.action_type as ActionType
              if (ACTION_TYPES.includes(actionType)) {
                newConfig[actionType] = {
                  cause: item.condition_value,
                  signatures: item.required_roles,
                  toggles: newConfig[actionType]?.toggles ?? 2,
                }
              }
            })
            setConfig(newConfig)
          }
        })
        .catch(() => {
          // fallback to default
        })
        .finally(() => setLoading(false))
    })
  }, [projectId])

  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!projectId) return
    try {
      const { updateApprovalConfigs } = await import("@/lib/api/project-admin")
      
      const payload = Object.entries(config).map(([action_type, rule]) => ({
        action_type,
        condition_value: rule.cause,
        required_roles: rule.signatures,
        is_active: true,
      }))
      
      await updateApprovalConfigs(projectId, payload)
      
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      alert("Failed to save actions")
    }
  }

  const rows = useMemo(
    () =>
      ACTION_TYPES.map((actionType, index) => ({
        id: index + 1,
        actionType,
        cause: config[actionType].cause,
        signatures: config[actionType].signatures,
        toggles: config[actionType].toggles,
      })),
    [config]
  )

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "actionType",
        headerName: "Actions",
        width: 190,
        editable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ fontSize: 13, color: colors.foreground, fontWeight: 500, whiteSpace: "normal", lineHeight: 1.35, py: 0.5 }}>
            {params.value as string}
          </Box>
        ),
      },
      {
        field: "cause",
        headerName: "Cause",
        width: 150,
        editable: true,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ fontSize: 13, color: "#93c5fd", fontWeight: 500 }}>
            {params.value as string}
          </Box>
        ),
        renderEditCell: (params: GridRenderEditCellParams) => <CauseEditCell {...params} />,
      },
      {
        field: "signatures",
        headerName: "Signatures / Toggles",
        flex: 1,
        minWidth: 320,
        editable: true,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ fontSize: 13, color: colors.foreground, whiteSpace: "normal", lineHeight: 1.35, py: 0.5 }}>
            {params.value as string}
          </Box>
        ),
        renderEditCell: (params: GridRenderEditCellParams) => <SignaturesEditCell {...params} />,
      },
      {
        field: "toggles",
        headerName: "Toggles",
        width: 100,
        editable: true,
        type: "number",
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Chip
              label={params.value as number}
              size="small"
              sx={{
                bgcolor: "#1e3a5f",
                color: "#93c5fd",
                fontWeight: 700,
                fontSize: 13,
                height: 24,
                minWidth: 32,
                "& .MuiChip-label": { px: 1 },
              }}
            />
          </Box>
        ),
      },
    ],
    []
  )

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 3, gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Box sx={{ fontSize: 18, fontWeight: 700, color: colors.headerText, mb: 0.5 }}>
            Approval Actions
          </Box>
          <Box sx={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
            Configure approval thresholds and required signatories for each document type.
            <br />
            <span style={{ color: "#93c5fd" }}>Cause</span>: triggers approval.&nbsp;
            <span style={{ color: "#93c5fd" }}>Signatures / Toggles</span>: roles that must sign.&nbsp;
            <span style={{ color: "#93c5fd" }}>Toggles</span>: number of approvers required.
          </Box>
        </Box>
        <Button
          variant={saved ? "contained" : "outlined"}
          onClick={handleSave}
          startIcon={<Save size={16} />}
          sx={saved ? { bgcolor: "#2d7f5c", "&:hover": { bgcolor: "#246b4e" } } : {}}
        >
          {saved ? "Saved" : "Save"}
        </Button>
      </Box>

      {/* Table */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          hideFooter
          disableRowSelectionOnClick
          showCellVerticalBorder
          showColumnVerticalBorder
          rowHeight={52}
          processRowUpdate={(newRow) => {
            const actionType = newRow.actionType as ActionType
            setConfig((prev) => ({
              ...prev,
              [actionType]: {
                cause: newRow.cause as string,
                signatures: newRow.signatures as string,
                toggles: newRow.toggles as number,
              },
            }))
            return newRow
          }}
          sx={{
            ...agTableDataGridSx,
            "& .MuiDataGrid-columnHeaderTitleContainer": { justifyContent: "center" },
            "& .MuiDataGrid-columnHeaderTitle": { textAlign: "center", width: "100%" },
            "& .MuiDataGrid-cell": {
              ...agTableDataGridSx["& .MuiDataGrid-cell"],
              alignItems: "flex-start",
              pt: "10px",
            },
          }}
        />
      </Box>
    </Box>
  )
}
