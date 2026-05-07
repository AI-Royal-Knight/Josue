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

type MonthlyTab = "variation-summary" | "white-card" | "application"

type VariationSummaryRow = {
  no: string
  siteInstructionNumber: string
  evidence: string
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
}

const summaryRows = [
  { label: "Variation QTY", value: "1000" },
  { label: "Variation Value", value: "400" },
  { label: "Claimed Value", value: "200" },
]

const variationRows: VariationSummaryRow[] = [
  {
    no: "1",
    siteInstructionNumber: "",
    evidence: "📄",
    date: "",
    variationSheetNumber: "",
    workArea: "",
    workSection: "",
    descriptionOfWorks: "",
    labourCost: "£",
    materialCost: "£",
    valuationAmount: "£570.00",
    percentClaimed: "%",
    amountClaimed: "£570.00",
    clientCertifiedAmount: "£",
    difference: "£0.00",
    correspondingNoticeNo: "",
    clientQsComment: "",
    comments: "",
  },
  {
    no: "2",
    siteInstructionNumber: "",
    evidence: "📄",
    date: "",
    variationSheetNumber: "",
    workArea: "",
    workSection: "",
    descriptionOfWorks: "",
    labourCost: "£",
    materialCost: "£",
    valuationAmount: "£570.00",
    percentClaimed: "%",
    amountClaimed: "£570.00",
    clientCertifiedAmount: "£",
    difference: "£0.00",
    correspondingNoticeNo: "",
    clientQsComment: "",
    comments: "",
  },
  {
    no: "3",
    siteInstructionNumber: "",
    evidence: "📄",
    date: "",
    variationSheetNumber: "",
    workArea: "",
    workSection: "",
    descriptionOfWorks: "",
    labourCost: "£",
    materialCost: "£",
    valuationAmount: "£570.00",
    percentClaimed: "%",
    amountClaimed: "£570.00",
    clientCertifiedAmount: "£",
    difference: "£0.00",
    correspondingNoticeNo: "",
    clientQsComment: "",
    comments: "",
  },
  {
    no: "4",
    siteInstructionNumber: "",
    evidence: "📄",
    date: "",
    variationSheetNumber: "",
    workArea: "",
    workSection: "",
    descriptionOfWorks: "",
    labourCost: "£",
    materialCost: "£",
    valuationAmount: "£570.00",
    percentClaimed: "%",
    amountClaimed: "£570.00",
    clientCertifiedAmount: "£",
    difference: "£0.00",
    correspondingNoticeNo: "",
    clientQsComment: "",
    comments: "",
  },
  {
    no: "5",
    siteInstructionNumber: "",
    evidence: "📄",
    date: "",
    variationSheetNumber: "",
    workArea: "",
    workSection: "",
    descriptionOfWorks: "",
    labourCost: "£",
    materialCost: "£",
    valuationAmount: "£570.00",
    percentClaimed: "%",
    amountClaimed: "£570.00",
    clientCertifiedAmount: "£",
    difference: "£0.00",
    correspondingNoticeNo: "",
    clientQsComment: "",
    comments: "",
  },
  {
    no: "6",
    siteInstructionNumber: "",
    evidence: "📄",
    date: "",
    variationSheetNumber: "",
    workArea: "",
    workSection: "",
    descriptionOfWorks: "",
    labourCost: "£",
    materialCost: "£",
    valuationAmount: "£570.00",
    percentClaimed: "%",
    amountClaimed: "£570.00",
    clientCertifiedAmount: "£",
    difference: "£0.00",
    correspondingNoticeNo: "",
    clientQsComment: "",
    comments: "",
  },
  {
    no: "7",
    siteInstructionNumber: "",
    evidence: "📄",
    date: "",
    variationSheetNumber: "",
    workArea: "",
    workSection: "",
    descriptionOfWorks: "",
    labourCost: "£",
    materialCost: "£",
    valuationAmount: "£570.00",
    percentClaimed: "%",
    amountClaimed: "£570.00",
    clientCertifiedAmount: "£",
    difference: "£0.00",
    correspondingNoticeNo: "",
    clientQsComment: "",
    comments: "",
  },
]

