"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import type { ColDef } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import { File, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getVariations, VariationApi } from "@/lib/api/variations"
import { VariationRow } from "@/app/(dashboard)/variations/types"
import { formatGBP, buildVariationDocHtml } from "@/app/(dashboard)/variations/utils"
import ViewVariationDialog from "@/app/(dashboard)/variations/_components/ViewVariationDialog"

type VariationSummaryRow = {
  id: string
  no: string
  siteInstructionNumber: string
  evidence: string
  evidence_url?: string | null
  date: string
  variationSheetNumber: string
  workArea: string
  workSection: string
  descriptionOfWorks: string
  labourCost: string
  materialCost: string
  valuationAmount: string
  percentClaimed: string
  amountClaimed: string
  clientCertifiedAmount: string
  difference: string
  correspondingNoticeNo: string
  clientQsComment: string
  comments: string
  rawVariation: VariationRow
}

function apiToVariationRow(v: VariationApi): VariationRow {
  return {
    id: v.id,
    voNo: v.vo_number,
    date: v.date,
    variationSheetNumber: v.variation_sheet_number,
    project: v.project_name,
    projectId: v.project,
    siteInstructionNo: v.site_instruction_no,
    descriptionOfWorks: v.description_of_works,
    createdBy: v.created_by_name,
    lines: (v.lines || []).map((l: any) => ({
      no: "",
      siteInstruction: l.site_instruction,
      workArea: l.work_area,
      workSection: l.work_section,
      labour: parseFloat(l.labour || "0"),
      labourTarget: parseFloat(l.labour_target || "0"),
      material: parseFloat(l.material || "0"),
      qty: parseFloat(l.qty || "0"),
    })),
    totalAmount: parseFloat(v.total_amount || "0"),
    evidence: "",
    comments: v.comments,
    assignedUserIds: v.assigned_user_ids || [],
    approvalStatus:
      v.approval_status === "approved"
        ? "Approved"
        : v.approval_status === "rejected"
        ? "Rejected"
        : "Pending",
    approvedBy: v.approved_by_name,
    submittedToClient: v.submitted_to_client,
    signedByClient: v.signed_by_client,
    clientName: v.client_name || "",
    clientEmail: v.client_email || "",
    attentionOf: v.attention_of || "",
    sigCommercialDepartment: v.commercial_department_approved || false,
    sigCommercialDepartmentDate: v.commercial_department_approved_date || null,
    sigContractsManager: v.contracts_manager_approved || false,
    sigContractsManagerDate: v.contracts_manager_approved_date || null,
    sigProjectDirector: v.project_director_approved || false,
    sigProjectDirectorDate: v.project_director_approved_date || null,
    sigManagingDirector: v.managing_director_approved || false,
    sigManagingDirectorDate: v.managing_director_approved_date || null,
    fullyApproved: v.fully_approved || false,
    evidence_url: (v as any).evidence_url || null,
  }
}

