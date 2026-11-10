"use client"

import { useMemo, useState, Suspense, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

import VariationSummaryView from "./_components/VariationSummaryView"
import WhiteCardView from "./_components/WhiteCardView"
import ApplicationView from "./_components/ApplicationView"
import SelectProject from "@/components/shared/select-project"
import TableStat from "@/components/common/table-stat"
import { ExportCsvButton } from "@/components/common/export-csv-button"
import { getMonthlyApplications, CurrentDraft, MonthlyApplicationApi } from "@/lib/api/monthly-application"
import { formatCurrency } from "@/lib/utils"

type MonthlyTab = "variation-summary" | "white-card" | "application"

function MonthlyApplicationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const tabParam = searchParams.get("tab") as MonthlyTab
  const activeTab: MonthlyTab = ["variation-summary", "white-card", "application"].includes(tabParam) 
    ? tabParam 
    : "variation-summary"

  const setActiveTab = (tab: MonthlyTab) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const [selectedProject, setSelectedProject] = useState<string>("")
  const [applications, setApplications] = useState<MonthlyApplicationApi[]>([])
  const [draft, setDraft] = useState<CurrentDraft | null>(null)

  useEffect(() => {
    if (!selectedProject) return
    async function loadData() {
      try {
        const res = await getMonthlyApplications(selectedProject)
        setApplications(res.monthly_applications || [])
        setDraft(res.current_draft || null)
      } catch (e) {
        console.error("Failed to load summary stats", e)
      }
    }
    loadData()
  }, [selectedProject])

  const prevClaim = applications.length > 0 ? parseFloat(applications[0].amount_claimed || "0") : 0
  const thisMonthClaim = Number(draft?.gross_total || 0)
  const retentionHold = thisMonthClaim > 0 ? thisMonthClaim * 0.025 : 0
  
  const content = useMemo(() => {
    if (!selectedProject) {
      return <div className="p-8 text-center text-slate-400 border border-white/10 rounded-lg mt-6">Please select a project from the dropdown above first.</div>
    }
    
    if (activeTab === "variation-summary") return <VariationSummaryView projectId={selectedProject} />
    if (activeTab === "white-card") return <WhiteCardView projectId={selectedProject} />
    return <ApplicationView projectId={selectedProject} />
  }, [activeTab, selectedProject])

  return (
    <div className="w-full space-y-4 p-6">
      <h2 className="text-2xl font-semibold">Monthly Application</h2>

      <SelectProject value={selectedProject} onChange={setSelectedProject} />
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={
                activeTab === "variation-summary" ? "default" : "secondary"
              }
              onClick={() => setActiveTab("variation-summary")}
              className={
                activeTab === "variation-summary"
                  ? "bg-[#2a61d8]"
                  : "bg-[#1d2c46] text-slate-300"
              }
            >
              Variation Summary
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeTab === "white-card" ? "default" : "secondary"}
              onClick={() => setActiveTab("white-card")}
              className={
                activeTab === "white-card"
                  ? "bg-[#2a61d8]"
                  : "bg-[#1d2c46] text-slate-300"
              }
            >
              White Card
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeTab === "application" ? "default" : "secondary"}
              onClick={() => setActiveTab("application")}
              className={
                activeTab === "application"
                  ? "bg-[#2a61d8]"
                  : "bg-[#1d2c46] text-slate-300"
              }
            >
              Application
            </Button>
          </div>
          <TableStat
            summaryRows={[
              {
                label: "Previous Month claim",
                value: formatCurrency(prevClaim),
                valueColor: "yellow",
              },
              {
                label: "This Months claim",
                value: formatCurrency(thisMonthClaim),
                valueColor: "green",
              },
              {
                label: "Retention hold",
                value: formatCurrency(retentionHold),
                valueColor: "red",
              },
            ]}
          />
        </div>
      </div>

      {activeTab !== "white-card" && (
        <div className="flex items-end justify-end">
          <ExportCsvButton
            columns={[
              { header: "Metric", field: "label" },
              { header: "Value", field: "value" },
            ]}
            rows={[
              {
                label: "Previous Month claim",
                value: formatCurrency(prevClaim),
                valueColor: "yellow",
              },
              {
                label: "This Months claim",
                value: formatCurrency(thisMonthClaim),
                valueColor: "green",
              },
              {
                label: "Retention hold",
                value: formatCurrency(retentionHold),
                valueColor: "red",
              },
            ]}
            fileName="monthly-application-summary.csv"
          />
        </div>
      )}
      {content}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <MonthlyApplicationContent />
    </Suspense>
  )
}
