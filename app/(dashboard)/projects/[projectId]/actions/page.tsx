"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { type ColDef } from "ag-grid-community"
import { Save } from "lucide-react"
import { AgTable } from "@/components/common/AgTable"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getApprovalConfigs,
  updateApprovalConfigs,
  getProjectRoles,
  type ApprovalConfigurationData,
  type ProjectRoleData,
} from "@/lib/api/project-admin"

const ACTION_TYPES = [
  "User Invoices",
  "Proforma Nr Invoices",
  "User Variations Invoices",
  "Supplier Invoices",
  "Purchase orders",
  "Variations",
] as const

type ActionType = (typeof ACTION_TYPES)[number]

const ACTION_ROLES_MAP: Record<ActionType, { roleKey: string; roleName: string }[]> = {
  "User Invoices": [
    { roleKey: "supervisor", roleName: "Supervisor" },
    { roleKey: "contracts_manager", roleName: "Contracts Manager" },
  ],
  "Proforma Nr Invoices": [
    { roleKey: "supervisor", roleName: "Supervisor" },
    { roleKey: "contracts_manager", roleName: "Contracts Manager" },
    { roleKey: "project_director", roleName: "Project Director" },
    { roleKey: "managing_director", roleName: "Managing Director" },
  ],
  "User Variations Invoices": [
    { roleKey: "supervisor", roleName: "Supervisor" },
    { roleKey: "contracts_manager", roleName: "Contracts Manager" },
    { roleKey: "project_director", roleName: "Project Director" },
    { roleKey: "managing_director", roleName: "Managing Director" },
  ],
  "Supplier Invoices": [
    { roleKey: "procurement_department", roleName: "Procurement" },
    { roleKey: "managing_director", roleName: "Managing Director" },
  ],
  "Purchase orders": [
    { roleKey: "procurement_department", roleName: "Procurement" },
    { roleKey: "managing_director", roleName: "Managing Director" },
  ],
  Variations: [
    { roleKey: "commercial_department", roleName: "Commercial Manager" },
    { roleKey: "project_director", roleName: "Project Director" },
  ],
}

type ApprovalRule = {
  cause: string
  signatures: string[] // List of active role keys
}

type ActionsConfig = Record<ActionType, ApprovalRule>

type ActionRow = {
  actionType: ActionType
  cause: string
  signatures: string[]
}

const FRONTEND_TO_BACKEND_ACTION_TYPE: Record<ActionType, string> = {
  "User Invoices": "user_invoice",
  "Proforma Nr Invoices": "proforma",
  "User Variations Invoices": "user_variations_invoice",
  "Supplier Invoices": "supplier_invoice",
  "Purchase orders": "purchase_order",
  Variations: "variations",
}

const BACKEND_TO_FRONTEND_ACTION_TYPE: Record<string, ActionType> = Object.entries(
  FRONTEND_TO_BACKEND_ACTION_TYPE
).reduce(
  (acc, [front, back]) => {
    acc[back] = front as ActionType
    return acc
  },
  {} as Record<string, ActionType>
)

const DEFAULT_ACTIONS_CONFIG: ActionsConfig = {
  "User Invoices": { cause: "", signatures: [] },
  "Proforma Nr Invoices": { cause: "", signatures: [] },
  "User Variations Invoices": { cause: "", signatures: [] },
  "Supplier Invoices": { cause: "", signatures: [] },
  "Purchase orders": { cause: "", signatures: [] },
  Variations: { cause: "", signatures: [] },
}

function cloneConfig(config: ActionsConfig): ActionsConfig {
  return ACTION_TYPES.reduce((next, actionType) => {
    next[actionType] = {
      cause: config[actionType].cause,
      signatures: [...config[actionType].signatures],
    }
    return next
  }, {} as ActionsConfig)
}

function CauseCell({ row, updateRule }: { row: ActionRow; updateRule: (type: ActionType, update: (current: ApprovalRule) => ApprovalRule) => void }) {
  const [value, setValue] = useState(row.cause)
  const [prevCause, setPrevCause] = useState(row.cause)

  if (row.cause !== prevCause) {
    setPrevCause(row.cause)
    setValue(row.cause)
  }

  return (
    <div className="flex h-full min-w-[200px] items-center" data-cell-click-ignore>
      <div className="relative z-40 w-full">
        <Label className="sr-only">Cause</Label>
        <Input
          placeholder="Type cause or value..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            if (value !== row.cause) {
              updateRule(row.actionType, (current) => ({
                ...current,
                cause: value,
              }))
            }
          }}
          className="bg-transparent text-xs"
        />
      </div>
    </div>
  )
}

