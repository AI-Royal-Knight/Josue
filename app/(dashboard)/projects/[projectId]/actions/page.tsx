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
  "User Clock in",
] as const

type ActionType = (typeof ACTION_TYPES)[number]

const ACTION_ROLES_MAP: Record<ActionType, { roleKey: string; roleName: string }[]> = {
  "User Invoices": [
    { roleKey: "supervisor", roleName: "Supervisor" },
    { roleKey: "manager", roleName: "Manager" },
    { roleKey: "contracts_manager", roleName: "Contracts Manager" },
    { roleKey: "project_director", roleName: "Project Director" },
    { roleKey: "managing_director", roleName: "Managing Director" },
  ],
  "Proforma Nr Invoices": [
    { roleKey: "manager", roleName: "Manager" },
    { roleKey: "contracts_manager", roleName: "Contracts Manager" },
    { roleKey: "project_director", roleName: "Project Director" },
    { roleKey: "managing_director", roleName: "Managing Director" },
    { roleKey: "commercial_department", roleName: "Commercial Manager" },
  ],
  "User Variations Invoices": [
    { roleKey: "manager", roleName: "Manager" },
    { roleKey: "contracts_manager", roleName: "Contracts Manager" },
    { roleKey: "project_director", roleName: "Project Director" },
    { roleKey: "managing_director", roleName: "Managing Director" },
    { roleKey: "commercial_department", roleName: "Commercial Manager" },
  ],
  "Supplier Invoices": [
    { roleKey: "procurement_department", roleName: "Procurement" },
    { roleKey: "manager", roleName: "Manager" },
    { roleKey: "contracts_manager", roleName: "Contracts Manager" },
    { roleKey: "project_director", roleName: "Project Director" },
    { roleKey: "managing_director", roleName: "Managing Director" },
    { roleKey: "commercial_department", roleName: "Commercial Manager" },
  ],
  "Purchase orders": [
    { roleKey: "procurement_department", roleName: "Procurement" },
    { roleKey: "contracts_manager", roleName: "Contracts Manager" },
    { roleKey: "project_director", roleName: "Project Director" },
    { roleKey: "managing_director", roleName: "Managing Director" },
    { roleKey: "commercial_department", roleName: "Commercial Manager" },
  ],
  Variations: [
    { roleKey: "commercial_department", roleName: "Commercial Manager" },
    { roleKey: "contracts_manager", roleName: "Contracts Manager" },
    { roleKey: "project_director", roleName: "Project Director" },
    { roleKey: "managing_director", roleName: "Managing Director" },
  ],
  "User Clock in": [],
}

type ApprovalRule = {
  cause: string
  signatures: string[] // List of active role keys
  roleThresholds: Record<string, number>
}

type ActionsConfig = Record<ActionType, ApprovalRule>

type ActionRow = {
  actionType: ActionType
  cause: string
  signatures: string[]
  roleThresholds: Record<string, number>
}

const FRONTEND_TO_BACKEND_ACTION_TYPE: Record<ActionType, string> = {
  "User Invoices": "user_invoice",
  "Proforma Nr Invoices": "proforma",
  "User Variations Invoices": "user_variations_invoice",
  "Supplier Invoices": "supplier_invoice",
  "Purchase orders": "purchase_order",
  Variations: "variations",
  "User Clock in": "user_clock_in",
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
  "User Invoices": { cause: "", signatures: [], roleThresholds: {} },
  "Proforma Nr Invoices": { cause: "", signatures: [], roleThresholds: {} },
  "User Variations Invoices": { cause: "", signatures: [], roleThresholds: {} },
  "Supplier Invoices": { cause: "", signatures: [], roleThresholds: {} },
  "Purchase orders": { cause: "", signatures: [], roleThresholds: {} },
  Variations: { cause: "", signatures: [], roleThresholds: {} },
  "User Clock in": { cause: "", signatures: ["enabled"], roleThresholds: {} },
}

function cloneConfig(config: ActionsConfig): ActionsConfig {
  return ACTION_TYPES.reduce((next, actionType) => {
    next[actionType] = {
      cause: config[actionType].cause,
      signatures: [...config[actionType].signatures],
      roleThresholds: { ...config[actionType].roleThresholds },
    }
    return next
  }, {} as ActionsConfig)
}

