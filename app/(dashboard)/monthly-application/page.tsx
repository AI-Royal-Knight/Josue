"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

import VariationSummaryView from "./_components/VariationSummaryView"
import WhiteCardView from "./_components/WhiteCardView"
import ApplicationView from "./_components/ApplicationView"
import SelectProject from "@/components/shared/select-project"
import TableStat from "@/components/common/table-stat"
import { ExportCsvButton } from "@/components/common/export-csv-button"
import { formatGBP } from "../variations/utils"
import { getMonthlyApplications, MonthlyApplicationApi } from "@/lib/api/monthly-application"

type MonthlyTab = "variation-summary" | "white-card" | "application"

export default function Page() {
  const [activeTab, setActiveTab] = useState<MonthlyTab>("variation-summary")
  const [selectedProject, setSelectedProject] = useState("")
  const [applications, setApplications] = useState<MonthlyApplicationApi[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedProject || selectedProject === "none") {
      setApplications([])
      return
    }

    async function load() {
      setLoading(true)
      try {
        const res = await getMonthlyApplications(selectedProject)
        setApplications(res.monthly_applications)
      } catch (e) {
        console.error("Failed to load applications", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedProject])

  const latestApp = applications.length > 0 ? applications[0] : null
  const previousApp = applications.length > 1 ? applications[1] : null

  // Calculate Net Application correctly based on contract_works_total + variations_total - retention - discount
  const getNet = (app: MonthlyApplicationApi | null) => {
    if (!app) return 0
    const gross = parseFloat(app.contract_works_total) + parseFloat(app.variations_total)
    const retAmount = gross * (parseFloat(app.retention_percentage) / 100)
    const discAmount = gross * (parseFloat(app.discount_percentage) / 100)
    return gross - retAmount - discAmount
  }

  const currentNet = getNet(latestApp)
  const previousNet = getNet(previousApp)
  
  const contractWorksTotal = latestApp ? parseFloat(latestApp.contract_works_total) : 0
  const variationsTotal = latestApp ? parseFloat(latestApp.variations_total) : 0
  const currentGross = contractWorksTotal + variationsTotal
  const retentionHold = latestApp ? currentGross * (parseFloat(latestApp.retention_percentage) / 100) : 0

  const summaryRows = [
    {
      label: "Previous Month claim",
      value: formatGBP(previousNet),
      valueColor: "yellow" as const,
    },
    {
      label: "This Months claim",
      value: formatGBP(currentNet),
      valueColor: "green" as const,
    },
    {
      label: "Retention hold",
      value: formatGBP(retentionHold),
      valueColor: "red" as const,
    },
  ]

  const content = useMemo(() => {
    if (!selectedProject || selectedProject === "none") return <div className="text-slate-400 p-8 text-center border border-white/10 mt-4 rounded">Please select a project to view application details.</div>
    if (activeTab === "variation-summary") return <VariationSummaryView projectId={selectedProject} />
    if (activeTab === "white-card") return <WhiteCardView projectId={selectedProject} />
    return <ApplicationView projectId={selectedProject} latestApp={latestApp} previousApp={previousApp} applications={applications} setApplications={setApplications} />
  }, [activeTab, selectedProject, latestApp, previousApp, applications])

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
          <TableStat summaryRows={summaryRows} />
        </div>
      </div>

      <div className="flex items-end justify-end">
        <ExportCsvButton
          columns={[
            { header: "Metric", field: "label" },
            { header: "Value", field: "value" },
          ]}
          rows={summaryRows}
          fileName="monthly-application-summary.csv"
        />
      </div>
      {content}
    </div>
  )
}