const variationTotals = {
  labourCost: "£4,920.00",
  materialCost: "£5,610.00",
  valuationAmount: "£10,530.00",
  amountClaimed: "£9,525.00",
  clientCertifiedAmount: "£9,130.00",
  difference: "£395.00",
}

function SummaryBox() {
  return (
    <div className="w-full max-w-[430px] overflow-hidden border border-[#18456a]">
      {summaryRows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[1fr_140px] border-b border-[#18456a] last:border-b-0"
        >
          <div className="bg-[#14663e] px-3 py-2 text-xs font-semibold text-slate-100">
            {row.label}
          </div>
          <div className="bg-[#14663e] px-3 py-2 text-xs font-semibold text-slate-100">
            {row.value}
          </div>
        </div>
      ))}
    </div>
  )
}

function VariationSummaryView() {
  return (
    <div className="overflow-x-auto border border-white/10">
      <table className="w-full min-w-[1900px] border-collapse text-xs text-slate-300">
        <thead className="bg-[#0f1d36] text-[11px] text-slate-200">
          <tr>
            <th className="border border-[#1d3150] px-2 py-2 text-left">No.</th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Site instruction number
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Evidence
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Date
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Variation Sheet Number
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Work area
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Work section
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Description of Works
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Labour cost
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Material Cost
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Valuation Amount
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              % Claimed
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Amount Claimed
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Client Certified Amount
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Difference
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Corresponding Client Payment Notice No
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Client QS Comment
            </th>
            <th className="border border-[#1d3150] px-2 py-2 text-left">
              Comments
            </th>
          </tr>
        </thead>
        <tbody>
          {variationRows.map((row) => (
            <tr key={row.no} className="bg-[#0a1730] even:bg-[#0a1a33]">
              <td className="border border-[#1d3150] px-2 py-1.5">{row.no}</td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.siteInstructionNumber}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5 text-[#4aa3ff]">
                {row.evidence}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.date}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.variationSheetNumber}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.workArea}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.workSection}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.descriptionOfWorks}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.labourCost}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.materialCost}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.valuationAmount}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.percentClaimed}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.amountClaimed}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.clientCertifiedAmount}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.difference}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.correspondingNoticeNo}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.clientQsComment}
              </td>
              <td className="border border-[#1d3150] px-2 py-1.5">
                {row.comments}
              </td>
            </tr>
          ))}
          <tr className="bg-[#1f3571] font-semibold text-slate-100">
            <td
              colSpan={8}
              className="border border-[#1d3150] px-2 py-2 text-center"
            >
              Totals
            </td>
            <td className="border border-[#1d3150] px-2 py-2">
              {variationTotals.labourCost}
            </td>
            <td className="border border-[#1d3150] px-2 py-2">
              {variationTotals.materialCost}
            </td>
            <td className="border border-[#1d3150] px-2 py-2">
              {variationTotals.valuationAmount}
            </td>
            <td className="border border-[#1d3150] px-2 py-2"></td>
            <td className="border border-[#1d3150] px-2 py-2">
              {variationTotals.amountClaimed}
            </td>
            <td className="border border-[#1d3150] px-2 py-2">
              {variationTotals.clientCertifiedAmount}
            </td>
            <td className="border border-[#1d3150] px-2 py-2 text-emerald-400">
              {variationTotals.difference}
            </td>
            <td className="border border-[#1d3150] px-2 py-2"></td>
            <td className="border border-[#1d3150] px-2 py-2"></td>
            <td className="border border-[#1d3150] px-2 py-2"></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function WhiteCardView() {
  const rows = Array.from({ length: 7 }).map((_, idx) => idx)

  return (
    <div className="overflow-x-auto border border-white/10">
      <table className="w-full min-w-[1400px] border-collapse text-xs text-slate-300">
        <tbody>
          <tr>
            <td
              rowSpan={9}
              className="w-[130px] border border-[#1d3150] bg-[#e3b000] px-3 py-4 text-center text-sm font-bold text-black"
            >
              APARTMENTS
            </td>
            <td
              colSpan={2}
              className="border border-[#1d3150] bg-[#1aa94a] px-3 py-2 text-center font-semibold text-black"
            >
              electrical
            </td>
            <td
              rowSpan={2}
              className="border border-[#1d3150] bg-[#1aa94a] px-3 py-2 text-center font-semibold text-black"
            >
              Project Value
            </td>
            <td
              colSpan={2}
              className="border border-[#1d3150] bg-[#1aa94a] px-3 py-2 text-center font-semibold text-black"
            >
              Electrical First Fix
            </td>
            <td
              rowSpan={2}
              className="border border-[#1d3150] bg-[#1aa94a] px-3 py-2 text-center font-semibold text-black"
            >
              Project Value
            </td>
            <td
              colSpan={2}
              className="border border-[#1d3150] bg-[#1aa94a] px-3 py-2 text-center font-semibold text-black"
            >
              Plumbing
            </td>
            <td
              rowSpan={2}
              className="border border-[#1d3150] bg-[#1aa94a] px-3 py-2 text-center font-semibold text-black"
            >
              Project Value
            </td>
          </tr>
          <tr className="bg-[#0c1c36] text-slate-400">
            <td className="border border-[#1d3150] px-3 py-1.5 text-center">
              Work section
            </td>
            <td className="border border-[#1d3150] px-3 py-1.5 text-center">
              Work area
            </td>
            <td className="border border-[#1d3150] px-3 py-1.5 text-center">
              Work section
            </td>
            <td className="border border-[#1d3150] px-3 py-1.5 text-center">
              Work area
            </td>
            <td className="border border-[#1d3150] px-3 py-1.5 text-center">
              Work section
            </td>
            <td className="border border-[#1d3150] px-3 py-1.5 text-center">
              Work area
            </td>
          </tr>
          {rows.map((idx) => (
            <tr key={`apt-${idx}`} className="bg-[#0a1730]">
              <td className="border border-[#1d3150] px-3 py-3"></td>
              <td className="border border-[#1d3150] px-3 py-3"></td>
              <td className="border border-[#1d3150] px-3 py-3"></td>
              <td className="border border-[#1d3150] px-3 py-3"></td>
              <td className="border border-[#1d3150] px-3 py-3"></td>
              <td className="border border-[#1d3150] px-3 py-3"></td>
              <td className="border border-[#1d3150] px-3 py-3"></td>
              <td className="border border-[#1d3150] px-3 py-3"></td>
              <td className="border border-[#1d3150] px-3 py-3"></td>
            </tr>
          ))}

          <tr>
            <td
              rowSpan={9}
              className="w-[130px] border border-[#1d3150] bg-[#e3b000] px-3 py-4 text-center text-sm font-bold text-black"
            >
              CORRIDORS
            </td>
            <td
              colSpan={2}
              className="border border-[#1d3150] bg-[#1aa94a] px-3 py-2 text-center font-semibold text-black"
            >
              electrical
            </td>
            <td
              rowSpan={2}
              className="border border-[#1d3150] bg-[#1aa94a] px-3 py-2 text-center font-semibold text-black"
            >
              Project Value
            </td>
            <td
              colSpan={2}
              className="border border-[#1d3150] bg-[#1aa94a] px-3 py-2 text-center font-semibold text-black"
            >
              Electrical First Fix
            </td>
            <td
              rowSpan={2}
              className="border border-[#1d3150] bg-[#1aa94a] px-3 py-2 text-center font-semibold text-black"
            >
              Project Value
            </td>
          </tr>
          <tr className="bg-[#0c1c36] text-slate-400">
            <td className="border border-[#1d3150] px-3 py-1.5 text-center">
              Work section
            </td>
            <td className="border border-[#1d3150] px-3 py-1.5 text-center">
              Work area
            </td>
            <td className="border border-[#1d3150] px-3 py-1.5 text-center">
              Work section
            </td>
            <td className="border border-[#1d3150] px-3 py-1.5 text-center">
              Work area
            </td>
          </tr>
          {rows.map((idx) => (
            <tr key={`cor-${idx}`} className="bg-[#0a1730]">
              <td className="border border-[#1d3150] px-3 py-3"></td>
              <td className="border border-[#1d3150] px-3 py-3"></td>
              <td className="border border-[#1d3150] px-3 py-3"></td>
              <td className="border border-[#1d3150] px-3 py-3"></td>
              <td className="border border-[#1d3150] px-3 py-3"></td>
              <td className="border border-[#1d3150] px-3 py-3"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ApplicationView() {
  return (
    <div className="max-w-[880px] border border-white/10 bg-[#0a1730]">
      <div className="border-b border-white/10 px-6 py-5 text-center">
        <h3 className="text-3xl font-semibold tracking-wide text-slate-100">
          COMPANY NAME
        </h3>
        <p className="mt-2 text-xs text-slate-400">
          7-8 Stratford Place, London, W1C 1AY
        </p>
        <p className="text-xs text-slate-400">Tel: 0203922477</p>
      </div>

      <div className="bg-[#1f3571] px-6 py-2 text-center text-sm font-semibold text-slate-100">
        Application For Payment
      </div>

      <div className="grid grid-cols-3 border-b border-white/10 text-xs">
        <div className="border-r border-white/10 px-3 py-2 text-slate-300">
          Application Number:
        </div>
        <div className="border-r border-white/10 px-3 py-2 text-slate-300">
          Date: 15/01/2026
        </div>
        <div className="px-3 py-2 text-slate-300">Ref No:</div>
      </div>

      <div className="grid grid-cols-[1.3fr_0.7fr_0.7fr] border-b border-white/10 text-xs">
        <div className="border-r border-white/10 px-3 py-2 text-slate-200">
          Client
        </div>
        <div className="border-r border-white/10 px-3 py-2 text-slate-200">
          Contract Site
        </div>
        <div className="px-3 py-2 text-slate-200">Contacts</div>
      </div>
      <div className="grid grid-cols-[1.3fr_0.7fr_0.7fr] border-b border-white/10">
        <div className="h-20 border-r border-white/10"></div>
        <div className="h-20 border-r border-white/10"></div>
        <div className="h-20"></div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3">
        <div className="border border-white/10">
          <div className="bg-[#16253f] px-3 py-2 text-xs font-semibold text-slate-200">
            Movement Calculations
          </div>
          <div className="grid grid-cols-[1fr_80px] text-xs">
            <div className="border-t border-r border-white/10 px-3 py-2 text-slate-300">
              Current Cumulative
            </div>
            <div className="border-t border-white/10 px-3 py-2 text-right text-slate-200">
              £ 17,600.00
            </div>
            <div className="border-t border-r border-white/10 px-3 py-2 text-slate-300">
              Previous Cumulative
            </div>
            <div className="border-t border-white/10 px-3 py-2 text-right text-slate-200">
              £ 0.00
            </div>
            <div className="border-t border-r border-white/10 bg-[#0f1d36] px-3 py-2 text-slate-100">
              Gross Movement in Period
            </div>
            <div className="border-t border-white/10 bg-[#0f1d36] px-3 py-2 text-right text-slate-100">
              £ 17,600.00
            </div>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_80px] text-xs">
            <div className="border-t border-r border-white/10 px-3 py-2 text-slate-300">
              Projected Final Account
            </div>
            <div className="border-t border-white/10 px-3 py-2 text-right text-slate-200">
              £ 16,600.00
            </div>
            <div className="border-t border-r border-white/10 px-3 py-2 text-slate-300">
              Order No
            </div>
            <div className="border-t border-white/10 px-3 py-2 text-right text-slate-200"></div>
            <div className="border-t border-r border-white/10 px-3 py-2 text-slate-300">
              Order Value
            </div>
            <div className="border-t border-white/10 px-3 py-2 text-right text-slate-200">
              £ 5,800.00
            </div>
            <div className="border-t border-r border-white/10 px-3 py-2 text-slate-300">
              Works Valued to Date
            </div>
            <div className="border-t border-white/10 px-3 py-2 text-right text-slate-200">
              15-Jan-26
            </div>
            <div className="border-t border-r border-white/10 px-3 py-2 text-slate-300">
              Payment Notice Date
            </div>
            <div className="border-t border-white/10 px-3 py-2 text-right text-slate-200">
              8-Feb-26
            </div>
            <div className="border-t border-r border-white/10 px-3 py-2 text-slate-300">
              Final Date for Payment
            </div>
            <div className="border-t border-white/10 px-3 py-2 text-right text-slate-200">
              22-Feb-26
            </div>
          </div>
        </div>

        <div className="border border-white/10">
          <div className="bg-[#16253f] px-3 py-2 text-xs font-semibold text-slate-200">
            Details of Application
          </div>
          <div className="px-3 py-2 text-xs text-slate-400">
            Breakdown of Application
          </div>
          <div className="grid grid-cols-[1fr_80px] text-xs">
            <div className="border-t border-r border-white/10 px-3 py-2 text-slate-300">
              Contract Works
            </div>
            <div className="border-t border-white/10 px-3 py-2 text-right text-slate-200">
              £ 5,000.00
            </div>
            <div className="border-t border-r border-white/10 px-3 py-2 text-slate-300">
              Variations
            </div>
            <div className="border-t border-white/10 px-3 py-2 text-right text-slate-200">
              £ 12,000.00
            </div>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_80px] text-xs">
            <div className="border-t border-r border-white/10 bg-[#0f1d36] px-3 py-2 text-slate-100">
              Cumulative Gross Total
            </div>
            <div className="border-t border-white/10 bg-[#0f1d36] px-3 py-2 text-right text-slate-100">
              £ 17,600.00
            </div>
            <div className="border-t border-r border-white/10 px-3 py-2 text-slate-300">
              Less Retention
            </div>
            <div className="border-t border-white/10 px-3 py-2 text-right text-slate-200">
              2.5%
            </div>
            <div className="border-t border-r border-white/10 px-3 py-2 text-slate-300">
              Less Discount
            </div>
            <div className="border-t border-white/10 px-3 py-2 text-right text-slate-200">
              0.0%
            </div>
            <div className="border-t border-r border-white/10 px-3 py-2 text-slate-300">
              Cumulative Net Application
            </div>
            <div className="border-t border-white/10 px-3 py-2 text-right text-slate-200">
              £ 17,160.00
            </div>
            <div className="border-t border-r border-white/10 bg-[#1f3571] px-3 py-2 text-sm font-semibold text-slate-100">
              Net Payment Due
            </div>
            <div className="border-t border-white/10 bg-[#1f3571] px-3 py-2 text-right text-sm font-semibold text-slate-100">
              £ 17,160.00
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-[10px] leading-4 text-slate-400">
        <p>
          If you do not agree with any items within our application, please
          forward full details within five days of the date of this Application.
        </p>
        <p className="mt-2">
          Please note that in compliance with the Housing Grants Construction
          and Regeneration Act 1996, it is a statutory requirement that you
          advise us within a period of 5 days from the due date of the
          Application of any amount proposed to be withheld from the gross value
          applied for, and the ground for withholding. If there are more than
          one ground, each ground and the amount attributable to it must be
          detailed.
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  const [selectedProject, setSelectedProject] = useState("project-a")
  const [activeTab, setActiveTab] = useState<MonthlyTab>("variation-summary")

  const content = useMemo(() => {
    if (activeTab === "variation-summary") {
      return <VariationSummaryView />
    }

    if (activeTab === "white-card") {
      return <WhiteCardView />
    }

    return <ApplicationView />
  }, [activeTab])

  return (
    <div className="w-full space-y-6 p-6">
      <h2 className="text-2xl font-semibold">Monthly Application</h2>

      <div className="max-w-[430px] space-y-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Select Project
          </label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="border-white/10 bg-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900">
              <SelectItem value="project-a">Project A</SelectItem>
              <SelectItem value="project-b">Project B</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
      </div>

      <SummaryBox />

      {content}
    </div>
  )
}