function ThresholdInput({
  initialValue,
  onSave,
}: {
  initialValue: number | undefined
  onSave: (val: number) => void
}) {
  const [value, setValue] = useState(initialValue !== undefined ? String(initialValue) : "1")

  // Sync if the row data changes externally
  useEffect(() => {
    setValue(initialValue !== undefined ? String(initialValue) : "1")
  }, [initialValue])

  return (
    <Input
      type="number"
      min="1"
      className="h-6 w-16 px-1.5 text-[11px] font-medium text-right bg-slate-900/50 border-slate-700 focus-visible:ring-1 focus-visible:ring-emerald-500/50"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        const valStr = value
        const parsed = parseFloat(valStr)
        const budget = isNaN(parsed) ? 1 : Math.max(1, parsed)
        if (budget !== initialValue) {
          onSave(budget)
        }
        // Always reset UI to the sanitized budget if they typed something invalid
        if (isNaN(parsed) || parsed < 1) {
          setValue(String(budget))
        }
      }}
    />
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
              signatures: item.action_type === "user_clock_in"
                ? (item.is_active ? ["enabled"] : [])
                : (item.required_roles
                    ? item.required_roles
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : []),
              roleThresholds: item.role_thresholds || {},
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
        roleThresholds: config[actionType].roleThresholds,
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
        headerName: "Signatures",
        field: "signatures",
        minWidth: 260,
        flex: 1.5,
        cellRenderer: (params: { data?: ActionRow }) => {
          const row = params.data
          if (!row) return null

          if (row.actionType === "User Clock in") {
            return <div className="text-xs text-slate-500 italic mt-4 px-2">N/A</div>
          }

          // Find active roles
          const activeRoles = ACTION_ROLES_MAP[row.actionType].filter((r) =>
            row.signatures.includes(r.roleKey)
          )

          if (activeRoles.length === 0) {
            return <div className="text-xs text-slate-500 italic mt-4">No signatures assigned</div>
          }

          return (
            <div className="relative z-30 w-full" data-cell-click-ignore>
              <div className="flex flex-col gap-1 py-3">
                {activeRoles.map((role) => {
                  const roleData = projectRoles.find((pr) => pr.role_key === role.roleKey)
                  const users = roleData?.users || []

                  if (users.length === 0) {
                    return (
                      <span key={role.roleKey} className="text-[11px] text-slate-400 break-words whitespace-normal leading-snug">
                        Pending assignment ({role.roleName})
                      </span>
                    )
                  }

                  return (
                    <span key={role.roleKey} className="text-xs text-slate-200 font-medium break-words whitespace-normal leading-snug">
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
        minWidth: 340,
        flex: 2.3,
        cellRenderer: (params: { data?: ActionRow }) => {
          const row = params.data
          if (!row) return null

          if (row.actionType === "User Clock in") {
            const isChecked = row.signatures.includes("enabled")
            return (
              <div className="flex flex-col gap-2 px-1 py-3" data-cell-click-ignore>
                <div className="flex items-center gap-2">
                  <Switch
                    size="sm"
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      updateRule(row.actionType, (current) => {
                        return { ...current, signatures: checked ? ["enabled"] : [] }
                      })
                    }}
                  />
                  <span className="text-[11px] font-medium leading-none whitespace-nowrap text-slate-200">
                    Enable User Clock In
                  </span>
                </div>
              </div>
            )
          }

          const availableRoles = ACTION_ROLES_MAP[row.actionType]

          return (
            <div className="flex flex-col gap-2 px-1 py-3" data-cell-click-ignore>
              {availableRoles.map((role) => {
                const roleData = projectRoles.find((pr) => pr.role_key === role.roleKey)
                const hasUsers = roleData && roleData.users.length > 0
                const isChecked = row.signatures.includes(role.roleKey)
                const threshold = row.roleThresholds?.[role.roleKey]

                return (
                  <div key={role.roleKey} className="flex items-center gap-2">
                    <Switch
                      size="sm"
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        updateRule(row.actionType, (current) => {
                          const nextSigs = new Set(current.signatures)
                          const nextThresholds = { ...current.roleThresholds }
                          
                          if (checked) {
                            nextSigs.add(role.roleKey)
                            nextThresholds[role.roleKey] = 1 // default to 1
                          } else {
                            nextSigs.delete(role.roleKey)
                            delete nextThresholds[role.roleKey]
                          }
                          return { ...current, signatures: Array.from(nextSigs), roleThresholds: nextThresholds }
                        })
                      }}
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium leading-none whitespace-nowrap text-slate-200">
                        {role.roleName}
                      </span>
                      {isChecked && (
                        <div className="flex items-center gap-1 ml-1 shrink-0">
                          <span className="text-[10px] text-slate-400">Min: £</span>
                          <ThresholdInput
                            initialValue={threshold}
                            onSave={(newBudget) => {
                              updateRule(row.actionType, (current) => {
                                const nextThresholds = { ...current.roleThresholds }
                                nextThresholds[role.roleKey] = newBudget
                                return { ...current, roleThresholds: nextThresholds }
                              })
                            }}
                          />
                        </div>
                      )}
                    </div>
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
      role_thresholds: config[type].roleThresholds,
      is_active: type === "User Clock in" ? config[type].signatures.includes("enabled") : true,
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
          getRowHeight: (params) => {
            const row = params.data as ActionRow | undefined;
            if (!row) return 88;
            const rolesCount = ACTION_ROLES_MAP[row.actionType]?.length || 0;
            return Math.max(88, rolesCount * 36 + 24); // 36px per toggle + 24px padding
          }
        }}
      />
    </div>
  )
}
