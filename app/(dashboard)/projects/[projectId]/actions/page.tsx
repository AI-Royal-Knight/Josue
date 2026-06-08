"use client"

import { useCallback, useMemo, useState } from "react"
import { type ColDef } from "ag-grid-community"
import { Save } from "lucide-react"
import { AgTable } from "@/components/common/AgTable"
import MultiSelectInput, {
  type MultiSelectInputOption,
} from "@/components/multi-select-input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import MultipleSelector from "@/components/ui/multiselect"
import type { Option } from "@/components/ui/multiselect"
import {
  Label,
} from "@/components/ui/label"

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
  "Supervisor",
  "Contracts Manager",
  "Project Director",
  "Managing Director",
  "Procurement",
  "Commercial Manager",
] as const

type ApprovalRule = {
  cause: string
  signatures: string[]
  toggleStates: boolean[]
}

type ActionsConfig = Record<ActionType, ApprovalRule>

type StoredApprovalRule = {
  cause?: unknown
  signatures?: unknown
  toggleStates?: unknown
}

type StoredActionsConfig = Partial<Record<ActionType, StoredApprovalRule>>

type ActionRow = {
  actionType: ActionType
  cause: string
  signatures: string[]
  toggleStates: boolean[]
}

const STORAGE_KEY = "tresta:project-actions"

const DEFAULT_ACTIONS_CONFIG: ActionsConfig = {
  "User Invoices": {
    cause: ">£2000",
    signatures: ["Supervisor", "Contracts Manager"],
    toggleStates: [false, false],
  },
  "Proforma Nr Invoices": {
    cause: "ALL",
    signatures: [
      "Supervisor",
      "Contracts Manager",
      "Project Director",
      "Managing Director",
    ],
    toggleStates: [false, false, false, false],
  },
  "User Variations Invoices": {
    cause: "ALL",
    signatures: [
      "Supervisor",
      "Contracts Manager",
      "Project Director",
      "Managing Director",
    ],
    toggleStates: [false, false, false, false],
  },
  "Supplier Invoices": {
    cause: ">£50,000.00",
    signatures: ["Procurement", "Managing Director"],
    toggleStates: [false, false],
  },
  "Purchase orders": {
    cause: ">£50,000.00",
    signatures: ["Procurement", "Managing Director"],
    toggleStates: [false, false],
  },
  Variations: {
    cause: ">£2000",
    signatures: ["Commercial Manager", "Project Director"],
    toggleStates: [false, false],
  },
}

function cloneConfig(config: ActionsConfig): ActionsConfig {
  return ACTION_TYPES.reduce((next, actionType) => {
    next[actionType] = {
      cause: config[actionType].cause,
      signatures: [...config[actionType].signatures],
      toggleStates: [...config[actionType].toggleStates],
    }
    return next
  }, {} as ActionsConfig)
}

function normalizeSignatures(signatures: unknown): string[] {
  if (Array.isArray(signatures)) {
    return signatures
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean)
  }

  if (typeof signatures === "string") {
    return signatures
      .split("/")
      .map((value) => value.trim())
      .filter(Boolean)
  }

  return []
}

function parseStoredConfig(rawValue: string | null): ActionsConfig {
  const base = cloneConfig(DEFAULT_ACTIONS_CONFIG)
  if (!rawValue) return base

  try {
    const parsed = JSON.parse(rawValue) as StoredActionsConfig

    ACTION_TYPES.forEach((actionType) => {
      const storedRule = parsed[actionType]
      if (!storedRule) return

      const cause = storedRule.cause
      if (typeof cause === "string") {
        base[actionType].cause = cause
      }

      const signatures = normalizeSignatures(storedRule.signatures)
      if (signatures.length > 0) {
        base[actionType].signatures = signatures
      }

      const toggleStates = storedRule.toggleStates
      if (Array.isArray(toggleStates)) {
        base[actionType].toggleStates = toggleStates.filter(
          (t): t is boolean => typeof t === "boolean"
        )
      }

      // Ensure toggleStates matches signatures length
      // Handles backward compat with old `toggles: number` format
      if (base[actionType].toggleStates.length !== base[actionType].signatures.length) {
        base[actionType].toggleStates = base[actionType].signatures.map(
          () => false
        )
      }
    })

    return base
  } catch {
    return base
  }
}

