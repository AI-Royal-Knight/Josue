"use client"

import { useMemo, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import TableStat from "@/components/common/table-stat"

import VariationSummaryView from "./_components/VariationSummaryView"
import WhiteCardView from "./_components/WhiteCardView"
import ApplicationView from "./_components/ApplicationView"
import SelectProject from "@/components/shared/select-project"

type MonthlyTab = "variation-summary" | "white-card" | "application"

const variationTotals = {
  qty: "10000",
  labourCost: "£4,920.00",
  materialCost: "£5,610.00",
  valuationAmount: "£10,530.00",
  amountClaimed: "£9,525.00",
  clientCertifiedAmount: "£9,130.00",
  difference: "£395.00",
}

const summaryRows = [
  { label: "Variation QTY", value: variationTotals.qty },
  { label: "Variation Value", value: variationTotals.materialCost },
  { label: "Claimed Value", value: variationTotals.amountClaimed },
]

export default function Page() {
  const [selectedProject, setSelectedProject] = useState("project-a")
  const [activeTab, setActiveTab] = useState<MonthlyTab>("variation-summary")

  const content = useMemo(() => {
    if (activeTab === "variation-summary") return <VariationSummaryView />
    if (activeTab === "white-card") return <WhiteCardView />
    return <ApplicationView />
  }, [activeTab])

  return (
    <div className="w-full space-y-6 p-6">
      <h2 className="text-2xl font-semibold">Monthly Application</h2>

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
        <SelectProject />
      </div>

      {content}
    </div>
  )
}
