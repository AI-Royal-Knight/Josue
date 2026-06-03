"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

import VariationSummaryView from "./_components/VariationSummaryView"
import WhiteCardView from "./_components/WhiteCardView"
import ApplicationView from "./_components/ApplicationView"
import SelectProject from "@/components/shared/select-project"
import TableStat from "@/components/common/table-stat"
import { ExportCsvButton } from "@/components/common/export-csv-button"

type MonthlyTab = "variation-summary" | "white-card" | "application"

export default function Page() {
  const [activeTab, setActiveTab] = useState<MonthlyTab>("variation-summary")

  const content = useMemo(() => {
    if (activeTab === "variation-summary") return <VariationSummaryView />
    if (activeTab === "white-card") return <WhiteCardView />
    return <ApplicationView />
  }, [activeTab])

  return (
    <div className="w-full space-y-4 p-6">
      <h2 className="text-2xl font-semibold">Monthly Application</h2>

      <SelectProject />
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
                value: "£12,100",
                valueColor: "yellow",
              },
              {
                label: "This Months claim",
                value: "£12,100",
                valueColor: "green",
              },
            ]}
          />
        </div>
      </div>

      <div className="flex items-end justify-end">
        <ExportCsvButton
          columns={[
            { headerName: "Metric", field: "label" },
            { headerName: "Value", field: "value" },
          ]}
          rows={[
            {
              label: "Previous Month claim",
              value: "£12,100",
              valueColor: "yellow",
            },
            {
              label: "This Months claim",
              value: "£12,100",
              valueColor: "green",
            },
          ]}
          fileName="monthly-application-summary.csv"
        />
      </div>
      {content}
    </div>
  )
}