export default function ActionsPage() {
  const [config, setConfig] = useState<ActionsConfig>(() => {
    if (typeof window === "undefined") return cloneConfig(DEFAULT_ACTIONS_CONFIG)
    return parseStoredConfig(window.localStorage.getItem(STORAGE_KEY))
  })
  const [saved, setSaved] = useState(false)

  const signatureOptions = useMemo<MultiSelectInputOption[]>(
    () =>
      SIGNATURE_OPTIONS.map((signature) => ({
        label: signature,
        value: signature,
      })),
    []
  )

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
        toggleStates: config[actionType].toggleStates,
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

          const causeOptions: Option[] = CAUSE_OPTIONS.map((c) => ({
            label: c,
            value: c,
          }))

          const selectedValue: Option[] = [{ label: row.cause, value: row.cause }]

          return (
            <div className="min-w-[200px]" data-cell-click-ignore>
              <div className="relative z-40">
                <Label className="sr-only">Cause</Label>
                <MultipleSelector
                  commandProps={{
                    label: "Cause",
                  }}
                  defaultOptions={causeOptions}
                  options={causeOptions}
                  value={selectedValue}
                  maxSelected={1}
                  creatable
                  hideClearAllButton
                  hidePlaceholderWhenSelected
                  placeholder="Select or type cause…"
                  onChange={(selected) => {
                    if (selected.length === 0) return
                    updateRule(row.actionType, (current) => ({
                      ...current,
                      cause: selected[0].value,
                    }))
                  }}
                  badgeClassName="max-w-full truncate"
                  inputProps={{
                    className: "text-xs",
                  }}
                />
              </div>
            </div>
          )
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

          return (
            <div className="relative z-30 min-w-[320px]" data-cell-click-ignore>
              <MultiSelectInput
                options={signatureOptions}
                value={row.signatures}
                onChange={(nextSignatures) =>
                  updateRule(row.actionType, (current) => {
                    // Auto-resize toggleStates to match signature count
                    const newToggleStates = nextSignatures.map(
                      (_, i) => current.toggleStates[i] ?? false
                    )
                    return {
                      ...current,
                      signatures: nextSignatures,
                      toggleStates: newToggleStates,
                    }
                  })
                }
                placeholder="Select signatures or type to add"
                creatable
              />
            </div>
          )
        },
      },
      {
        headerName: "Toggles",
        field: "toggleStates",
        minWidth: 240,
        flex: 1.5,
        cellRenderer: (params: { data?: ActionRow }) => {
          const row = params.data
          if (!row) return null

          return (
            <div className="flex flex-wrap items-center gap-2 px-1" data-cell-click-ignore>
              {row.toggleStates.map((toggled, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5"
                >
                  <Switch
                    size="sm"
                    checked={toggled}
                    onCheckedChange={(checked) =>
                      updateRule(row.actionType, (current) => {
                        const next = [...current.toggleStates]
                        next[idx] = checked
                        return { ...current, toggleStates: next }
                      })
                    }
                  />
                  <span className="text-[10px] leading-none text-slate-400">
                    {row.signatures[idx] ?? `#${idx + 1}`}
                  </span>
                </div>
              ))}
              {row.toggleStates.length === 0 && (
                <span className="text-[11px] text-slate-500 italic">
                  No toggles
                </span>
              )}
            </div>
          )
        },
      },
    ],
    [signatureOptions, updateRule]
  )

  const handleSave = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // ignore write failures
    }
  }

  return (
    <div className="w-full space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            Approval Actions
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Edit directly in the table using the selectors and inputs in each
            row.
          </p>
        </div>

        <Button
          variant={saved ? "default" : "outline"}
          onClick={handleSave}
          className={saved ? "bg-emerald-600 hover:bg-emerald-700" : undefined}
        >
          <Save className="mr-1 size-4" />
          {saved ? "Saved" : "Save"}
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