export default function ActionsPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [projectRoles, setProjectRoles] = useState<ProjectRoleData[]>([])
  const [config, setConfig] = useState<ActionsConfig>(cloneConfig(DEFAULT_ACTIONS_CONFIG))
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!projectId) return

    Promise.all([
      getApprovalConfigs(projectId),
      getProjectRoles(projectId),
    ])
      .then(([configsData, rolesData]) => {
        setProjectRoles(rolesData)

        const newConfig = cloneConfig(DEFAULT_ACTIONS_CONFIG)

        configsData.forEach((item) => {
          const frontType = BACKEND_TO_FRONTEND_ACTION_TYPE[item.action_type]
          if (frontType) {
            newConfig[frontType] = {
              cause: item.condition_value || "",
              signatures: item.required_roles
                ? item.required_roles
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [],
            }
          }
        })
        setConfig(newConfig)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [projectId])

  const updateRule = useCallback(
    (actionType: ActionType, update: (current: ApprovalRule) => ApprovalRule) => {
      setSaved(false)
      setConfig((previous) => ({
        ...previous,
        [actionType]: update(previous[actionType]),
      }))
    },
    []
  )

  const rowData = useMemo<ActionRow[]>(
    () =>
      ACTION_TYPES.map((actionType) => ({
        actionType,
        cause: config[actionType].cause,
        signatures: config[actionType].signatures,
      })),
    [config]
  )

  const columnDefs = useMemo<ColDef<ActionRow>[]>(
    () => [
      {
        headerName: "Actions",
        field: "actionType",
        minWidth: 220,
        flex: 1.2,
        cellClass: "font-medium text-slate-100",
      },
      {
        headerName: "Cause",
        field: "cause",
        minWidth: 240,
        flex: 1.3,
        cellRenderer: (params: { data?: ActionRow }) => {
          const row = params.data
          if (!row) return null

          return <CauseCell row={row} updateRule={updateRule} />
        },
      },
      {
        headerName: "Signatures",
        field: "signatures",
        minWidth: 360,
        flex: 2.3,
        cellRenderer: (params: { data?: ActionRow }) => {
          const row = params.data
          if (!row) return null

          // Find active roles
          const activeRoles = ACTION_ROLES_MAP[row.actionType].filter((r) =>
            row.signatures.includes(r.roleKey)
          )

          if (activeRoles.length === 0) {
            return <div className="text-xs text-slate-500 italic mt-4">No signatures assigned</div>
          }

          return (
            <div className="relative z-30 min-w-[320px]" data-cell-click-ignore>
              <div className="flex flex-col gap-1 py-3">
                {activeRoles.map((role) => {
                  const roleData = projectRoles.find((pr) => pr.role_key === role.roleKey)
                  const users = roleData?.users || []

                  if (users.length === 0) {
                    return (
                      <span key={role.roleKey} className="text-[11px] text-slate-400">
                        Pending assignment ({role.roleName})
                      </span>
                    )
                  }

                  return (
                    <span key={role.roleKey} className="text-xs text-slate-200 font-medium">
                      {users.map((u) => u.name).join(", ")}{" "}
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({role.roleName})
                      </span>
                    </span>
                  )
                })}
              </div>
            </div>
          )
        },
      },
      {
        headerName: "Toggles",
        field: "signatures",
        minWidth: 240,
        flex: 1.5,
        cellRenderer: (params: { data?: ActionRow }) => {
          const row = params.data
          if (!row) return null

          const availableRoles = ACTION_ROLES_MAP[row.actionType]

          return (
            <div className="flex flex-col gap-2 px-1 py-3" data-cell-click-ignore>
              {availableRoles.map((role) => {
                const roleData = projectRoles.find((pr) => pr.role_key === role.roleKey)
                const hasUsers = roleData && roleData.users.length > 0
                const isChecked = row.signatures.includes(role.roleKey)

                return (
                  <div key={role.roleKey} className="flex items-center gap-1.5">
                    <Switch
                      size="sm"
                      checked={isChecked}
                      disabled={!hasUsers}
                      onCheckedChange={(checked) =>
                        updateRule(row.actionType, (current) => {
                          const nextSigs = new Set(current.signatures)
                          if (checked) {
                            nextSigs.add(role.roleKey)
                          } else {
                            nextSigs.delete(role.roleKey)
                          }
                          return { ...current, signatures: Array.from(nextSigs) }
                        })
                      }
                    />
                    <span
                      className={`text-[10px] leading-none ${
                        hasUsers ? "text-slate-200" : "text-slate-500"
                      }`}
                      title={!hasUsers ? "No users assigned to this role in this project" : ""}
                    >
                      {role.roleName}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        },
      },
    ],
    [projectRoles, updateRule]
  )

  const handleSave = async () => {
    if (!projectId) return
    setSaving(true)

    const payload: ApprovalConfigurationData[] = ACTION_TYPES.map((type) => ({
      action_type: FRONTEND_TO_BACKEND_ACTION_TYPE[type],
      condition_value: config[type].cause,
      required_roles: config[type].signatures.join(","),
      is_active: true,
    }))

    try {
      await updateApprovalConfigs(projectId, payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-400">Loading configurations...</div>
  }

  return (
    <div className="w-full space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Approval Actions</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Edit directly in the table using the selectors and inputs in each row.
          </p>
        </div>

        <Button
          variant={saved ? "default" : "outline"}
          onClick={handleSave}
          disabled={saving}
          className={saved ? "bg-emerald-600 hover:bg-emerald-700" : undefined}
        >
          <Save className="mr-1 size-4" />
          {saving ? "Saving..." : saved ? "Saved" : "Save"}
        </Button>
      </div>

      <AgTable
        rowData={rowData}
        columnDefs={columnDefs}
        showRowNumberColumn={false}
        suppressCellClickAction
        height="auto"
        defaultColDef={{
          sortable: false,
          filter: false,
          resizable: false,
        }}
        gridOptions={{
          rowHeight: 88,
        }}
      />
    </div>
  )
}