export default function VariationSummaryView({ projectId }: { projectId: string }) {
  const [rows, setRows] = useState<VariationSummaryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVariation, setSelectedVariation] = useState<VariationRow | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchVariations = useCallback(async () => {
    if (!projectId) {
      setRows([])
      return
    }
    setLoading(true)
    try {
      const res = await getVariations(projectId)
      const list = res.variations || []

      // Filter: Only variations that have been reviewed and approved by commercial manager/department AND added to summary
      const approvedAndAdded = list.filter((v: VariationApi) => {
        const isApproved = v.commercial_department_approved || v.approval_status === "approved"
        const isAddedToSummary = v.submitted_to_client // marked as added to variation summary / submitted to client
        return isApproved && isAddedToSummary
      })

      const mapped: VariationSummaryRow[] = approvedAndAdded.map((v: VariationApi, index: number) => {
        const vRow = apiToVariationRow(v)
        const totalAmt = parseFloat(String(v.total_amount || "0"))
        const amtClaimed = parseFloat(String(v.amount_claimed || "0"))
        const certAmt = parseFloat(String(v.client_certified_amount || "0"))
        const diff = amtClaimed - certAmt

        return {
          id: v.id,
          no: v.vo_number || `VO-${String(index + 1).padStart(3, "0")}`,
          siteInstructionNumber: v.site_instruction_no || "—",
          evidence: v.evidence_url ? "Yes" : "No",
          evidence_url: v.evidence_url,
          date: v.date || "",
          variationSheetNumber: v.variation_sheet_number || "—",
          workArea: (v as any).workArea || "—",
          workSection: (v as any).workSection || "—",
          descriptionOfWorks: v.description_of_works || "—",
          labourCost: formatGBP(vRow.lines.reduce((s, l) => s + l.labour * l.qty, 0)),
          materialCost: formatGBP(vRow.lines.reduce((s, l) => s + l.material * l.qty, 0)),
          valuationAmount: formatGBP(totalAmt),
          percentClaimed: v.percent_claimed ? `${v.percent_claimed}%` : "0%",
          amountClaimed: formatGBP(amtClaimed),
          clientCertifiedAmount: formatGBP(certAmt),
          difference: formatGBP(diff),
          correspondingNoticeNo: v.corresponding_notice_no || "—",
          clientQsComment: v.client_qs_comment || "—",
          comments: v.comments || "—",
          rawVariation: vRow,
        }
      })

      setRows(mapped)
    } catch (err) {
      console.error("Failed to fetch variations for summary", err)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchVariations()
  }, [fetchVariations])

  const downloadDoc = useCallback((variation: VariationRow) => {
    const html = buildVariationDocHtml(variation)
    const blob = new Blob([html], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${variation.voNo || "variation"}.doc`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleOpenVO = useCallback((row: VariationSummaryRow) => {
    setSelectedVariation(row.rawVariation)
    setDialogOpen(true)
  }, [])

  const totalRow = useMemo<VariationSummaryRow | null>(() => {
    if (rows.length === 0) return null

    const parseFloatClean = (val: string) => {
      const n = parseFloat(val.replace(/[^0-9.-]+/g, ""))
      return isNaN(n) ? 0 : n
    }

    const totalValuation = rows.reduce((s, r) => s + parseFloatClean(r.valuationAmount), 0)
    const totalClaimed = rows.reduce((s, r) => s + parseFloatClean(r.amountClaimed), 0)
    const totalCertified = rows.reduce((s, r) => s + parseFloatClean(r.clientCertifiedAmount), 0)
    const totalDiff = totalClaimed - totalCertified

    return {
      id: "total",
      no: "",
      siteInstructionNumber: "TOTAL",
      evidence: "",
      date: "",
      variationSheetNumber: "",
      workArea: "",
      workSection: "",
      descriptionOfWorks: "",
      labourCost: "",
      materialCost: "",
      valuationAmount: formatGBP(totalValuation),
      percentClaimed: "",
      amountClaimed: formatGBP(totalClaimed),
      clientCertifiedAmount: formatGBP(totalCertified),
      difference: formatGBP(totalDiff),
      correspondingNoticeNo: "",
      clientQsComment: "",
      comments: "",
      rawVariation: {} as VariationRow,
    }
  }, [rows])

  const columns = useMemo<ColDef<VariationSummaryRow>[]>(
    () => [
      {
        headerName: "Variation Number",
        field: "no",
        minWidth: 160,
        editable: false,
        cellRenderer: (params: { data: VariationSummaryRow; value: string }) => {
          if (!params.data || params.data.id === "total") return params.value
          return (
            <button
              type="button"
              onClick={() => handleOpenVO(params.data)}
              className="text-blue-400 hover:text-blue-300 font-semibold underline text-left"
            >
              {params.value}
            </button>
          )
        },
      },
      {
        headerName: "Site Instruction Number",
        field: "siteInstructionNumber",
        minWidth: 180,
        editable: false,
      },
      {
        headerName: "Evidence",
        field: "evidence",
        minWidth: 100,
        editable: false,
        cellRenderer: (params: { data: VariationSummaryRow }) => {
          if (!params.data || params.data.id === "total") return null
          if (params.data.evidence_url) {
            return (
              <a
                href={params.data.evidence_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 inline-flex items-center text-blue-400 hover:text-blue-300"
                title="View attached evidence"
              >
                <File size={16} />
              </a>
            )
          }
          return <span className="text-slate-500">—</span>
        },
      },
      {
        headerName: "Date",
        field: "date",
        minWidth: 120,
        editable: false,
      },
      {
        headerName: "Description of Works",
        field: "descriptionOfWorks",
        minWidth: 260,
        editable: false,
      },
      {
        headerName: "Valuation Amount",
        field: "valuationAmount",
        minWidth: 140,
        editable: false,
      },
      {
        headerName: "% Claimed",
        field: "percentClaimed",
        minWidth: 110,
        editable: false,
      },
      {
        headerName: "Amount Claimed",
        field: "amountClaimed",
        minWidth: 140,
        editable: false,
      },
      {
        headerName: "Client Certified Amount",
        field: "clientCertifiedAmount",
        minWidth: 160,
        editable: false,
      },
      {
        headerName: "Difference",
        field: "difference",
        minWidth: 120,
        editable: false,
      },
      {
        headerName: "Corresponding Client Payment Notice No",
        field: "correspondingNoticeNo",
        minWidth: 220,
        editable: false,
      },
      {
        headerName: "Client QS Comment",
        field: "clientQsComment",
        minWidth: 200,
        editable: false,
      },
      {
        headerName: "Comments",
        field: "comments",
        minWidth: 200,
        editable: false,
      },
      {
        headerName: "Action",
        colId: "action",
        minWidth: 120,
        pinned: "right",
        editable: false,
        sortable: false,
        filter: false,
        cellRenderer: (params: { data: VariationSummaryRow }) => {
          if (!params.data || params.data.id === "total") return null
          return (
            <div className="flex items-center gap-1.5 h-full">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 gap-1"
                onClick={() => handleOpenVO(params.data)}
              >
                <Eye size={13} />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30 gap-1"
                onClick={() => downloadDoc(params.data.rawVariation)}
              >
                <Download size={13} />
                Doc
              </Button>
            </div>
          )
        },
      },
    ],
    [handleOpenVO, downloadDoc]
  )

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-white/10 rounded-lg">
        <div className="min-w-[1200px]">
          <AgTable
            rowData={rows}
            columnDefs={columns}
            loading={loading}
            noRowsText="No variations have been reviewed, approved, and added to the variation summary yet."
            gridOptions={{
              suppressCellFocus: true,
              enableCellTextSelection: true,
              pinnedBottomRowData: totalRow ? [totalRow] : [],
              getRowStyle: (params: any) => {
                if (params.node?.isRowPinned && params.node.isRowPinned()) {
                  return {
                    fontWeight: "bold",
                    backgroundColor: "#1E3A8A80",
                  } as any
                }
                return {}
              },
              getRowClass: (params) =>
                params.node?.isRowPinned && params.node.isRowPinned() ? "pinned-row" : "",
              defaultColDef: {
                flex: 1,
                minWidth: 120,
                editable: false,
                sortable: true,
                filter: false,
              },
            }}
            height="auto"
          />
        </div>
      </div>

      <ViewVariationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        variation={selectedVariation}
        onDownload={downloadDoc}
        onSubmitToClient={() => {}}
        isSubmitting={false}
      />
    </div>
  )
}
